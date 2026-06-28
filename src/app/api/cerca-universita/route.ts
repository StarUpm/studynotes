import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, tipo } = body

    if (!query || query.length < 2) {
      return NextResponse.json({ risultati: [] })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY mancante!')
      return NextResponse.json({ risultati: [], errore: 'API key mancante' })
    }

    const prompt = tipo === 'materia'
      ? `Elenca 6 materie universitarie reali che corrispondono a "${query}". Rispondi SOLO con un array JSON di stringhe. Esempio: ["Analisi Matematica 1","Fisica 1"]`
      : `Elenca 6 università reali italiane o internazionali che corrispondono a "${query}". Rispondi SOLO con un array JSON di stringhe. Esempio: ["Università di Bologna","Politecnico di Milano"]`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    )

    const data = await response.json()
    console.log('Gemini response:', JSON.stringify(data))

    if (!response.ok) {
      return NextResponse.json({ risultati: [], errore: data.error?.message || 'Errore Gemini' })
    }

    const testo = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    console.log('Testo Gemini:', testo)

    let risultati: string[] = []
    try {
      const pulito = testo.replace(/```json/g, '').replace(/```/g, '').trim()
      risultati = JSON.parse(pulito)
      if (!Array.isArray(risultati)) risultati = []
    } catch (e) {
      const matches = testo.match(/"([^"]+)"/g)
      if (matches) risultati = matches.map((m: string) => m.replace(/"/g, '')).slice(0, 6)
    }

    return NextResponse.json({ risultati })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ risultati: [], errore: String(error) })
  }
}
