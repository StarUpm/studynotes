'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function ProfiloUtente() {
  const [tab, setTab] = useState('profilo')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [universitaInput, setUniversitaInput] = useState('')
  const [tipoIstituto, setTipoIstituto] = useState('universita')
  const [annoStudio, setAnnoStudio] = useState('')
  const [isTutor, setIsTutor] = useState(false)
  const [premiumAttivo, setPremiumAttivo] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [caricandoFoto, setCaricandoFoto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [successoProfilo, setSuccessoProfilo] = useState(false)
  const [erroreProfilo, setErroreProfilo] = useState('')
  const [suggerimenti, setSuggerimenti] = useState<string[]>([])
  const [cercandoUniversita, setCercandoUniversita] = useState(false)
  const [acquisti, setAcquisti] = useState<any[]>([])
  const [sessioniStudente, setSessioniStudente] = useState<any[]>([])
  const [sessioniTutor, setSessioniTutor] = useState<any[]>([])
  const [guadagniAppunti, setGuadagniAppunti] = useState(0)
  const [guadagniSessioni, setGuadagniSessioni] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerU = useRef<any>(null)
  const router = useRouter()

  useEffect(() => { caricaDati() }, [])

  async function caricaDati() {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { router.push('/login'); return }
    const uid = userData.data.user.id
    setUserId(uid)
    const [profiloResult, acquistiResult, sessioniSResult, sessioniTResult, notesResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase.from('purchases').select('*, notes(titolo, materia)').eq('buyer_id', uid).order('created_at', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('studente_id', uid).order('data_ora', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('tutor_id', uid).order('data_ora', { ascending: false }),
      supabase.from('notes').select('id').eq('autore_id', uid)
    ])
    if (profiloResult.data) {
      const p = profiloResult.data
      setNome(p.nome || ''); setCognome(p.cognome || ''); setUniversitaInput(p.universita || '')
      setTipoIstituto(p.tipo_istituto || 'universita'); setAnnoStudio(p.anno_studio || '')
      setIsTutor(p.is_tutor || false); setPremiumAttivo(p.premium_attivo || false); setAvatarUrl(p.avatar_url || '')
    }
    if (acquistiResult.data) setAcquisti(acquistiResult.data)
    if (sessioniSResult.data) setSessioniStudente(sessioniSResult.data)
    if (sessioniTResult.data) setSessioniTutor(sessioniTResult.data)
    if (notesResult.data?.length > 0) {
      const noteIds = notesResult.data.map(n => n.id)
      const purchasesResult = await supabase.from('purchases').select('prezzo').in('note_id', noteIds)
      if (purchasesResult.data) setGuadagniAppunti(purchasesResult.data.reduce((acc, p) => acc + (p.prezzo || 0), 0) * 0.8)
    }
    if (sessioniTResult.data) {
      const completate = sessioniTResult.data.filter(s => s.stato === 'completata')
      setGuadagniSessioni(completate.reduce((acc, s) => acc + (s.prezzo || 0), 0) * 0.8)
    }
    setLoading(false)
  }

  async function cercaUniversita(v: string) {
    setUniversitaInput(v)
    if (v.length < 2) { setSuggerimenti([]); return }
    setCercandoUniversita(true)
    if (timerU.current) clearTimeout(timerU.current)
    timerU.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'universita' }) })
        const data = await res.json()
        setSuggerimenti(data.risultati || [])
      } catch (e) { setSuggerimenti([]) }
      setCercandoUniversita(false)
    }, 400)
  }

  async function caricaFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCaricandoFoto(true)
    const ext = file.name.split('.').pop()
    const fileName = userId + '_' + Date.now() + '.' + ext
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (uploadError) { alert('Errore: ' + uploadError.message); setCaricandoFoto(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', userId)
    setAvatarUrl(urlData.publicUrl)
    setCaricandoFoto(false)
  }

  async function salvaProfilo() {
    setSalvando(true); setErroreProfilo('')
    const result = await supabase.from('profiles').update({ nome, cognome, universita: universitaInput, tipo_istituto: tipoIstituto, anno_studio: annoStudio }).eq('id', userId)
    if (result.error) { setErroreProfilo('Errore nel salvataggio') }
    else { setSuccessoProfilo(true); setTimeout(() => setSuccessoProfilo(false), 3000) }
    setSalvando(false)
  }

  function formattaData(d: string) {
    const data = new Date(d)
    return data.toLocaleDateString('it-IT') + ' alle ' + data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function coloreStato(stato: string) {
    if (stato === 'confermata') return { bg: '#F0FDF4', color: '#15803D' }
    if (stato === 'completata') return { bg: '#EFF6FF', color: '#185FA5' }
    if (stato === 'rifiutata') return { bg: '#FEF2F2', color: '#DC2626' }
    return { bg: '#FFFBEB', color: '#B45309' }
  }

  const sessioniFuture = [...sessioniStudente, ...sessioniTutor]
    .filter(s => new Date(s.data_ora) > new Date() && s.stato === 'confermata')
    .sort((a, b) => new Date(a.data_ora).getTime() - new Date(b.data_ora).getTime())

  const saldoTotale = guadagniAppunti + guadagniSessioni
  const nomeVisibile = nome && cognome ? nome + ' ' + cognome : nome || 'Il mio profilo'

  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white', marginBottom: 12 } as React.CSSProperties

  const tabs = ['profilo', 'curriculum', 'acquisti', 'sessioni', 'calendario', 'disponibilita', 'accessibilita']
  const tabLabel = (t: string) => ({ profilo: 'Profilo', curriculum: 'Curriculum', acquisti: 'Acquisti', sessioni: 'Sessioni', calendario: 'Calendario', disponibilita: 'Disponibilità', accessibilita: 'Studio' }[t] || t)

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #E4E4E7' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F4B860', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 500, color: '#412402' }}>
                {nomeVisibile.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', border: '0.5px solid #E4E4E7', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-camera" style={{ fontSize: 11, color: '#71717A' }} />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={caricaFoto} style={{ display: 'none' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontSize: 20, fontWeight: 500, color: '#18181B', margin: 0 }}>{nomeVisibile}</h1>
              {premiumAttivo && <span style={{ fontSize: 10, background: '#18181B', color: '#FAC775', padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}><i className="ti ti-crown" style={{ fontSize: 10 }} />Premium</span>}
              {isTutor && <span style={{ fontSize: 10, background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: 20, border: '0.5px solid #BBF7D0' }}>Tutor</span>}
            </div>
            {universitaInput && <p style={{ fontSize: 12, color: '#A1A1AA', margin: '0 0 4px' }}>{universitaInput}</p>}
            <p style={{ fontSize: 12, color: '#D85A30', margin: 0, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              {caricandoFoto ? 'Caricamento...' : 'Cambia foto'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Saldo totale', value: '€ ' + saldoTotale.toFixed(2), sub: 'Al netto del 20%' },
            { label: 'Da appunti', value: '€ ' + guadagniAppunti.toFixed(2), sub: '' },
            { label: 'Da sessioni', value: '€ ' + guadagniSessioni.toFixed(2), sub: '' },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 11, color: '#A1A1AA', margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 500, color: '#18181B', margin: 0 }}>{s.value}</p>
                {s.sub && <p style={{ fontSize: 11, color: '#A1A1AA', margin: '2px 0 0' }}>{s.sub}</p>}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', borderBottom: '0.5px solid #F4F4F5', paddingBottom: 0 }}>
          {tabs.map(function(t) {
            return (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, cursor: 'pointer', border: 'none', background: 'transparent', color: tab === t ? '#18181B' : '#A1A1AA', fontWeight: tab === t ? 500 : 400, borderBottom: tab === t ? '2px solid #18181B' : '2px solid transparent' }}>
                {tabLabel(t)}
              </button>
            )
          })}
        </div>

        {tab === 'profilo' && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 20px' }}>Modifica profilo</h2>
            {erroreProfilo && <p style={{ color: '#D85A30', fontSize: 13, marginBottom: 12 }}>{erroreProfilo}</p>}
            {successoProfilo && <p style={{ color: '#15803D', fontSize: 13, marginBottom: 12 }}>Profilo salvato</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
              <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && salvaProfilo()} style={inputStyle} />
              <input type="text" placeholder="Cognome" value={cognome} onChange={e => setCognome(e.target.value)} onKeyDown={e => e.key === 'Enter' && salvaProfilo()} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              {['universita', 'liceo'].map(function(tipo) {
                return (
                  <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#71717A', cursor: 'pointer' }}>
                    <input type="radio" checked={tipoIstituto === tipo} onChange={() => setTipoIstituto(tipo)} />
                    {tipo === 'universita' ? 'Università' : 'Scuola superiore'}
                  </label>
                )
              })}
            </div>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input type="text" placeholder="Università o scuola" value={universitaInput} onChange={e => cercaUniversita(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
              {cercandoUniversita && <p style={{ fontSize: 11, color: '#A1A1AA', marginTop: 4 }}>Ricerca...</p>}
              {suggerimenti.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  {suggerimenti.map(s => <button key={s} onClick={() => { setUniversitaInput(s); setSuggerimenti([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#18181B', borderBottom: '0.5px solid #F4F4F5' }}>{s}</button>)}
                </div>
              )}
            </div>
            <input type="text" placeholder="Anno di corso (es. 2° anno Triennale)" value={annoStudio} onChange={e => setAnnoStudio(e.target.value)} style={inputStyle} />
            <button onClick={salvaProfilo} disabled={salvando} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvataggio...' : 'Salva profilo'}
            </button>
          </div>
        )}

        {tab === 'curriculum' && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <i className="ti ti-file-cv" style={{ fontSize: 32, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Il mio curriculum</h3>
            <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 18px' }}>Istruzione, esperienze, competenze, lingue e certificazioni</p>
            <button onClick={() => router.push('/curriculum')} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Modifica curriculum
            </button>
          </div>
        )}

        {tab === 'acquisti' && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>I miei acquisti</h3>
            {acquisti.length === 0 && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Nessun acquisto effettuato</p>}
            <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
              {acquisti.map(function(a) {
                return (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>{a.notes?.titolo || 'Appunto'}</p>
                      <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{a.notes?.materia} · {formattaData(a.created_at)}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#18181B' }}>€ {a.prezzo?.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'sessioni' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{ titolo: 'Come studente', lista: sessioniStudente }, { titolo: 'Come tutor', lista: sessioniTutor }].map(function(gruppo) {
              return (
                <div key={gruppo.titolo} style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 14px' }}>Sessioni {gruppo.titolo}</h3>
                  {gruppo.lista.length === 0 && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Nessuna sessione</p>}
                  <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
                    {gruppo.lista.map(function(s) {
                      const c = coloreStato(s.stato)
                      return (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>{s.materia}</p>
                            <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{formattaData(s.data_ora)} · € {s.prezzo?.toFixed(2)}</p>
                          </div>
                          <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 20 }}>{s.stato}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'calendario' && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Sessioni programmate</h3>
            {sessioniFuture.length === 0 && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Nessuna sessione futura</p>}
            {sessioniFuture.map(function(s) {
              const d = new Date(s.data_ora)
              return (
                <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ background: '#F4B860', borderRadius: 8, padding: '7px 10px', textAlign: 'center', minWidth: 42 }}>
                    <p style={{ fontSize: 8, color: '#412402', fontWeight: 500, margin: 0 }}>{d.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase()}</p>
                    <p style={{ fontSize: 18, fontWeight: 500, color: '#412402', margin: 0 }}>{d.getDate()}</p>
                  </div>
                  <div style={{ background: '#FAFAFA', borderRadius: 8, padding: 12, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>{s.materia}</p>
                    <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} · € {s.prezzo?.toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'disponibilita' && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <i className="ti ti-calendar" style={{ fontSize: 32, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Gestisci disponibilità</h3>
            <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 18px' }}>{isTutor ? 'Imposta i tuoi orari disponibili' : 'Attiva prima il profilo tutor'}</p>
            <button onClick={() => router.push(isTutor ? '/disponibilita' : '/diventa-tutor')} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {isTutor ? 'Gestisci disponibilità' : 'Attiva profilo tutor'}
            </button>
          </div>
        )}

        {tab === 'accessibilita' && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <i className="ti ti-settings" style={{ fontSize: 32, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Modalità di studio personalizzata</h3>
            <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 18px' }}>Personalizza font, colori e concentrazione</p>
            <button onClick={() => router.push('/accessibilita')} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Personalizza esperienza
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}
