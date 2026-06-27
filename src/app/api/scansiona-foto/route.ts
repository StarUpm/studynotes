import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { immagine, mimeType } = body

    if (!immagine) {
      return NextResponse.json({ error: 'Immagine mancante' }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType || 'image/jpeg',
                  data: immagine
                }
              },
              {
                text: `Leggi e trascrivi tutto il testo presente in questa immagine di appunti scritti a mano o stampati.
                
                Istruzioni:
                - Trascrivi fedelmente tutto il testo che riesci a leggere
                - Mantieni la struttura originale (titoli, elenchi, sottotitoli)
                - Se ci sono formule matematiche, trascrivile nel modo più leggibile possibile
                - Se ci sono schemi o diagrammi, descrivi brevemente cosa rappresentano
                - Correggi eventuali errori ortografici ovvi
                - Usa la formattazione markdown dove appropriato (# per titoli, - per elenchi)
                
                Restituisci solo il testo trascritto senza commenti aggiuntivi.`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000
          }
        })
      }
    )

    if (!response.ok) {
      const errData = await response.json()
      return NextResponse.json({ error: 'Errore API: ' + (errData.error?.message || 'sconosciuto') }, { status: 500 })
    }

    const data = await response.json()
    const testo = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!testo) {
      return NextResponse.json({ error: 'Non è stato possibile leggere il testo dall\'immagine' }, { status: 500 })
    }

    return NextResponse.json({ testo })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
