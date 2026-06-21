import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.daily.co/v1/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.DAILY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: process.env.NEXT_PUBLIC_SITE_URL + '/api/daily-webhook',
        eventTypes: ['participant.joined', 'participant.left']
      })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella registrazione webhook' }, { status: 500 })
  }
}
