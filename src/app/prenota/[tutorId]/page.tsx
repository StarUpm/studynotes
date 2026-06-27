'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Slot = {
  id: string
  giorno_settimana: number
  ora_inizio: string
  ora_fine: string
}

const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

export default function Prenota() {
  const [tutor, setTutor] = useState<any>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotSelezionato, setSlotSelezionato] = useState<Slot | null>(null)
  const [data, setData] = useState('')
  const [materia, setMateria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const tutorId = params.tutorId as string

  useEffect(() => {
    async function caricaDati() {
      const [tutorResult, slotsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', tutorId).single(),
        supabase.from('disponibilita_tutor').select('*').eq('tutor_id', tutorId).order('giorno_settimana').order('ora_inizio')
      ])
      if (tutorResult.data) setTutor(tutorResult.data)
      if (slotsResult.data) setSlots(slotsResult.data)
    }
    caricaDati()
  }, [tutorId])

  function nomeVisibile() {
    if (!tutor) return ''
    if (tutor.nome && tutor.cognome) return tutor.nome + ' ' + tutor.cognome
    if (tutor.nome) return tutor.nome
    return tutor.email
  }

  function getDataPerGiorno(giornoSettimana: number) {
    const oggi = new Date()
    const giornoOggi = oggi.getDay()
    let diff = giornoSettimana - giornoOggi
    if (diff <= 0) diff += 7
    const data = new Date(oggi)
    data.setDate(oggi.getDate() + diff)
    return data.toISOString().split('T')[0]
  }

  async function confermaPrenotazione() {
    if (!materia) { setError('Inserisci la materia'); return }
    if (!slotSelezionato && !data) { setError('Seleziona uno slot o inserisci una data'); return }
    setLoading(true)
    setError('')

    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { setError('Devi accedere prima'); setLoading(false); return }
    const uid = userData.data.user.id

    const dataFinale = slotSelezionato ? getDataPerGiorno(slotSelezionato.giorno_settimana) : data
    const oraFinale = slotSelezionato ? slotSelezionato.ora_inizio : '09:00'

    const result = await supabase.from('tutoring_sessions').insert({
      tutor_id: tutorId,
      studente_id: uid,
      materia,
      data_ora: dataFinale + 'T' + oraFinale + ':00',
      durata_minuti: 60,
      prezzo: tutor ? tutor.tariffa_oraria : 0,
      stato: 'pending'
    })

    if (result.error) {
      setError('Errore: ' + result.error.message)
    } else {
      await fetch('/api/notifica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utente_id: tutorId,
          tipo: 'prenotazione',
          titolo: 'Nuova richiesta di sessione',
          messaggio: 'Hai una nuova richiesta per ' + materia + ' il ' + new Date(dataFinale).toLocaleDateString('it-IT'),
          link: '/sessioni'
        })
      })
      setSuccess(true)
      setTimeout(() => router.push('/sessioni'), 1500)
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 12, background: 'white' } as React.CSSProperties

  const slotPerGiorno = GIORNI.map(function(_, i) {
    return slots.filter(function(s) { return s.giorno_settimana === i })
  })

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/tutor')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna ai tutor</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>📅 Prenota ripetizione</h1>
        {tutor && <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Con {nomeVisibile()} · € {tutor.tariffa_oraria?.toFixed(2)}/ora</p>}

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: 13, marginBottom: 16, background: '#ECFDF5', padding: '10px 14px', borderRadius: 8 }}>✓ Prenotazione inviata! Aspetta la conferma del tutor.</p>}

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Materia</p>
          <input type="text" placeholder="Es. Analisi Matematica" value={materia} onChange={e => setMateria(e.target.value)} style={inputStyle} />

          {slots.length > 0 ? (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Scegli uno slot disponibile</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {GIORNI.map(function(giorno, i) {
                  const slotsGiorno = slotPerGiorno[i]
                  if (slotsGiorno.length === 0) return null
                  return (
                    <div key={i}>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>{giorno}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {slotsGiorno.map(function(slot) {
                          const sel = slotSelezionato?.id === slot.id
                          return (
                            <button
                              key={slot.id}
                              onClick={() => setSlotSelezionato(sel ? null : slot)}
                              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: sel ? 'none' : '0.5px solid #e5e7eb', background: sel ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: sel ? 'white' : '#374151', fontWeight: sel ? 600 : 400 }}
                            >
                              {slot.ora_inizio} — {slot.ora_fine}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>oppure scegli una data manuale</span>
                <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
              </div>

              <input type="date" value={data} onChange={e => { setData(e.target.value); setSlotSelezionato(null) }} style={inputStyle} />
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Data e ora</p>
              <div style={{ background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: '#B45309' }}>Questo tutor non ha ancora impostato gli slot di disponibilità. Inserisci una data e ora che preferisci.</p>
              </div>
              <input type="date" value={data} onChange={e => setData(e.target.value)} style={inputStyle} />
            </div>
          )}

          {slotSelezionato && (
            <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 500 }}>
                ✓ Slot selezionato: {GIORNI[slotSelezionato.giorno_settimana]} · {slotSelezionato.ora_inizio} — {slotSelezionato.ora_fine}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                Prossimo: {new Date(getDataPerGiorno(slotSelezionato.giorno_settimana)).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          )}

          {tutor && (
            <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: '#185FA5' }}>💡 La sessione durerà 1 ora · Costo: € {tutor.tariffa_oraria?.toFixed(2)}</p>
            </div>
          )}

          <button
            onClick={confermaPrenotazione}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Prenotazione in corso...' : 'Prenota sessione'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
