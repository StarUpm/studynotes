import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const utente_id = formData.get('utente_id') as string
    const titolo = formData.get('titolo') as string
    const materia = formData.get('materia') as string

    if (!file || !utente_id) {
      return NextResponse.json({ error: 'File e utente_id richiesti' }, { status: 400 })
    }

    const trascrizione = await supabase.from('trascrizioni').insert({
      utente_id,
      titolo: titolo || 'Trascrizione audio',
      materia: materia || '',
      stato: 'in_elaborazione'
    }).select().single()

    if (trascrizione.error) {
      return NextResponse.json({ error: trascrizione.error.message }, { status: 500 })
    }

    const trascrizione_id = trascrizione.data.id

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const formDataGemini = new FormData()
    const blob = new Blob([buffer], { type: file.type })
    formDataGemini.append('file', blob, file.name)

    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Command': 'start, upload, finalize',
          'X-Goog-Upload-Header-Content-Length': buffer.length.toString(),
          'X-Goog-Upload-Header-Content-Type': file.type,
        },
        body: blob
      }
    )

    if (!uploadResponse.ok) {
      await supabase.from('trascrizioni').update({ stato: 'errore' }).eq('id', trascrizione_id)
      return NextResponse.json({ error: 'Errore nel caricamento audio' }, { status: 500 })
    }

    const uploadData = await uploadResponse.json()
    const fileUri = uploadData.file?.uri

    if (!fileUri) {
      await supabase.from('trascrizioni').update({ stato: 'errore' }).eq('id', trascrizione_id)
      return NextResponse.json({ error: 'Errore nel caricamento audio' }, { status: 500 })
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                file_data: {
                  mime_type: file.type,
                  file_uri: fileUri
                }
              },
              {
                text: 'Trascrivi questo audio in italiano nel modo più accurato possibile. Mantieni la punteggiatura corretta e organizza il testo in paragrafi logici. Rimuovi i rumori di fondo e le interruzioni. Restituisci solo il testo trascritto senza commenti aggiuntivi.'
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8000
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      await supabase.from('trascrizioni').update({ stato: 'errore' }).eq('id', trascrizione_id)
      return NextResponse.json({ error: 'Errore nella trascrizione AI' }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    const testo = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    await supabase.from('trascrizioni').update({
      testo_trascritto: testo,
      stato: 'completata'
    }).eq('id', trascrizione_id)

    return NextResponse.json({ ok: true, id: trascrizione_id, testo })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
