import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessioneId = body.sessioneId
    const roomName = 'studynotes-sessione-' + sessioneId

    const url = 'https://meet.jit.si/' + roomName

    return NextResponse.json({ url: url, roomName: roomName })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
