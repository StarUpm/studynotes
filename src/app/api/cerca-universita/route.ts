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

    const apiKey = process.env.GROQ_API_KEY
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    })

    if (!groqResponse.ok) {
      const errData = await groqResponse.json()
      console.error('Groq error:', errData)
      return NextResponse.json({ risultati: [] })
    }

    const data = await groqResponse.json()
    const testo = data.choices?.[0]?.message?.content || '[]'

    let risultati: string[] = []
    try {
      const pulito = testo.replace(/```json/g, '').replace(/```/g, '').trim()
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
