import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testo = body.testo
    if (!testo) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const prompt = 'Genera 8 flashcard in italiano basate su questo testo di appunti universitari. Ogni flashcard deve avere una domanda/termine sul fronte e una risposta/definizione sul retro. Rispondi SOLO con un array JSON in questo formato esatto, senza testo aggiuntivo: [{"fronte": "testo", "retro": "testo"}]. Testo appunti: ' + testo

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
    const flashcard = JSON.parse(cleanedText)

    return NextResponse.json({ flashcard: flashcard })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione delle flashcard: ' + String(error) }, { status: 500 })
  }
}
