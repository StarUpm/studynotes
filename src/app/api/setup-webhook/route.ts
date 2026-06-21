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
        eventTypes: ['participant.joined', 'participant.left'],
        domain: 'cloud-59eb478ffb2841e9b707e8321386be08'
      })
    })

    const data = await response.json()
    const status = response.status
    return NextResponse.json({ status: status, data: data })
  } catch (error) {
    return NextResponse.json({ error: 'Errore: ' + String(error) }, { status: 500 })
  }
}
