import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testo = body.testo

    if (!testo) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const prompt = 'Crea uno schema riassuntivo gerarchico in italiano basato su questo testo di appunti universitari. Identifica il titolo principale, poi 3-5 sottotemi, e per ognuno 2-4 punti chiave. Rispondi SOLO con un oggetto JSON in questo formato esatto, senza testo aggiuntivo: {"titolo": "titolo principale", "sezioni": [{"sottotema": "nome sottotema", "punti": ["punto 1", "punto 2"]}]}. Testo appunti: ' + testo

    const apiKey = process.env.GEMINI_API_KEY
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const data = await geminiResponse.json()
    const textResult = data.candidates[0].content.parts[0].text
    const cleanedText = textResult.replace('```json', '').replace('```', '').trim()
    const schema = JSON.parse(cleanedText)

    return NextResponse.json({ schema: schema })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione dello schema' }, { status: 500 })
  }
}
