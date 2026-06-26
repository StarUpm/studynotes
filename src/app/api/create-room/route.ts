import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessioneId = body.sessioneId

    const response = await fetch('https://api.whereby.dev/v1/meetings', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.WHEREBY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fields: ['hostRoomUrl']
      })
    })

    const data = await response.json()

    if (data.roomUrl) {
      return NextResponse.json({
        url: data.roomUrl,
        hostUrl: data.hostRoomUrl,
        roomName: data.meetingId
      })
    } else {
      return NextResponse.json({ error: 'Errore nella creazione della stanza' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
