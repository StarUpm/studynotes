'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Istruzione = { titolo: string; istituto: string; annoInizio: string; annoFine: string; voto: string }
type Esperienza = { ruolo: string; azienda: string; periodo: string; tipo: string; descrizione: string }
type Lingua = { lingua: string; livello: string }
type Certificazione = { nome: string; ente: string; anno: string; link: string }

export default function Curriculum() {
  const [userId, setUserId] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [istruzione, setIstruzione] = useState<Istruzione[]>([])
  const [esperienze, setEsperienze] = useState<Esperienza[]>([])
  const [competenze, setCompetenze] = useState<string[]>([])
  const [lingue, setLingue] = useState<Lingua[]>([])
  const [certificazioni, setCertificazioni] = useState<Certificazione[]>([])
  const [nuovaCompetenza, setNuovaCompetenza] = useState('')
  const [suggerimentiCompetenza, setSuggerimentiCompetenza] = useState<string[]>([])
  const [cercandoCompetenza, setCercandoCompetenza] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [success, setSuccess] = useState(false)
  const timerC = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      const profilo = await supabase.from('profiles').select('descrizione_personale, istruzione, esperienze, competenze, lingue, certificazioni').eq('id', userData.data.user.id).single()
      if (profilo.data) {
        setDescrizione(profilo.data.descrizione_personale || '')
        setIstruzione(profilo.data.istruzione || [])
        setEsperienze(profilo.data.esperienze || [])
        setCompetenze(profilo.data.competenze || [])
        setLingue(profilo.data.lingue || [])
        setCertificazioni(profilo.data.certificazioni || [])
      }
      setLoading(false)
    }
    init()
  }, [router])

  async function cercaCompetenza(v: string) {
    setNuovaCompetenza(v)
    if (v.length < 2) { setSuggerimentiCompetenza([]); return }
    setCercandoCompetenza(true)
    if (timerC.current) clearTimeout(timerC.current)
    timerC.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/cerca-universita', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: v, tipo: 'materia' })
        })
        const data = await res.json()
        setSuggerimentiCompetenza(data.risultati || [])
      } catch (e) { setSuggerimentiCompetenza([]) }
      setCercandoCompetenza(false)
    }, 400)
  }

  async function salva() {
    setSalvando(true)
    await supabase.from('profiles').update({
      descrizione_personale: descrizione,
      istruzione, esperienze, competenze, lingue, certificazioni
    }).eq('id', userId)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    setSalvando(false)
  }

  function aggiungiIstruzione() {
    setIstruzione([...istruzione, { titolo: '', istituto: '', annoInizio: '', annoFine: '', voto: '' }])
  }

  function aggiungiEsperienza() {
    setEsperienze([...esperienze, { ruolo: '', azienda: '', periodo: '', tipo: 'Lavoro', descrizione: '' }])
  }

  function aggiungiLingua() {
    setLingue([...lingue, { lingua: '', livello: 'B1 - Intermedio' }])
  }

  function aggiungiCertificazione() {
    setCertificazioni([...certificazioni, { nome: '', ente: '', anno: '', link: '' }])
  }

  function aggiungiCompetenza() {
    if (nuovaCompetenza.trim() && !competenze.includes(nuovaCompetenza.trim())) {
      setCompetenze([...competenze, nuovaCompetenza.trim()])
      setNuovaCompetenza('')
      setSuggerimentiCompetenza([])
    }
  }

  function rimuoviCompetenza(c: string) {
    setCompetenze(competenze.filter(x => x !== c))
  }

  function updateIstruzione(i: number, campo: keyof Istruzione, valore: string) {
    const nuova = [...istruzione]
    nuova[i] = { ...nuova[i], [campo]: valore }
    setIstruzione(nuova)
  }

  function updateEsperienza(i: number, campo: keyof Esperienza, valore: string) {
    const nuova = [...esperienze]
    nuova[i] = { ...nuova[i], [campo]: valore }
    setEsperienze(nuova)
  }

  function updateLingua(i: number, campo: keyof Lingua, valore: string) {
    const nuova = [...lingue]
    nuova[i] = { ...nuova[i], [campo]: valore }
    setLingue(nuova)
  }

  function updateCertificazione(i: number, campo: keyof Certificazione, valore: string) {
    const nuova = [...certificazioni]
    nuova[i] = { ...nuova[i], [campo]: valore }
    setCertificazioni(nuova)
  }

  const inputStyle = { width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties
  const labelStyle = { fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 4 } as React.CSSProperties
  const sectionStyle = { background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 16 } as React.CSSProperties
  const addBtnStyle = { fontSize: 13, color: '#185FA5', background: '#EFF6FF', border: '0.5px solid #BFDBFE', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', marginTop: 10 } as React.CSSProperties
  const removeBtnStyle = { fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' } as React.CSSProperties

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/profilo-utente')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna al profilo</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>📋 Il mio curriculum</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Completa il tuo profilo per essere trovato da studenti e tutor</p>

        {success && (
          <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#059669' }}>✓ Curriculum salvato!</p>
          </div>
        )}

        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Il mio profilo</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}>Descrivi chi sei con parole tue</p>
          <textarea
            placeholder="Es. Sono uno studente di Ingegneria Informatica al Politecnico di Milano, appassionato di machine learning e sviluppo web..."
            value={descrizione}
            onChange={e => setDescrizione(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Istruzione</h2>
          {istruzione.map(function(ist, i) {
            return (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button onClick={() => setIstruzione(istruzione.filter((_, j) => j !== i))} style={removeBtnStyle}>✕ Rimuovi</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={labelStyle}>Titolo di studio</label>
                    <input placeholder="Es. Laurea Triennale in Informatica" value={ist.titolo} onChange={e => updateIstruzione(i, 'titolo', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Istituto</label>
                    <input placeholder="Es. Politecnico di Milano" value={ist.istituto} onChange={e => updateIstruzione(i, 'istituto', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Anno inizio</label>
                    <input placeholder="Es. 2021" value={ist.annoInizio} onChange={e => updateIstruzione(i, 'annoInizio', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Anno fine (o "In corso")</label>
                    <input placeholder="Es. 2024 o In corso" value={ist.annoFine} onChange={e => updateIstruzione(i, 'annoFine', e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Voto / Media (opzionale)</label>
                  <input placeholder="Es. 28/30 o 110/110" value={ist.voto} onChange={e => updateIstruzione(i, 'voto', e.target.value)} style={inputStyle} />
                </div>
              </div>
            )
          })}
          <button onClick={aggiungiIstruzione} style={addBtnStyle}>+ Aggiungi istruzione</button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Esperienze</h2>
          {esperienze.map(function(esp, i) {
            return (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button onClick={() => setEsperienze(esperienze.filter((_, j) => j !== i))} style={removeBtnStyle}>✕ Rimuovi</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={labelStyle}>Ruolo</label>
                    <input placeholder="Es. Tutor di Matematica" value={esp.ruolo} onChange={e => updateEsperienza(i, 'ruolo', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Azienda / Organizzazione</label>
                    <input placeholder="Es. Studio privato" value={esp.azienda} onChange={e => updateEsperienza(i, 'azienda', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Periodo</label>
                    <input placeholder="Es. Set 2022 - oggi" value={esp.periodo} onChange={e => updateEsperienza(i, 'periodo', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tipo</label>
                    <select value={esp.tipo} onChange={e => updateEsperienza(i, 'tipo', e.target.value)} style={{ ...inputStyle }}>
                      <option>Lavoro</option>
                      <option>Stage</option>
                      <option>Volontariato</option>
                      <option>Progetto</option>
                      <option>Altro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Descrizione breve</label>
                  <textarea placeholder="Cosa hai fatto in questo ruolo..." value={esp.descrizione} onChange={e => updateEsperienza(i, 'descrizione', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            )
          })}
          <button onClick={aggiungiEsperienza} style={addBtnStyle}>+ Aggiungi esperienza</button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Competenze e materie</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {competenze.map(function(c) {
              return (
                <span key={c} style={{ fontSize: 12, background: '#EFF6FF', color: '#185FA5', border: '0.5px solid #BFDBFE', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c}
                  <button onClick={() => rimuoviCompetenza(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#185FA5', opacity: 0.6, padding: 0 }}>✕</button>
                </span>
              )
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Cerca competenza o materia..."
                value={nuovaCompetenza}
                onChange={e => cercaCompetenza(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && aggiungiCompetenza()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={aggiungiCompetenza} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '0 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Aggiungi
              </button>
            </div>
            {cercandoCompetenza && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Ricerca in corso...</p>}
            {suggerimentiCompetenza.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {suggerimentiCompetenza.map(function(s) {
                  return (
                    <button key={s} onClick={() => { setCompetenze(prev => prev.includes(s) ? prev : [...prev, s]); setNuovaCompetenza(''); setSuggerimentiCompetenza([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Lingue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lingue.map(function(l, i) {
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                  <input placeholder="Es. Inglese" value={l.lingua} onChange={e => updateLingua(i, 'lingua', e.target.value)} style={inputStyle} />
                  <select value={l.livello} onChange={e => updateLingua(i, 'livello', e.target.value)} style={inputStyle}>
                    <option>Madrelingua</option>
                    <option>C2 - Padronanza</option>
                    <option>C1 - Avanzato</option>
                    <option>B2 - Intermedio superiore</option>
                    <option>B1 - Intermedio</option>
                    <option>A2 - Base</option>
                    <option>A1 - Principiante</option>
                  </select>
                  <button onClick={() => setLingue(lingue.filter((_, j) => j !== i))} style={removeBtnStyle}>✕</button>
                </div>
              )
            })}
          </div>
          <button onClick={aggiungiLingua} style={addBtnStyle}>+ Aggiungi lingua</button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Certificazioni e corsi</h2>
          {certificazioni.map(function(cert, i) {
            return (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button onClick={() => setCertificazioni(certificazioni.filter((_, j) => j !== i))} style={removeBtnStyle}>✕ Rimuovi</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Nome certificazione</label>
                    <input placeholder="Es. IELTS, AWS, ECDL..." value={cert.nome} onChange={e => updateCertificazione(i, 'nome', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Ente / Piattaforma</label>
                    <input placeholder="Es. British Council, Coursera..." value={cert.ente} onChange={e => updateCertificazione(i, 'ente', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Anno</label>
                    <input placeholder="Es. 2023" value={cert.anno} onChange={e => updateCertificazione(i, 'anno', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Link (opzionale)</label>
                    <input placeholder="https://..." value={cert.link} onChange={e => updateCertificazione(i, 'link', e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>
            )
          })}
          <button onClick={aggiungiCertificazione} style={addBtnStyle}>+ Aggiungi certificazione</button>
        </div>

        <button
          onClick={salva}
          disabled={salvando}
          style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}
        >
          {salvando ? 'Salvataggio...' : 'Salva curriculum'}
        </button>
      </div>
    </Layout>
  )
}
