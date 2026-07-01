'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Sessione = {
  id: string
  tutor_id: string
  studente_id: string
  materia: string
  data_ora: string
  prezzo: number
  stato: string
  link_videochiamata: string
  profiles_tutor?: { nome: string; cognome: string }
  profiles_studente?: { nome: string; cognome: string }
}

export default function Sessioni() {
  const [sessioni, setSessioni] = useState<Sessione[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [tab, setTab] = useState('tutte')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      await caricaSessioni(userData.data.user.id)
    }
    init()
  }, [router])

  async function caricaSessioni(uid: string) {
    const [comeTutor, comeStudente] = await Promise.all([
      supabase.from('tutoring_sessions').select('*, profiles!tutoring_sessions_studente_id_fkey(nome, cognome)').eq('tutor_id', uid).order('data_ora', { ascending: false }),
      supabase.from('tutoring_sessions').select('*, profiles!tutoring_sessions_tutor_id_fkey(nome, cognome)').eq('studente_id', uid).order('data_ora', { ascending: false })
    ])
    const tutteSessioni = [
      ...(comeTutor.data?.map(s => ({ ...s, ruolo: 'tutor' })) || []),
      ...(comeStudente.data?.map(s => ({ ...s, ruolo: 'studente' })) || [])
    ].sort((a, b) => new Date(b.data_ora).getTime() - new Date(a.data_ora).getTime())
    setSessioni(tutteSessioni as any)
    setLoading(false)
  }

  async function aggiornaStato(id: string, stato: string) {
    await supabase.from('tutoring_sessions').update({ stato }).eq('id', id)
    if (userId) await caricaSessioni(userId)
    if (stato === 'confermata') {
      const sessione = sessioni.find(s => s.id === id)
      if (sessione) {
        await fetch('/api/notifica', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: sessione.studente_id, tipo: 'sessione', titolo: 'Sessione confermata!', messaggio: 'La tua sessione di ' + sessione.materia + ' è stata confermata.', link: '/sessioni' }) })
      }
    }
  }

  function formattaData(d: string) {
    const data = new Date(d)
    return data.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function coloreStato(stato: string) {
    if (stato === 'confermata') return { bg: '#F0FDF4', color: '#15803D' }
    if (stato === 'completata') return { bg: '#EFF6FF', color: '#185FA5' }
    if (stato === 'rifiutata') return { bg: '#FEF2F2', color: '#DC2626' }
    return { bg: '#FFFBEB', color: '#B45309' }
  }

  const sessioniFiltrate = sessioni.filter(function(s: any) {
    if (tab === 'tutte') return true
    if (tab === 'attive') return s.stato === 'in_attesa' || s.stato === 'confermata'
    if (tab === 'completate') return s.stato === 'completata'
    return true
  })

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Le mie sessioni</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 24px' }}>Gestisci le tue prenotazioni di ripetizioni</p>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '0.5px solid #F4F4F5' }}>
          {['tutte', 'attive', 'completate'].map(function(t) {
            return (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', background: 'transparent', color: tab === t ? '#18181B' : '#A1A1AA', fontWeight: tab === t ? 500 : 400, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: tab === t ? '2px solid #18181B' : '2px solid transparent', textTransform: 'capitalize' }}>
                {t}
              </button>
            )
          })}
        </div>

        {loading && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Caricamento...</p>}

        {!loading && sessioniFiltrate.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="ti ti-calendar-off" style={{ fontSize: 36, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 4px' }}>Nessuna sessione</p>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: '0 0 20px' }}>Prenota una ripetizione con un tutor</p>
            <button onClick={() => router.push('/tutor')} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Trova un tutor
            </button>
          </div>
        )}

        <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
          {sessioniFiltrate.map(function(s: any) {
            const c = coloreStato(s.stato)
            const isTutor = s.tutor_id === userId
            const altroUtente = isTutor ? s.profiles : s.profiles
            return (
              <div key={s.id} style={{ padding: '18px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: 0 }}>{s.materia}</p>
                      <span style={{ fontSize: 10, background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 20 }}>{s.stato}</span>
                      <span style={{ fontSize: 10, background: '#FAFAFA', color: '#71717A', padding: '2px 8px', borderRadius: 20 }}>{isTutor ? 'Tutor' : 'Studente'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 4px' }}>{formattaData(s.data_ora)} · € {s.prezzo?.toFixed(2)}</p>
                    {altroUtente && <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>{isTutor ? 'Studente' : 'Tutor'}: {altroUtente.nome} {altroUtente.cognome}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {s.stato === 'confermata' && s.link_videochiamata && (
                      <button onClick={() => router.push('/videochiamata/' + s.id)} style={{ fontSize: 12, background: '#18181B', color: 'white', border: 'none', padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontWeight: 500 }}>
                        Entra
                      </button>
                    )}
                    {isTutor && s.stato === 'in_attesa' && (
                      <>
                        <button onClick={() => aggiornaStato(s.id, 'confermata')} style={{ fontSize: 12, background: '#F0FDF4', color: '#15803D', border: '0.5px solid #BBF7D0', padding: '7px 14px', borderRadius: 7, cursor: 'pointer' }}>
                          Conferma
                        </button>
                        <button onClick={() => aggiornaStato(s.id, 'rifiutata')} style={{ fontSize: 12, background: '#FEF2F2', color: '#DC2626', border: '0.5px solid #FECACA', padding: '7px 14px', borderRadius: 7, cursor: 'pointer' }}>
                          Rifiuta
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
