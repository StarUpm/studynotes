import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, tipo } = body

    if (!query || query.length < 2) {
      return NextResponse.json({ risultati: [] })
    }

    const prompt = tipo === 'materia'
      ? `Elenca 8 materie universitarie o scolastiche reali che corrispondono a "${query}". Rispondi SOLO con un array JSON valido di stringhe, senza markdown, senza backtick, senza spiegazioni. Solo il JSON puro. Esempio: ["Analisi Matematica 1","Analisi Matematica 2"]`
      : `Elenca 8 università o istituti scolastici reali italiani o internazionali che corrispondono a "${query}". Rispondi SOLO con un array JSON valido di stringhe, senza markdown, senza backtick, senza spiegazioni. Solo il JSON puro. Esempio: ["Università degli Studi di Milano","Politecnico di Milano"]`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
        })
      }
    )

    if (!response.ok) {
      console.error('Gemini error:', response.status)
      return NextResponse.json({ risultati: [] })
    }

    const data = await response.json()
    const testo = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    
    let risultati: string[] = []
    try {
      const pulito = testo
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      risultati = JSON.parse(pulito)
      if (!Array.isArray(risultati)) risultati = []
    } catch (e) {
      const matches = testo.match(/"([^"]+)"/g)
      if (matches) risultati = matches.map((m: string) => m.replace(/"/g, '')).slice(0, 8)
    }

    return NextResponse.json({ risultati })
  } catch (error) {
    console.error('Errore cerca-universita:', error)
    return NextResponse.json({ risultati: [] })
  }
}
