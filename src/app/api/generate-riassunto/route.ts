import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testo } = body

    if (!testo || testo.length < 50) {
      return NextResponse.json({ error: 'Testo troppo corto' }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Crea un riassunto strutturato in italiano di questo testo universitario. 
              Il riassunto deve:
              - Essere diviso in sezioni con titoli chiari
              - Evidenziare i concetti chiave
              - Essere circa 1/4 del testo originale
              - Essere scritto in modo chiaro e accessibile
              - Includere una sezione "Punti chiave" alla fine con i 5 concetti più importanti
              
              Testo: ${testo.substring(0, 10000)}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000
          }
        })
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Errore API Gemini' }, { status: 500 })
    }

    const data = await response.json()
    const riassunto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({ riassunto })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
