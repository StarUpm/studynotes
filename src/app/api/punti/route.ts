import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

const PUNTI_PER_AZIONE: Record<string, number> = {
  'appunto_caricato': 50,
  'appunto_acquistato': 10,
  'sessione_completata': 100,
  'quiz_completato': 20,
  'flashcard_completata': 15,
  'schema_generato': 15,
  'recensione_lasciata': 10,
  'primo_accesso': 25,
}

function calcolaLivello(punti: number): number {
  if (punti < 100) return 1
  if (punti < 300) return 2
  if (punti < 600) return 3
  if (punti < 1000) return 4
  if (punti < 1500) return 5
  if (punti < 2500) return 6
  if (punti < 4000) return 7
  if (punti < 6000) return 8
  if (punti < 9000) return 9
  return 10
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { utente_id, azione } = body

    if (!utente_id || !azione) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    const puntiDaAggiungere = PUNTI_PER_AZIONE[azione] || 0
    if (puntiDaAggiungere === 0) {
      return NextResponse.json({ error: 'Azione non riconosciuta' }, { status: 400 })
    }

    const existing = await supabaseAdmin
      .from('punti_utente')
      .select('*')
      .eq('utente_id', utente_id)
      .single()

    if (existing.error || !existing.data) {
      await supabaseAdmin.from('punti_utente').insert({
        utente_id,
        punti_totali: puntiDaAggiungere,
        livello: calcolaLivello(puntiDaAggiungere),
        appunti_caricati: azione === 'appunto_caricato' ? 1 : 0,
        appunti_acquistati: azione === 'appunto_acquistato' ? 1 : 0,
        sessioni_completate: azione === 'sessione_completata' ? 1 : 0,
        quiz_completati: azione === 'quiz_completato' ? 1 : 0,
      })
    } else {
      const nuoviPunti = existing.data.punti_totali + puntiDaAggiungere
      await supabaseAdmin.from('punti_utente').update({
        punti_totali: nuoviPunti,
        livello: calcolaLivello(nuoviPunti),
        appunti_caricati: existing.data.appunti_caricati + (azione === 'appunto_caricato' ? 1 : 0),
        appunti_acquistati: existing.data.appunti_acquistati + (azione === 'appunto_acquistato' ? 1 : 0),
        sessioni_completate: existing.data.sessioni_completate + (azione === 'sessione_completata' ? 1 : 0),
        quiz_completati: existing.data.quiz_completati + (azione === 'quiz_completato' ? 1 : 0),
        updated_at: new Date().toISOString()
      }).eq('utente_id', utente_id)
    }

    await supabaseAdmin.from('storico_punti').insert({
      utente_id,
      punti: puntiDaAggiungere,
      motivo: azione
    })

    return NextResponse.json({ ok: true, punti: puntiDaAggiungere })
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const utente_id = searchParams.get('utente_id')

    if (!utente_id) {
      return NextResponse.json({ error: 'utente_id mancante' }, { status: 400 })
    }

    const result = await supabaseAdmin
      .from('punti_utente')
      .select('*')
      .eq('utente_id', utente_id)
      .single()

    if (result.error || !result.data) {
      return NextResponse.json({
        punti_totali: 0, livello: 1,
        appunti_caricati: 0, appunti_acquistati: 0,
        sessioni_completate: 0, quiz_completati: 0
      })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
