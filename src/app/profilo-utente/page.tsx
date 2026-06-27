'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { universita } from '@/lib/dati-universita'
import Layout from '@/app/components/Layout'

export default function ProfiloUtente() {
  const [tab, setTab] = useState('profilo')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [universitaInput, setUniversitaInput] = useState('')
  const [tipoIstituto, setTipoIstituto] = useState('universita')
  const [annoStudio, setAnnoStudio] = useState('')
  const [curriculum, setCurriculum] = useState('')
  const [isTutor, setIsTutor] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [successoProfilo, setSuccessoProfilo] = useState(false)
  const [erroreProfilo, setErroreProfilo] = useState('')
  const [suggerimenti, setSuggerimenti] = useState<string[]>([])
  const [acquisti, setAcquisti] = useState<any[]>([])
  const [sessioniStudente, setSessioniStudente] = useState<any[]>([])
  const [sessioniTutor, setSessioniTutor] = useState<any[]>([])
  const [guadagniAppunti, setGuadagniAppunti] = useState(0)
  const [guadagniSessioni, setGuadagniSessioni] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { caricaDati() }, [])

  async function caricaDati() {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { router.push('/login'); return }
    const userId = userData.data.user.id

    const [profiloResult, acquistiResult, sessioniSResult, sessioniTResult, notesResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('purchases').select('*, notes(titolo, materia)').eq('buyer_id', userId).order('created_at', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('studente_id', userId).order('data_ora', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('tutor_id', userId).order('data_ora', { ascending: false }),
      supabase.from('notes').select('id').eq('autore_id', userId)
    ])

    if (profiloResult.data) {
      const p = profiloResult.data
      setNome(p.nome || '')
      setCognome(p.cognome || '')
      setUniversitaInput(p.universita || '')
      setTipoIstituto(p.tipo_istituto || 'universita')
      setAnnoStudio(p.anno_studio || '')
      setCurriculum(p.curriculum || '')
      setIsTutor(p.is_tutor || false)
    }
    if (acquistiResult.data) setAcquisti(acquistiResult.data)
    if (sessioniSResult.data) setSessioniStudente(sessioniSResult.data)
    if (sessioniTResult.data) setSessioniTutor(sessioniTResult.data)

    if (notesResult.data && notesResult.data.length > 0) {
      const noteIds = notesResult.data.map(function(n) { return n.id })
      const purchasesResult = await supabase.from('purchases').select('prezzo').in('note_id', noteIds)
      if (purchasesResult.data) {
        const totale = purchasesResult.data.reduce(function(acc, p) { return acc + (p.prezzo || 0) }, 0)
        setGuadagniAppunti(totale * 0.8)
      }
    }

    if (sessioniTResult.data) {
      const completate = sessioniTResult.data.filter(function(s) { return s.stato === 'completata' })
      const totale = completate.reduce(function(acc, s) { return acc + (s.prezzo || 0) }, 0)
      setGuadagniSessioni(totale * 0.8)
    }

    setLoading(false)
  }

  function updateUniversita(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setUniversitaInput(v)
    setSuggerimenti(v.length > 0 ? universita.filter(u => u.toLowerCase().includes(v.toLowerCase())).slice(0, 6) : [])
  }

  async function salvaProfilo() {
    setSalvando(true)
    setErroreProfilo('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    const result = await supabase.from('profiles').update({
      nome, cognome, universita: universitaInput,
      tipo_istituto: tipoIstituto, anno_studio: annoStudio, curriculum
    }).eq('id', userData.data.user.id)
    if (result.error) { setErroreProfilo('Errore nel salvataggio') }
    else { setSuccessoProfilo(true); setTimeout(() => setSuccessoProfilo(false), 3000) }
    setSalvando(false)
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

  const sessioniFuture = [...sessioniStudente, ...sessioniTutor]
    .filter(function(s) { return new Date(s.data_ora) > new Date() && s.stato === 'confermata' })
    .sort(function(a, b) { return new Date(a.data_ora).getTime() - new Date(b.data_ora).getTime() })

  const saldoTotale = guadagniAppunti + guadagniSessioni
  const nomeVisibile = nome && cognome ? nome + ' ' + cognome : nome || 'Il mio profilo'

  const inputStyle = { width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 12, background: 'white' } as React.CSSProperties

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white' }}>
            {nomeVisibile.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{nomeVisibile}</h1>
            {universitaInput && <p style={{ fontSize: 13, color: '#9CA3AF' }}>{universitaInput}</p>}
            {isTutor && <span style={{ fontSize: 11, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', padding: '2px 10px', borderRadius: 20, marginTop: 4, display: 'inline-block' }}>Tutor</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Saldo totale', value: '€ ' + saldoTotale.toFixed(2), color: '#185FA5', sub: 'Al netto del 20%' },
            { label: 'Da appunti', value: '€ ' + guadagniAppunti.toFixed(2), color: '#111827', sub: '' },
            { label: 'Da sessioni', value: '€ ' + guadagniSessioni.toFixed(2), color: '#111827', sub: '' },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{s.sub}</div>}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['profilo', 'acquisti', 'sessioni', 'calendario', 'disponibilita'].map(function(t) {
            return (
              <button key={t} onClick={function() { setTab(t) }} style={{ padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: tab === t ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: tab === t ? 'white' : '#6B7280', boxShadow: tab === t ? 'none' : '0 0 0 0.5px #e5e7eb', textTransform: 'capitalize' }}>
                {t === 'disponibilita' ? 'Disponibilità' : t}
              </button>
            )
          })}
        </div>

        {tab === 'profilo' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 24 }}>Modifica profilo</h2>
            {erroreProfilo && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{erroreProfilo}</p>}
            {successoProfilo && <p style={{ color: '#059669', fontSize: 13, marginBottom: 16 }}>✓ Profilo salvato!</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
              <input type="text" placeholder="Cognome" value={cognome} onChange={e => setCognome(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              {['universita', 'liceo'].map(function(tipo) {
                return (
                  <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <input type="radio" checked={tipoIstituto === tipo} onChange={function() { setTipoIstituto(tipo) }} />
                    {tipo === 'universita' ? 'Università' : 'Scuola superiore'}
                  </label>
                )
              })}
            </div>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input type="text" placeholder={tipoIstituto === 'universita' ? 'Università che frequenti' : 'Nome della scuola'} value={universitaInput} onChange={updateUniversita} style={{ ...inputStyle, marginBottom: 0 }} />
              {suggerimenti.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {suggerimenti.map(function(s) {
                    return <button key={s} onClick={function() { setUniversitaInput(s); setSuggerimenti([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                  })}
                </div>
              )}
            </div>

            <input type="text" placeholder="Anno di corso (es. 2° anno Triennale)" value={annoStudio} onChange={e => setAnnoStudio(e.target.value)} style={inputStyle} />
            <textarea placeholder="Breve curriculum: studi, esperienze, competenze..." value={curriculum} onChange={e => setCurriculum(e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} />

            <button onClick={salvaProfilo} disabled={salvando} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvataggio...' : 'Salva profilo'}
            </button>
          </div>
        )}

        {tab === 'acquisti' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>I miei acquisti</h3>
            {acquisti.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessun acquisto effettuato</p>}
            {acquisti.map(function(a) {
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #f3f4f6' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{a.notes?.titolo || 'Appunto'}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>{a.notes?.materia} · {formattaData(a.created_at)}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>€ {a.prezzo?.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'sessioni' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { titolo: 'Come studente', lista: sessioniStudente },
              { titolo: 'Come tutor', lista: sessioniTutor },
            ].map(function(gruppo) {
              return (
                <div key={gruppo.titolo} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Sessioni {gruppo.titolo}</h3>
                  {gruppo.lista.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna sessione</p>}
                  {gruppo.lista.map(function(s) {
                    const c = coloreStato(s.stato)
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #f3f4f6' }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{s.materia}</p>
                          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{formattaData(s.data_ora)} · € {s.prezzo?.toFixed(2)}</p>
                        </div>
                        <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 20 }}>{s.stato}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'calendario' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Sessioni programmate</h3>
            {sessioniFuture.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna sessione futura programmata</p>}
            {sessioniFuture.map(function(s) {
              const d = new Date(s.data_ora)
              return (
                <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 48 }}>
                    <div style={{ fontSize: 10, color: '#185FA5', fontWeight: 600, textTransform: 'uppercase' }}>{d.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase()}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#185FA5' }}>{d.getDate()}</div>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.materia}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>{d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} · € {s.prezzo?.toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'disponibilita' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Gestisci la tua disponibilità</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              {isTutor
                ? 'Imposta gli orari in cui sei disponibile per le ripetizioni — gli studenti potranno scegliere direttamente i tuoi slot'
                : 'Devi prima attivare il profilo tutor per gestire la disponibilità'}
            </p>
            {isTutor ? (
              <button
                onClick={function() { router.push('/disponibilita') }}
                style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Gestisci disponibilità →
              </button>
            ) : (
              <button
                onClick={function() { router.push('/diventa-tutor') }}
                style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Attiva profilo tutor →
              </button>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
