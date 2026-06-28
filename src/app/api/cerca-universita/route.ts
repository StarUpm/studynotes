import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, tipo } = body

    if (!query || query.length < 2) {
      return NextResponse.json({ risultati: [] })
    }

    const prompt = tipo === 'materia'
      ? `Elenca 8 materie universitarie o scolastiche reali che corrispondono a "${query}". 
         Includi materie di qualsiasi università italiana o mondiale.
         Rispondi SOLO con un array JSON di stringhe, senza spiegazioni.
         Esempio: ["Analisi Matematica 1", "Analisi Matematica 2", "Analisi Funzionale"]`
      : `Elenca 8 università o istituti scolastici reali (italiani o internazionali) che corrispondono a "${query}".
         Includi università pubbliche, private, politecnici, accademie e scuole superiori.
         Rispondi SOLO con un array JSON di stringhe con il nome completo ufficiale, senza spiegazioni.
         Esempio: ["Università degli Studi di Milano", "Università degli Studi di Milano-Bicocca"]`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
        })
      }
    )

    if (!response.ok) {
      return NextResponse.json({ risultati: [] })
    }

    const data = await response.json()
    const testo = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const pulito = testo.replace(/```json|```/g, '').trim()
    const risultati = JSON.parse(pulito)

    return NextResponse.json({ risultati: Array.isArray(risultati) ? risultati : [] })
  } catch (error) {
    return NextResponse.json({ risultati: [] })
  }
}
