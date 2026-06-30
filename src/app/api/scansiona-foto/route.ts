import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { immagine, mimeType } = body

    if (!immagine) {
      return NextResponse.json({ error: 'Immagine mancante' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Leggi e trascrivi tutto il testo presente in questa immagine di appunti scritti a mano o stampati.

Istruzioni:
- Trascrivi fedelmente tutto il testo che riesci a leggere
- Mantieni la struttura originale (titoli, elenchi, sottotitoli)
- Se ci sono formule matematiche, trascrivile nel modo più leggibile possibile
- Se ci sono schemi o diagrammi, descrivi brevemente cosa rappresentano
- Correggi eventuali errori ortografici ovvi
- Usa la formattazione markdown dove appropriato

Restituisci solo il testo trascritto senza commenti aggiuntivi.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${immagine}`
                }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    })

    if (!groqResponse.ok) {
      const errData = await groqResponse.json()
      return NextResponse.json({ error: 'Errore API: ' + (errData.error?.message || 'sconosciuto') }, { status: 500 })
    }

    const data = await groqResponse.json()
    const testo = data.choices?.[0]?.message?.content || ''

    if (!testo) {
      return NextResponse.json({ error: 'Non è stato possibile leggere il testo dall\'immagine' }, { status: 500 })
    }

    return NextResponse.json({ testo })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
