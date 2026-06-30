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

    const groqFormData = new FormData()
    groqFormData.append('file', file)
    groqFormData.append('model', 'whisper-large-v3')
    groqFormData.append('language', 'it')
    groqFormData.append('response_format', 'text')

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: groqFormData
    })

    if (!groqResponse.ok) {
      await supabase.from('trascrizioni').update({ stato: 'errore' }).eq('id', trascrizione_id)
      const errText = await groqResponse.text()
      return NextResponse.json({ error: 'Errore nella trascrizione: ' + errText }, { status: 500 })
    }

    const testo = await groqResponse.text()

    await supabase.from('trascrizioni').update({
      testo_trascritto: testo,
      stato: 'completata'
    }).eq('id', trascrizione_id)

    return NextResponse.json({ ok: true, id: trascrizione_id, testo })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
