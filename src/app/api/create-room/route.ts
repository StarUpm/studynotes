import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessioneId = body.sessioneId
    const roomName = 'sessione-' + sessioneId

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.DAILY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false
        }
      })
    })

    const data = await response.json()

    if (data.url) {
      return NextResponse.json({ url: data.url, roomName: roomName })
    } else {
      return NextResponse.json({ error: 'Errore nella creazione della stanza' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
