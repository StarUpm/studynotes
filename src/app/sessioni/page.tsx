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
  durata_minuti: number
  prezzo: number
  stato: string
}

export default function Sessioni() {
  const [sessioniComeStudente, setSessioniComeStudente] = useState<Sessione[]>([])
  const [sessioniComeTutor, setSessioniComeTutor] = useState<Sessione[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { fetchSessioni() }, [])

  async function fetchSessioni() {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { setLoading(false); return }
    const comeStudente = await supabase.from('tutoring_sessions').select('*').eq('studente_id', userData.data.user.id).order('data_ora', { ascending: true })
    const comeTutor = await supabase.from('tutoring_sessions').select('*').eq('tutor_id', userData.data.user.id).order('data_ora', { ascending: true })
    if (comeStudente.data) setSessioniComeStudente(comeStudente.data)
    if (comeTutor.data) setSessioniComeTutor(comeTutor.data)
    setLoading(false)
  }

  async function confermaSessione(id: string) {
    await supabase.from('tutoring_sessions').update({ stato: 'confermata' }).eq('id', id)
    fetchSessioni()
  }

  async function rifiutaSessione(id: string) {
    await supabase.from('tutoring_sessions').update({ stato: 'rifiutata' }).eq('id', id)
    fetchSessioni()
  }

  function formattaData(d: string) {
    const data = new Date(d)
    return data.toLocaleDateString('it-IT') + ' alle ' + data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function coloreStato(stato: string) {
    if (stato === 'confermata') return { bg: '#ECFDF5', color: '#059669' }
    if (stato === 'completata') return { bg: '#EFF6FF', color: '#185FA5' }
    if (stato === 'rifiutata') return { bg: '#FEF2F2', color: '#DC2626' }
    return { bg: '#FFFBEB', color: '#B45309' }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Le mie sessioni</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Gestisci le tue prenotazioni e videochiamate</p>

        {loading && <p style={{ color: '#9CA3AF' }}>Caricamento...</p>}

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Sessioni come studente</h2>
          {sessioniComeStudente.length === 0 && !loading && (
            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna sessione prenotata — <span onClick={() => router.push('/tutor')} style={{ color: '#185FA5', cursor: 'pointer' }}>trova un tutor</span></p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessioniComeStudente.map(function(s) {
              const c = coloreStato(s.stato)
              return (
                <div key={s.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.materia}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>{formattaData(s.data_ora)}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>€ {s.prezzo?.toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {s.stato === 'confermata' && (
                      <button onClick={() => router.push('/videochiamata/' + s.id)} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Entra in videochiamata
                      </button>
                    )}
                    <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: '4px 12px', borderRadius: 20 }}>{s.stato}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Sessioni come tutor</h2>
          {sessioniComeTutor.length === 0 && !loading && (
            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna richiesta ricevuta ancora</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessioniComeTutor.map(function(s) {
              const c = coloreStato(s.stato)
              return (
                <div key={s.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.materia}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>{formattaData(s.data_ora)}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>€ {s.prezzo?.toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {s.stato === 'pending' && (
                      <>
                        <button onClick={() => confermaSessione(s.id)} style={{ background: '#ECFDF5', color: '#059669', border: '0.5px solid #A7F3D0', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Conferma
                        </button>
                        <button onClick={() => rifiutaSessione(s.id)} style={{ background: '#FEF2F2', color: '#DC2626', border: '0.5px solid #FECACA', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Rifiuta
                        </button>
                      </>
                    )}
                    {s.stato === 'confermata' && (
                      <button onClick={() => router.push('/videochiamata/' + s.id)} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Entra in videochiamata
                      </button>
                    )}
                    <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: '4px 12px', borderRadius: 20 }}>{s.stato}</span>
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
