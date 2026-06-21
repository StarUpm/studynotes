import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    const roomName = event.room
    const eventType = event.type

    if (!roomName) {
      return NextResponse.json({ ok: true })
    }

    const sessioniResult = await supabaseAdmin
      .from('tutoring_sessions')
      .select('*')
      .eq('daily_room_name', roomName)
      .single()

    if (!sessioniResult.data) {
      return NextResponse.json({ ok: true })
    }

    const sessione = sessioniResult.data

    if (eventType === 'participant.joined') {
      const userId = event.payload && event.payload.user_id

      if (userId === sessione.tutor_id) {
        await supabaseAdmin.from('tutoring_sessions').update({ tutor_presente: true }).eq('id', sessione.id)
      }
      if (userId === sessione.studente_id) {
        await supabaseAdmin.from('tutoring_sessions').update({ studente_presente: true }).eq('id', sessione.id)
      }
    }

    if (eventType === 'participant.left') {
      const userId = event.payload && event.payload.user_id
      const durataSecondi = event.payload && event.payload.duration ? event.payload.duration : 0
      const durataMinuti = Math.floor(durataSecondi / 60)

      if (userId === sessione.tutor_id) {
        await supabaseAdmin.from('tutoring_sessions').update({ minuti_tutor: durataMinuti }).eq('id', sessione.id)
      }
      if (userId === sessione.studente_id) {
        await supabaseAdmin.from('tutoring_sessions').update({ minuti_studente: durataMinuti }).eq('id', sessione.id)
      }

      const aggiornata = await supabaseAdmin
        .from('tutoring_sessions')
        .select('*')
        .eq('id', sessione.id)
        .single()

      if (aggiornata.data) {
        const entrambiPresenti = aggiornata.data.minuti_tutor >= 10 && aggiornata.data.minuti_studente >= 10
        if (entrambiPresenti && !aggiornata.data.pagamento_rilasciato) {
          await supabaseAdmin.from('tutoring_sessions').update({
            stato: 'completata',
            pagamento_rilasciato: true
          }).eq('id', sessione.id)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore webhook' }, { status: 500 })
  }
}
