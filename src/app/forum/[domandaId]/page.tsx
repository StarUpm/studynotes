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
  }, [domandaId, router])

  async function caricaDati() {
    const [domandaResult, risposteResult] = await Promise.all([
      supabase.from('forum_domande').select('*, profiles(nome, cognome)').eq('id', domandaId).single(),
      supabase.from('forum_risposte').select('*, profiles(nome, cognome)').eq('domanda_id', domandaId).order('migliore', { ascending: false }).order('voti', { ascending: false })
    ])

    if (domandaResult.data) {
      setDomanda({ ...domandaResult.data, autore: domandaResult.data.profiles || { nome: 'Utente', cognome: '' } })
    }
    if (risposteResult.data) {
      setRisposte(risposteResult.data.map(function(r) {
        return { ...r, autore: r.profiles || { nome: 'Utente', cognome: '' } }
      }))
    }
    setLoading(false)
  }

  async function inviaRisposta() {
    if (!nuovaRisposta.trim()) return
    setInvio(true)
    const result = await supabase.from('forum_risposte').insert({
      domanda_id: domandaId,
      autore_id: userId,
      testo: nuovaRisposta.trim()
    })
    if (!result.error) {
      setNuovaRisposta('')
      await caricaDati()
      await fetch('/api/punti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utente_id: userId, azione: 'recensione_lasciata' })
      })
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

  function nomeAutore(a: { nome: string; cognome: string }) {
    if (a?.nome && a?.cognome) return a.nome + ' ' + a.cognome
    if (a?.nome) return a.nome
    return 'Studente'
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  if (!domanda) return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF' }}>Domanda non trovata</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/forum')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
          ← Torna al forum
        </button>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
              <div style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▲</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#185FA5' }}>{domanda.voti}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                {domanda.materia && <span style={{ fontSize: 11, background: '#EFF6FF', color: '#185FA5', padding: '2px 8px', borderRadius: 20 }}>{domanda.materia}</span>}
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12, lineHeight: 1.4 }}>{domanda.titolo}</h1>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{domanda.testo}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                👤 {nomeAutore(domanda.autore)} · 🕐 {tempoFa(domanda.created_at)}
              </p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          {risposte.length} {risposte.length === 1 ? 'risposta' : 'risposte'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {risposte.map(function(r) {
            return (
              <div key={r.id} style={{ background: r.migliore ? '#ECFDF5' : 'white', border: r.migliore ? '1px solid #A7F3D0' : '0.5px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                {r.migliore && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 14 }}>✅</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Migliore risposta</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
                    <button
                      onClick={() => votaRisposta(r.id, r.voti)}
                      style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}
                    >
                      ▲
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#185FA5' }}>{r.voti}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{r.testo}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 12, color: '#9CA3AF' }}>
                        👤 {nomeAutore(r.autore)} · 🕐 {tempoFa(r.created_at)}
                      </p>
                      {domanda.autore_id === userId && !r.migliore && (
                        <button
                          onClick={() => segnaComeMigliore(r.id)}
                          style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', border: '0.5px solid #A7F3D0', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}
                        >
                          ✓ Segna come migliore
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
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna risposta ancora — sii il primo a rispondere!</p>
          </div>
        )}

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>La tua risposta</h3>
          <textarea
            placeholder="Scrivi la tua risposta qui... Sii dettagliato e utile per altri studenti!"
            value={nuovaRisposta}
            onChange={e => setNuovaRisposta(e.target.value)}
            rows={5}
            style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 16, lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>+10 punti per ogni risposta!</p>
            <button
              onClick={inviaRisposta}
              disabled={invio || !nuovaRisposta.trim()}
              style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (invio || !nuovaRisposta.trim()) ? 0.7 : 1 }}
            >
              {invio ? 'Invio...' : 'Pubblica risposta'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
