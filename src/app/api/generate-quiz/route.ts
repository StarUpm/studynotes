import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testo = body.testo
    if (!testo) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const prompt = 'Genera 5 domande a risposta multipla in italiano basate su questo testo di appunti universitari. Per ogni domanda fornisci 4 opzioni e indica quale e corretta. Rispondi SOLO con un array JSON in questo formato esatto, senza testo aggiuntivo: [{"domanda": "testo", "opzioni": ["a","b","c","d"], "risposta_corretta": 0, "spiegazione": "testo"}]. Testo appunti: ' + testo

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
    const quiz = JSON.parse(cleanedText)

    return NextResponse.json({ quiz: quiz })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella generazione del quiz: ' + String(error) }, { status: 500 })
  }
}
