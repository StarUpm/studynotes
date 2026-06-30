import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testo } = body

    if (!testo || testo.length < 50) {
      return NextResponse.json({ error: 'Testo troppo corto' }, { status: 400 })
    }

    const prompt = `Crea un riassunto strutturato in italiano di questo testo universitario. 
Il riassunto deve:
- Essere diviso in sezioni con titoli chiari
- Evidenziare i concetti chiave
- Essere circa 1/4 del testo originale
- Essere scritto in modo chiaro e accessibile
- Includere una sezione "Punti chiave" alla fine con i 5 concetti più importanti

Testo: ${testo.substring(0, 8000)}`

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
        temperature: 0.3
      })
    })

    if (!groqResponse.ok) {
      return NextResponse.json({ error: 'Errore API Groq' }, { status: 500 })
    }

    const data = await groqResponse.json()
    const riassunto = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ riassunto })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
