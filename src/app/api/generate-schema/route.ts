import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testo = body.testo
    if (!testo) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const prompt = 'Crea uno schema riassuntivo gerarchico in italiano basato su questo testo di appunti universitari. Identifica il titolo principale, poi 3-5 sottotemi, e per ognuno 2-4 punti chiave. Rispondi SOLO con un oggetto JSON in questo formato esatto, senza testo aggiuntivo: {"titolo": "titolo principale", "sezioni": [{"sottotema": "nome sottotema", "punti": ["punto 1", "punto 2"]}]}. Testo appunti: ' + testo

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
        temperature: 0.7
      })
    })

    const data = await groqResponse.json()
    const textResult = data.choices[0].message.content
    const cleanedText = textResult.replace('```json', '').replace('```', '').trim()
    const schema = JSON.parse(cleanedText)

    return NextResponse.json({ schema: schema })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione dello schema: ' + String(error) }, { status: 500 })
  }
}
