'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Domanda = {
  id: string
  autore_id: string
  titolo: string
  testo: string
  materia: string
  voti: number
  created_at: string
  autore: { nome: string; cognome: string }
}

type Risposta = {
  id: string
  autore_id: string
  testo: string
  voti: number
  migliore: boolean
  created_at: string
  autore: { nome: string; cognome: string }
}

export default function ForumDomanda() {
  const [domanda, setDomanda] = useState<Domanda | null>(null)
  const [risposte, setRisposte] = useState<Risposta[]>([])
  const [nuovaRisposta, setNuovaRisposta] = useState('')
  const [loading, setLoading] = useState(true)
  const [invio, setInvio] = useState(false)
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const params = useParams()
  const domandaId = params.domandaId as string

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      await caricaDati()
    }
    init()
  }, [domandaId])

  async function caricaDati() {
    const [domandaResult, risposteResult] = await Promise.all([
      supabase.from('forum_domande').select('*, profiles(nome, cognome)').eq('id', domandaId).single(),
      supabase.from('forum_risposte').select('*, profiles(nome, cognome)').eq('domanda_id', domandaId).order('migliore', { ascending: false }).order('voti', { ascending: false })
    ])
    if (domandaResult.data) setDomanda({ ...domandaResult.data, autore: domandaResult.data.profiles || { nome: 'Utente', cognome: '' } })
    if (risposteResult.data) setRisposte(risposteResult.data.map(r => ({ ...r, autore: r.profiles || { nome: 'Utente', cognome: '' } })))
    setLoading(false)
  }

  async function inviaRisposta() {
    if (!nuovaRisposta.trim()) return
    setInvio(true)
    const result = await supabase.from('forum_risposte').insert({ domanda_id: domandaId, autore_id: userId, testo: nuovaRisposta.trim() })
    if (!result.error) {
      setNuovaRisposta('')
      await caricaDati()
      await fetch('/api/punti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: userId, azione: 'recensione_lasciata' }) })
    }
    setInvio(false)
  }

  async function votaRisposta(rispostaId: string, votiAttuali: number) {
    await supabase.from('forum_risposte').update({ voti: votiAttuali + 1 }).eq('id', rispostaId)
    await caricaDati()
  }

  async function segnaComeMigliore(rispostaId: string) {
    if (!domanda || domanda.autore_id !== userId) return
    await supabase.from('forum_risposte').update({ migliore: false }).eq('domanda_id', domandaId)
    await supabase.from('forum_risposte').update({ migliore: true }).eq('id', rispostaId)
    await caricaDati()
  }

  function tempoFa(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Adesso'
    if (min < 60) return min + ' min fa'
    const ore = Math.floor(min / 60)
    if (ore < 24) return ore + ' ore fa'
    return Math.floor(ore / 24) + ' giorni fa'
  }

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  if (!domanda) return <Layout><div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Domanda non trovata</p></div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/forum')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Torna al forum
        </button>

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 44 }}>
              <div style={{ background: '#FAFAFA', border: '0.5px solid #E4E4E7', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-chevron-up" style={{ fontSize: 16, color: '#71717A' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#18181B' }}>{domanda.voti}</span>
            </div>
            <div style={{ flex: 1 }}>
              {domanda.materia && <span style={{ fontSize: 11, background: '#FFF8F6', color: '#D85A30', padding: '2px 8px', borderRadius: 20, border: '0.5px solid #FECACA', display: 'inline-block', marginBottom: 10 }}>{domanda.materia}</span>}
              <h1 style={{ fontSize: 18, fontWeight: 500, color: '#18181B', margin: '0 0 12px', lineHeight: 1.4 }}>{domanda.titolo}</h1>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: '0 0 14px', whiteSpace: 'pre-wrap' }}>{domanda.testo}</p>
              <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>
                {domanda.autore?.nome} {domanda.autore?.cognome} · {tempoFa(domanda.created_at)}
              </p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 14px' }}>
          {risposte.length} {risposte.length === 1 ? 'risposta' : 'risposte'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {risposte.map(function(r) {
            return (
              <div key={r.id} style={{ background: r.migliore ? '#F0FDF4' : 'white', border: r.migliore ? '0.5px solid #BBF7D0' : '0.5px solid #E4E4E7', borderRadius: 12, padding: 20 }}>
                {r.migliore && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <i className="ti ti-circle-check" style={{ fontSize: 14, color: '#15803D' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#15803D' }}>Migliore risposta</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 44 }}>
                    <button onClick={() => votaRisposta(r.id, r.voti)} style={{ background: '#FAFAFA', border: '0.5px solid #E4E4E7', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <i className="ti ti-chevron-up" style={{ fontSize: 16, color: '#71717A' }} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#18181B' }}>{r.voti}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{r.testo}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>
                        {r.autore?.nome} {r.autore?.cognome} · {tempoFa(r.created_at)}
                      </p>
                      {domanda.autore_id === userId && !r.migliore && (
                        <button onClick={() => segnaComeMigliore(r.id)} style={{ fontSize: 11, background: '#F0FDF4', color: '#15803D', border: '0.5px solid #BBF7D0', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
                          Segna come migliore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {risposte.length === 0 && (
          <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Nessuna risposta ancora — sii il primo!</p>
          </div>
        )}

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 14px' }}>La tua risposta</h3>
          <textarea
            placeholder="Scrivi la tua risposta..."
            value={nuovaRisposta}
            onChange={e => setNuovaRisposta(e.target.value)}
            rows={5}
            style={{ width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 12, lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>+10 punti per ogni risposta</p>
            <button onClick={inviaRisposta} disabled={invio || !nuovaRisposta.trim()} style={{ background: '#18181B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (invio || !nuovaRisposta.trim()) ? 0.6 : 1 }}>
              {invio ? 'Invio...' : 'Pubblica risposta'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
