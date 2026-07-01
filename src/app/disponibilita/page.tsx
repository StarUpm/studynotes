'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Slot = { id: string; giorno_settimana: number; ora_inizio: string; ora_fine: string }

const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const ORE = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

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
  const [userId, setUserId] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const uid = userData.data.user.id
      setUserId(uid)
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
    if (oraInizio >= oraFine) { setError('L\'ora di fine deve essere dopo quella di inizio'); return }
    if (slots.some(s => s.giorno_settimana === giornoSelezionato && s.ora_inizio === oraInizio && s.ora_fine === oraFine)) { setError('Questo slot esiste già'); return }
    setSalvando(true); setError('')
    const result = await supabase.from('disponibilita_tutor').insert({ tutor_id: userId, giorno_settimana: giornoSelezionato, ora_inizio: oraInizio, ora_fine: oraFine })
    if (result.error) { setError('Errore: ' + result.error.message) }
    else { setSuccess('Slot aggiunto!'); setTimeout(() => setSuccess(''), 2000); await caricaSlots(userId) }
    setSalvando(false)
  }

  async function eliminaSlot(id: string) {
    await supabase.from('disponibilita_tutor').delete().eq('id', id)
    await caricaSlots(userId)
  }

  const slotPerGiorno = GIORNI.map((_, i) => slots.filter(s => s.giorno_settimana === i))
  const selectStyle = { border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  if (!isTutor) return (
    <Layout>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <i className="ti ti-calendar-off" style={{ fontSize: 36, color: '#D4D4D8', display: 'block', marginBottom: 16 }} />
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#18181B', margin: '0 0 8px' }}>Attiva prima il profilo tutor</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 24px' }}>Per gestire la disponibilità devi essere un tutor</p>
        <button onClick={() => router.push('/diventa-tutor')} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          Attiva profilo tutor
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/profilo-utente')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: 13, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Torna al profilo
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>La mia disponibilità</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 28px' }}>Imposta gli orari in cui sei disponibile per le ripetizioni</p>

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Aggiungi slot</h2>
          {error && <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}><p style={{ fontSize: 12, color: '#D85A30', margin: 0 }}>{error}</p></div>}
          {success && <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}><p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>{success}</p></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Giorno</label>
              <select value={giornoSelezionato} onChange={e => setGiornoSelezionato(parseInt(e.target.value))} style={{ ...selectStyle, width: '100%' }}>
                {GIORNI.map((g, i) => <option key={i} value={i}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Dalle</label>
              <select value={oraInizio} onChange={e => setOraInizio(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                {ORE.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Alle</label>
              <select value={oraFine} onChange={e => setOraFine(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                {ORE.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={aggiungiSlot} disabled={salvando} style={{ background: '#18181B', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: salvando ? 0.7 : 1, whiteSpace: 'nowrap' }}>
              + Aggiungi
            </button>
          </div>
        </div>

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Disponibilità settimanale</h2>
          {slots.length === 0 && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Nessuno slot aggiunto ancora</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {GIORNI.map(function(giorno, i) {
              const slotsGiorno = slotPerGiorno[i]
              if (slotsGiorno.length === 0) return null
              return (
                <div key={i}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#71717A', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.3 }}>{giorno}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {slotsGiorno.map(function(slot) {
                      return (
                        <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F4F5', borderRadius: 8, padding: '6px 12px' }}>
                          <span style={{ fontSize: 12, color: '#18181B' }}>{slot.ora_inizio} — {slot.ora_fine}</span>
                          <button onClick={() => eliminaSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                            <i className="ti ti-x" style={{ fontSize: 13, color: '#A1A1AA' }} />
                          </button>
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
