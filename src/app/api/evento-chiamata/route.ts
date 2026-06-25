import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

const SOGLIA_RICONNESSIONE_SECONDI = 120
const MINUTI_MINIMI_VALIDI = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessioneId = body.sessioneId
    const ruolo = body.ruolo
    const evento = body.evento

    const sessioneResult = await supabaseAdmin
      .from('tutoring_sessions')
      .select('*')
      .eq('id', sessioneId)
      .single()

    if (!sessioneResult.data) {
      return NextResponse.json({ error: 'Sessione non trovata' }, { status: 404 })
    }

    const sessione = sessioneResult.data
    const ora = new Date()

    if (evento === 'entrato') {
      const campoEntrata = ruolo === 'tutor' ? 'tutor_entrato_at' : 'studente_entrato_at'
      await supabaseAdmin.from('tutoring_sessions').update({
        [campoEntrata]: ora.toISOString()
      }).eq('id', sessioneId)

      return NextResponse.json({ ok: true, messaggio: 'Presenza registrata' })
    }

    if (evento === 'uscito') {
      const campoEntrata = ruolo === 'tutor' ? 'tutor_entrato_at' : 'studente_entrato_at'
      const campoSecondi = ruolo === 'tutor' ? 'secondi_totali_tutor' : 'secondi_totali_studente'
      const entrataTimestamp = sessione[campoEntrata]

      if (!entrataTimestamp) {
        return NextResponse.json({ ok: true, messaggio: 'Nessuna entrata registrata' })
      }

      const entrata = new Date(entrataTimestamp)
      const secondiSessioneAttuale = Math.floor((ora.getTime() - entrata.getTime()) / 1000)
      const nuoviSecondiTotali = (sessione[campoSecondi] || 0) + secondiSessioneAttuale

      await supabaseAdmin.from('tutoring_sessions').update({
        [campoSecondi]: nuoviSecondiTotali,
        [campoEntrata]: null,
        ultima_disconnessione_at: ora.toISOString()
      }).eq('id', sessioneId)

      const aggiornata = await supabaseAdmin
        .from('tutoring_sessions')
        .select('*')
        .eq('id', sessioneId)
        .single()

      if (aggiornata.data) {
        const minutiTutor = Math.floor((aggiornata.data.secondi_totali_tutor || 0) / 60)
        const minutiStudente = Math.floor((aggiornata.data.secondi_totali_studente || 0) / 60)
        const entrambiPresentiAbbastanza = minutiTutor >= MINUTI_MINIMI_VALIDI && minutiStudente >= MINUTI_MINIMI_VALIDI

        if (entrambiPresentiAbbastanza && !aggiornata.data.pagamento_rilasciato) {
          await supabaseAdmin.from('tutoring_sessions').update({
            stato: 'completata',
            pagamento_rilasciato: true
          }).eq('id', sessioneId)

          return NextResponse.json({ ok: true, completata: true, minutiTutor: minutiTutor, minutiStudente: minutiStudente })
        }
      }

      return NextResponse.json({ ok: true, completata: false, secondiAccumulati: nuoviSecondiTotali })
    }

    return NextResponse.json({ error: 'Evento non riconosciuto' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel server: ' + String(error) }, { status: 500 })
  }
}
