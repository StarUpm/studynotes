'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Profilo = {
  id: string
  nome: string
  cognome: string
  email: string
  is_tutor: boolean
}

type Messaggio = {
  id: string
  mittente_id: string
  destinatario_id: string
  testo: string
  letto: boolean
  created_at: string
}

type Conversazione = {
  utente: Profilo
  ultimoMessaggio: string
  ultimaOra: string
  nonLetti: number
}

export default function Chat() {
  const [userId, setUserId] = useState('')
  const [conversazioni, setConversazioni] = useState<Conversazione[]>([])
  const [chatAttiva, setChatAttiva] = useState<Profilo | null>(null)
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [nuovoMessaggio, setNuovoMessaggio] = useState('')
  const [ricerca, setRicerca] = useState('')
  const [risultatiRicerca, setRisultatiRicerca] = useState<Profilo[]>([])
  const [loading, setLoading] = useState(true)
  const [invio, setInvio] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      await caricaConversazioni(userData.data.user.id)
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messaggi])

  async function caricaConversazioni(uid: string) {
    const inviati = await supabase.from('messaggi_chat').select('*').eq('mittente_id', uid).order('created_at', { ascending: false })
    const ricevuti = await supabase.from('messaggi_chat').select('*').eq('destinatario_id', uid).order('created_at', { ascending: false })

    const tuttiMsg = [...(inviati.data || []), ...(ricevuti.data || [])]
    const utentiIds = new Set<string>()
    tuttiMsg.forEach(function(m) {
      if (m.mittente_id !== uid) utentiIds.add(m.mittente_id)
      if (m.destinatario_id !== uid) utentiIds.add(m.destinatario_id)
    })

    if (utentiIds.size === 0) { setLoading(false); return }

    const profiliResult = await supabase.from('profiles').select('*').in('id', Array.from(utentiIds))
    const profili = profiliResult.data || []

    const convsMap = new Map<string, Conversazione>()
    profili.forEach(function(p) {
      const msgConUtente = tuttiMsg
        .filter(function(m) { return m.mittente_id === p.id || m.destinatario_id === p.id })
        .sort(function(a, b) { return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() })

      const nonLetti = tuttiMsg.filter(function(m) { return m.mittente_id === p.id && !m.letto }).length
      const ultimo = msgConUtente[0]
      const ora = ultimo ? new Date(ultimo.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''

      convsMap.set(p.id, {
        utente: p,
        ultimoMessaggio: ultimo ? ultimo.testo : '',
        ultimaOra: ora,
        nonLetti
      })
    })

    setConversazioni(Array.from(convsMap.values()))
  }

  async function cercaUtenti(query: string) {
    setRicerca(query)
    if (query.length < 2) { setRisultatiRicerca([]); return }
    const result = await supabase.from('profiles').select('*').or(`nome.ilike.%${query}%,cognome.ilike.%${query}%,email.ilike.%${query}%`).neq('id', userId).limit(8)
    setRisultatiRicerca(result.data || [])
  }

  async function apriChat(utente: Profilo) {
    setChatAttiva(utente)
    setRicerca('')
    setRisultatiRicerca([])
    await caricaMessaggi(utente.id)
    await supabase.from('messaggi_chat').update({ letto: true }).eq('mittente_id', utente.id).eq('destinatario_id', userId)
  }

  async function caricaMessaggi(altroUserId: string) {
    const result = await supabase.from('messaggi_chat').select('*')
      .or(`and(mittente_id.eq.${userId},destinatario_id.eq.${altroUserId}),and(mittente_id.eq.${altroUserId},destinatario_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    setMessaggi(result.data || [])
  }

  async function inviaMessaggio() {
    if (!nuovoMessaggio.trim() || !chatAttiva || invio) return
    setInvio(true)
    const testo = nuovoMessaggio.trim()
    const result = await supabase.from('messaggi_chat').insert({
      mittente_id: userId,
      destinatario_id: chatAttiva.id,
      testo
    })
    if (!result.error) {
      await fetch('/api/notifica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utente_id: chatAttiva.id,
          tipo: 'messaggio',
          titolo: 'Nuovo messaggio',
          messaggio: testo.substring(0, 60),
          link: '/chat'
        })
      })
      setNuovoMessaggio('')
      await caricaMessaggi(chatAttiva.id)
      await caricaConversazioni(userId)
    }
    setInvio(false)
  }

  function nomeVisibile(p: Profilo) {
    if (p.nome && p.cognome) return p.nome + ' ' + p.cognome
    if (p.nome) return p.nome
    return p.email
  }

  function iniziali(p: Profilo) {
    if (p.nome && p.cognome) return p.nome[0] + p.cognome[0]
    if (p.nome) return p.nome[0]
    return p.email[0].toUpperCase()
  }

  function formattaOra(d: string) {
    return new Date(d).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  const colori = ['#185FA5', '#534AB7', '#0F6E56', '#B45309', '#DC2626']
  function coloreAvatar(id: string) {
    return colori[id.charCodeAt(0) % colori.length]
  }

  const azioniRapide = [
    { label: 'Proponi orario', testo: 'Ciao! Quando sei disponibile per una sessione?' },
    { label: 'Chiedi prezzo', testo: 'Qual è la tua tariffa per una sessione di ripetizioni?' },
    { label: 'Chiedi appunti', testo: 'Hai appunti disponibili per questa materia?' },
    { label: 'Proponi sconto', testo: 'Saresti disponibile a fare un prezzo speciale per il primo incontro?' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Messaggi</h1>

        <div style={{ display: 'flex', gap: 16, height: 580 }}>

          <div style={{ width: 280, background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: 14, borderBottom: '0.5px solid #e5e7eb' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Cerca utente..."
                  value={ricerca}
                  onChange={function(e) { cercaUtenti(e.target.value) }}
                  style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
                {risultatiRicerca.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20 }}>
                    {risultatiRicerca.map(function(u) {
                      return (
                        <button key={u.id} onClick={function() { apriChat(u) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: coloreAvatar(u.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>{iniziali(u)}</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{nomeVisibile(u)}</p>
                            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{u.is_tutor ? 'Tutor' : 'Studente'}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading && <p style={{ fontSize: 13, color: '#9CA3AF', padding: 16 }}>Caricamento...</p>}
              {!loading && conversazioni.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', padding: 16, textAlign: 'center' }}>Nessuna conversazione — cerca un utente!</p>
              )}
              {conversazioni.map(function(conv) {
                const attiva = chatAttiva?.id === conv.utente.id
                return (
                  <button key={conv.utente.id} onClick={function() { apriChat(conv.utente) }} style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', background: attiva ? '#EFF6FF' : 'none', border: 'none', borderBottom: '0.5px solid #f3f4f6', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: coloreAvatar(conv.utente.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0 }}>{iniziali(conv.utente)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{nomeVisibile(conv.utente)}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.ultimoMessaggio}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>{conv.ultimaOra}</p>
                      {conv.nonLetti > 0 && (
                        <div style={{ background: '#185FA5', color: 'white', fontSize: 10, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{conv.nonLetti}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {chatAttiva ? (
            <div style={{ flex: 1, background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: coloreAvatar(chatAttiva.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0 }}>{iniziali(chatAttiva)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{nomeVisibile(chatAttiva)}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{chatAttiva.is_tutor ? 'Tutor' : 'Studente'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={function() { router.push('/prenota/' + chatAttiva.id) }} style={{ fontSize: 12, padding: '7px 12px', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
                    Prenota sessione
                  </button>
                  <button onClick={function() { router.push('/profilo/' + chatAttiva.id) }} style={{ fontSize: 12, padding: '7px 12px', background: '#f9fafb', color: '#374151', border: '0.5px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>
                    Profilo
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: '#f9fafb' }}>
                {messaggi.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ fontSize: 14, color: '#9CA3AF' }}>Inizia la conversazione con {nomeVisibile(chatAttiva)}!</p>
                  </div>
                )}
                {messaggi.map(function(m) {
                  const mio = m.mittente_id === userId
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 8, maxWidth: '75%', alignSelf: mio ? 'flex-end' : 'flex-start', flexDirection: mio ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: mio ? '#185FA5' : coloreAvatar(chatAttiva.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'white', flexShrink: 0, marginTop: 2 }}>
                        {mio ? 'Tu' : iniziali(chatAttiva)}
                      </div>
                      <div>
                        <div style={{ background: mio ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', border: mio ? 'none' : '0.5px solid #e5e7eb', borderRadius: mio ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '10px 14px', fontSize: 13, color: mio ? 'white' : '#111827', lineHeight: 1.5 }}>
                          {m.testo}
                        </div>
                        <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, textAlign: mio ? 'right' : 'left' }}>{formattaOra(m.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '6px 14px 8px', borderTop: '0.5px solid #e5e7eb', display: 'flex', gap: 6, flexWrap: 'wrap', background: 'white' }}>
                {azioniRapide.map(function(az) {
                  return (
                    <button key={az.label} onClick={function() { setNuovoMessaggio(az.testo) }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#f9fafb', border: '0.5px solid #e5e7eb', color: '#6B7280', cursor: 'pointer' }}>
                      {az.label}
                    </button>
                  )
                })}
              </div>

              <div style={{ padding: '10px 14px', borderTop: '0.5px solid #e5e7eb', display: 'flex', gap: 10, alignItems: 'flex-end', background: 'white' }}>
                <textarea
                  placeholder="Scrivi un messaggio..."
                  value={nuovoMessaggio}
                  onChange={function(e) { setNuovoMessaggio(e.target.value) }}
                  onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); inviaMessaggio() } }}
                  rows={1}
                  style={{ flex: 1, border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 13, outline: 'none', resize: 'none', background: '#f9fafb', lineHeight: 1.5 }}
                />
                <button
                  onClick={inviaMessaggio}
                  disabled={invio || !nuovoMessaggio.trim()}
                  style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!nuovoMessaggio.trim() || invio) ? 0.5 : 1 }}
                >
                  <span style={{ color: 'white', fontSize: 18 }}>↑</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Seleziona una conversazione</h3>
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Scegli una conversazione dalla lista oppure cerca un utente per iniziare a chattare</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
