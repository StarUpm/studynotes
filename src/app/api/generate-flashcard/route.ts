import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testo = body.testo

    if (!testo) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const prompt = 'Genera 8 flashcard in italiano basate su questo testo di appunti universitari. Ogni flashcard ha un concetto/termine sul fronte e la spiegazione sul retro. Rispondi SOLO con un array JSON in questo formato esatto, senza testo aggiuntivo: [{"fronte": "termine o domanda breve", "retro": "spiegazione concisa"}]. Testo appunti: ' + testo

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
    const flashcard = JSON.parse(cleanedText)

    return NextResponse.json({ flashcard: flashcard })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione delle flashcard' }, { status: 500 })
  }
}
