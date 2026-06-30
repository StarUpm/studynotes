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

    const transcriptResponse = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`
    )
    const html = await transcriptResponse.text()

    const titleMatch = html.match(/<title>(.*?)<\/title>/)
    const titoloVideo = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Video YouTube'

    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/)
    if (!captionsMatch) {
      return NextResponse.json({ error: 'Questo video non ha sottotitoli disponibili. Prova con un video che abbia i sottotitoli attivati (CC).' }, { status: 400 })
    }

    let captionUrl = ''
    try {
      const tracks = JSON.parse(captionsMatch[1])
      const italianTrack = tracks.find((t: any) => t.languageCode === 'it')
      const englishTrack = tracks.find((t: any) => t.languageCode === 'en')
      const track = italianTrack || englishTrack || tracks[0]
      captionUrl = track.baseUrl
    } catch (e) {
      return NextResponse.json({ error: 'Errore nel leggere i sottotitoli del video' }, { status: 500 })
    }

    if (!captionUrl) {
      return NextResponse.json({ error: 'Nessun sottotitolo trovato per questo video' }, { status: 400 })
    }

    const captionResponse = await fetch(captionUrl)
    const captionXml = await captionResponse.text()

    const textMatches = captionXml.match(/<text[^>]*>([^<]*)<\/text>/g) || []
    const trascrizioneGrezza = textMatches
      .map(t => t.replace(/<[^>]*>/g, ''))
      .join(' ')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim()

    if (!trascrizioneGrezza || trascrizioneGrezza.length < 20) {
      return NextResponse.json({ error: 'Trascrizione vuota o troppo corta' }, { status: 400 })
    }

    const prompt = `Questo è il testo trascritto automaticamente da un video YouTube intitolato "${titoloVideo}". Riorganizzalo in italiano in modo chiaro e leggibile:

1. Correggi la punteggiatura e la struttura delle frasi
2. Organizza il contenuto in paragrafi logici
3. Alla fine aggiungi una sezione "Punti chiave" con i concetti principali

Testo grezzo: ${trascrizioneGrezza.substring(0, 8000)}`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    })

    if (!groqResponse.ok) {
      return NextResponse.json({ error: 'Errore nella rielaborazione del testo' }, { status: 500 })
    }

    const data = await groqResponse.json()
    const testo = data.choices?.[0]?.message?.content || trascrizioneGrezza

    return NextResponse.json({ testo, videoId, titolo: titoloVideo })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
