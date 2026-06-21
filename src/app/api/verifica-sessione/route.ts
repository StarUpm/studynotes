import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessioneId = body.sessioneId
    const roomName = 'sessione-' + sessioneId

    const response = await fetch('https://api.daily.co/v1/meetings?room=' + roomName, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.DAILY_API_KEY
      }
    })

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ completata: false, messaggio: 'Nessuna chiamata trovata per questa sessione' })
    }

    const meeting = data.data[0]
    const durataSecondi = meeting.duration || 0
    const numeroPartecipanti = meeting.max_participants || 0
    const durataMinuti = Math.floor(durataSecondi / 60)

    const entrambiPresenti = numeroPartecipanti >= 2 && durataMinuti >= 5

    if (entrambiPresenti) {
      await supabaseAdmin.from('tutoring_sessions').update({
        stato: 'completata',
        pagamento_rilasciato: true,
        minuti_tutor: durataMinuti,
        minuti_studente: durataMinuti
      }).eq('id', sessioneId)

      return NextResponse.json({ completata: true, durataMinuti: durataMinuti, partecipanti: numeroPartecipanti })
    } else {
      return NextResponse.json({ completata: false, messaggio: 'La chiamata non ha raggiunto i requisiti minimi (5 minuti con entrambi presenti)', durataMinuti: durataMinuti, partecipanti: numeroPartecipanti })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella verifica' }, { status: 500 })
  }
}
