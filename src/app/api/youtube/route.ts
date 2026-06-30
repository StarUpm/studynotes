import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL mancante' }, { status: 400 })
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'URL YouTube non valido' }, { status: 400 })
    }

    const videoId = videoIdMatch[1]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                file_data: {
                  mime_type: 'video/*',
                  file_uri: `https://www.youtube.com/watch?v=${videoId}`
                }
              },
              {
                text: `Trascrivi e riassumi il contenuto di questo video in italiano. 
                Organizza il contenuto in:
                1. Trascrizione completa (o riassunto fedele se troppo lungo)
                2. Concetti principali
                3. Punti chiave da ricordare
                
                Restituisci solo il testo senza commenti aggiuntivi.`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4000
          }
        })
      }
    )

    if (!response.ok) {
      const errData = await response.json()
      return NextResponse.json({ error: 'Errore nel processare il video: ' + (errData.error?.message || 'sconosciuto') }, { status: 500 })
    }

    const data = await response.json()
    const testo = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!testo) {
      return NextResponse.json({ error: 'Non è stato possibile estrarre il contenuto dal video' }, { status: 500 })
    }

    return NextResponse.json({ testo, videoId })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
