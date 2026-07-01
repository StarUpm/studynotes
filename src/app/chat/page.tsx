'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Messaggio = {
  id: string
  mittente_id: string
  destinatario_id: string
  testo: string
  letto: boolean
  created_at: string
}

type Contatto = {
  id: string
  nome: string
  cognome: string
  avatar_url: string
  ultimoMessaggio?: string
  ultimaOra?: string
  nonLetti?: number
}

export default function Chat() {
  const [contatti, setContatti] = useState<Contatto[]>([])
  const [contattoAttivo, setContattoAttivo] = useState<Contatto | null>(null)
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [nuovoMessaggio, setNuovoMessaggio] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      await caricaContatti(userData.data.user.id)
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel('chat_' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaggi_chat' }, function() {
        if (contattoAttivo) caricaMessaggi(contattoAttivo.id)
        caricaContatti(userId)
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, contattoAttivo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messaggi])

  async function caricaContatti(uid: string) {
    const [inviati, ricevuti] = await Promise.all([
      supabase.from('messaggi_chat').select('destinatario_id, testo, created_at').eq('mittente_id', uid).order('created_at', { ascending: false }),
      supabase.from('messaggi_chat').select('mittente_id, testo, created_at, letto').eq('destinatario_id', uid).order('created_at', { ascending: false })
    ])
    const ids = new Set<string>()
    inviati.data?.forEach(m => ids.add(m.destinatario_id))
    ricevuti.data?.forEach(m => ids.add(m.mittente_id))
    if (ids.size === 0) { setContatti([]); return }
    const profili = await supabase.from('profiles').select('id, nome, cognome, avatar_url').in('id', Array.from(ids))
    if (profili.data) {
      const contattiConInfo = profili.data.map(function(p) {
        const tuttiMsg = [
          ...(inviati.data?.filter(m => m.destinatario_id === p.id) || []),
          ...(ricevuti.data?.filter(m => m.mittente_id === p.id) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const nonLetti = ricevuti.data?.filter(m => m.mittente_id === p.id && !m.letto).length || 0
        return { ...p, ultimoMessaggio: tuttiMsg[0]?.testo || '', ultimaOra: tuttiMsg[0]?.created_at || '', nonLetti }
      })
      setContatti(contattiConInfo)
    }
  }

  async function caricaMessaggi(contattoId: string) {
    const [inviati, ricevuti] = await Promise.all([
      supabase.from('messaggi_chat').select('*').eq('mittente_id', userId).eq('destinatario_id', contattoId).order('created_at'),
      supabase.from('messaggi_chat').select('*').eq('mittente_id', contattoId).eq('destinatario_id', userId).order('created_at')
    ])
    const tutti = [...(inviati.data || []), ...(ricevuti.data || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    setMessaggi(tutti)
    await supabase.from('messaggi_chat').update({ letto: true }).eq('mittente_id', contattoId).eq('destinatario_id', userId).eq('letto', false)
  }

  async function selezionaContatto(c: Contatto) {
    setContattoAttivo(c)
    await caricaMessaggi(c.id)
  }

  async function inviaMessaggio() {
    if (!nuovoMessaggio.trim() || !contattoAttivo) return
    await supabase.from('messaggi_chat').insert({ mittente_id: userId, destinatario_id: contattoAttivo.id, testo: nuovoMessaggio.trim(), letto: false })
    setNuovoMessaggio('')
    await caricaMessaggi(contattoAttivo.id)
    await caricaContatti(userId)
    await fetch('/api/notifica', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: contattoAttivo.id, tipo: 'messaggio', titolo: 'Nuovo messaggio', messaggio: nuovoMessaggio.trim(), link: '/chat' }) })
  }

  function tempoFa(d: string) {
    if (!d) return ''
    const diff = Date.now() - new Date(d).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Adesso'
    if (min < 60) return min + ' min'
    const ore = Math.floor(min / 60)
    if (ore < 24) return ore + 'h'
    return Math.floor(ore / 24) + 'g'
  }

  function orario(d: string) {
    return new Date(d).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 24px', letterSpacing: -0.5 }}>Messaggi</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, border: '0.5px solid #E4E4E7', borderRadius: 14, overflow: 'hidden', height: 540 }}>

          <div style={{ borderRight: '0.5px solid #F4F4F5', overflowY: 'auto' }}>
            {loading && <p style={{ fontSize: 13, color: '#A1A1AA', padding: 16 }}>Caricamento...</p>}
            {!loading && contatti.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <i className="ti ti-message-off" style={{ fontSize: 28, color: '#D4D4D8', display: 'block', marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Nessuna conversazione</p>
              </div>
            )}
            {contatti.map(function(c) {
              const attivo = contattoAttivo?.id === c.id
              return (
                <div key={c.id} onClick={() => selezionaContatto(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: attivo ? '#FAFAFA' : 'white', borderBottom: '0.5px solid #F4F4F5' }}>
                  {c.avatar_url ? (
                    <img src={c.avatar_url} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F4B860', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#412402', flexShrink: 0 }}>
                      {c.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: 0 }}>{c.nome} {c.cognome}</p>
                      <span style={{ fontSize: 11, color: '#A1A1AA' }}>{tempoFa(c.ultimaOra || '')}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ultimoMessaggio}</p>
                  </div>
                  {(c.nonLetti || 0) > 0 && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#D85A30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 600, flexShrink: 0 }}>
                      {c.nonLetti}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {!contattoAttivo ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <i className="ti ti-message-circle" style={{ fontSize: 36, color: '#D4D4D8' }} />
                <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Seleziona una conversazione</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F4F4F5', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {contattoAttivo.avatar_url ? (
                    <img src={contattoAttivo.avatar_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F4B860', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#412402' }}>
                      {contattoAttivo.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: 0 }}>{contattoAttivo.nome} {contattoAttivo.cognome}</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messaggi.map(function(m) {
                    const mio = m.mittente_id === userId
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: mio ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', background: mio ? '#18181B' : '#F4F4F5', borderRadius: mio ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '10px 14px' }}>
                          <p style={{ fontSize: 13, color: mio ? 'white' : '#18181B', margin: '0 0 4px', lineHeight: 1.5 }}>{m.testo}</p>
                          <p style={{ fontSize: 10, color: mio ? '#71717A' : '#A1A1AA', margin: 0, textAlign: mio ? 'right' : 'left' }}>{orario(m.created_at)}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '12px 18px', borderTop: '0.5px solid #F4F4F5', display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Scrivi un messaggio..."
                    value={nuovoMessaggio}
                    onChange={e => setNuovoMessaggio(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && inviaMessaggio()}
                    style={{ flex: 1, border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={inviaMessaggio} disabled={!nuovoMessaggio.trim()} style={{ background: '#18181B', color: 'white', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !nuovoMessaggio.trim() ? 0.5 : 1 }}>
                    <i className="ti ti-send" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
