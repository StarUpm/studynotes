import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { utente_id, tipo, titolo, messaggio, link } = body

    if (!utente_id || !tipo || !titolo) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('notifiche').insert({
      utente_id,
      tipo,
      titolo,
      messaggio: messaggio || '',
      link: link || '',
      letta: false
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
