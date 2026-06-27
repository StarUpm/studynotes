'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Slot = {
  id: string
  giorno_settimana: number
  ora_inizio: string
  ora_fine: string
}

const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const ORE = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

export default function Disponibilita() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [giornoSelezionato, setGiornoSelezionato] = useState(1)
  const [oraInizio, setOraInizio] = useState('09:00')
  const [oraFine, setOraFine] = useState('10:00')
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isTutor, setIsTutor] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const uid = userData.data.user.id
      const profilo = await supabase.from('profiles').select('is_tutor').eq('id', uid).single()
      if (!profilo.data?.is_tutor) { setIsTutor(false); setLoading(false); return }
      setIsTutor(true)
      await caricaSlots(uid)
      setLoading(false)
    }
    init()
  }, [router])

  async function caricaSlots(uid: string) {
    const result = await supabase.from('disponibilita_tutor').select('*').eq('tutor_id', uid).order('giorno_settimana').order('ora_inizio')
    if (result.data) setSlots(result.data)
  }

  async function aggiungiSlot() {
    if (oraInizio >= oraFine) { setError('L\'ora di fine deve essere dopo l\'ora di inizio'); return }
    setSalvando(true)
    setError('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    const uid = userData.data.user.id

    const giaEsiste = slots.some(function(s) {
      return s.giorno_settimana === giornoSelezionato && s.ora_inizio === oraInizio && s.ora_fine === oraFine
    })
    if (giaEsiste) { setError('Questo slot esiste già'); setSalvando(false); return }

    const result = await supabase.from('disponibilita_tutor').insert({
      tutor_id: uid,
      giorno_settimana: giornoSelezionato,
      ora_inizio: oraInizio,
      ora_fine: oraFine
    })
    if (result.error) { setError('Errore: ' + result.error.message) }
    else { setSuccess('Slot aggiunto!'); setTimeout(() => setSuccess(''), 2000); await caricaSlots(uid) }
    setSalvando(false)
  }

  async function eliminaSlot(id: string) {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    await supabase.from('disponibilita_tutor').delete().eq('id', id)
    await caricaSlots(userData.data.user.id)
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  if (!isTutor) return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🏫</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Diventa tutor prima</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Per gestire la disponibilità devi prima attivare il profilo tutor</p>
        <button onClick={() => router.push('/diventa-tutor')} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Attiva profilo tutor
        </button>
      </div>
    </Layout>
  )

  const slotPerGiorno = GIORNI.map(function(_, i) {
    return slots.filter(function(s) { return s.giorno_settimana === i })
  })

  const selectStyle = { border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: 'white', color: '#374151' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/profilo-utente')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna al profilo</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>📅 La mia disponibilità</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Imposta gli orari in cui sei disponibile per le ripetizioni</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Aggiungi slot di disponibilità</h2>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: 13, marginBottom: 12, background: '#ECFDF5', padding: '10px 14px', borderRadius: 8 }}>✓ {success}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Giorno</p>
              <select value={giornoSelezionato} onChange={e => setGiornoSelezionato(parseInt(e.target.value))} style={{ ...selectStyle, width: '100%' }}>
                {GIORNI.map(function(g, i) {
                  return <option key={i} value={i}>{g}</option>
                })}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Dalle</p>
              <select value={oraInizio} onChange={e => setOraInizio(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                {ORE.map(function(o) { return <option key={o} value={o}>{o}</option> })}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Alle</p>
              <select value={oraFine} onChange={e => setOraFine(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                {ORE.map(function(o) { return <option key={o} value={o}>{o}</option> })}
              </select>
            </div>
            <button
              onClick={aggiungiSlot}
              disabled={salvando}
              style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: salvando ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              + Aggiungi
            </button>
          </div>
        </div>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>La tua disponibilità settimanale</h2>

          {slots.length === 0 && (
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Nessuno slot aggiunto ancora — aggiungi i tuoi orari disponibili!</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {GIORNI.map(function(giorno, i) {
              const slotsGiorno = slotPerGiorno[i]
              if (slotsGiorno.length === 0) return null
              return (
                <div key={i}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{giorno}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {slotsGiorno.map(function(slot) {
                      return (
                        <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 8, padding: '6px 12px' }}>
                          <span style={{ fontSize: 13, color: '#185FA5', fontWeight: 500 }}>{slot.ora_inizio} — {slot.ora_fine}</span>
                          <button onClick={() => eliminaSlot(slot.id)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
