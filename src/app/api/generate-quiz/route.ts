import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testo = body.testo

    if (!testo) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const prompt = 'Genera 5 domande a risposta multipla in italiano basate su questo testo di appunti universitari. Per ogni domanda fornisci 4 opzioni e indica quale e corretta. Rispondi SOLO con un array JSON in questo formato esatto, senza testo aggiuntivo: [{"domanda": "testo", "opzioni": ["a","b","c","d"], "risposta_corretta": 0, "spiegazione": "testo"}]. Testo appunti: ' + testo

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
    console.log('RISPOSTA GEMINI:', JSON.stringify(data))
    const textResult = data.candidates[0].content.parts[0].text
    const cleanedText = textResult.replace('```json', '').replace('```', '').trim()
    const quiz = JSON.parse(cleanedText)

    return NextResponse.json({ quiz: quiz })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione del quiz: ' + String(error) }, { status: 500 })
  }
}
