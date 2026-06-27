'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Domanda = {
  id: string
  autore_id: string
  titolo: string
  testo: string
  materia: string
  universita: string
  voti: number
  created_at: string
  numeroRisposte: number
  autore: { nome: string; cognome: string }
}

export default function Forum() {
  const [domande, setDomande] = useState<Domanda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroMateria, setFiltroMateria] = useState('')
  const [mostraForm, setMostraForm] = useState(false)
  const [titolo, setTitolo] = useState('')
  const [testo, setTesto] = useState('')
  const [materia, setMateria] = useState('')
  const [invio, setInvio] = useState(false)
  const [userId, setUserId] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      await caricaDomande()
    }
    init()
  }, [router])

  async function caricaDomande() {
    const result = await supabase
      .from('forum_domande')
      .select('*, profiles(nome, cognome)')
      .order('created_at', { ascending: false })

    const risposteResult = await supabase
      .from('forum_risposte')
      .select('domanda_id')

    if (result.data) {
      const domandeConRisposte = result.data.map(function(d) {
        const risposte = risposteResult.data ? risposteResult.data.filter(function(r) { return r.domanda_id === d.id }) : []
        return {
          ...d,
          numeroRisposte: risposte.length,
          autore: d.profiles || { nome: 'Utente', cognome: '' }
        }
      })
      setDomande(domandeConRisposte)
    }
    setLoading(false)
  }

  async function pubblicaDomanda() {
    if (!titolo || !testo) return
    setInvio(true)
    const result = await supabase.from('forum_domande').insert({
      autore_id: userId,
      titolo, testo, materia,
      universita: ''
    })
    if (!result.error) {
      setTitolo('')
      setTesto('')
      setMateria('')
      setMostraForm(false)
      await caricaDomande()
      await fetch('/api/punti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utente_id: userId, azione: 'recensione_lasciata' })
      })
    }
    setInvio(false)
  }

  async function vota(domandaId: string) {
    await supabase.from('forum_domande').update({ voti: (domande.find(d => d.id === domandaId)?.voti || 0) + 1 }).eq('id', domandaId)
    await caricaDomande()
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

  function nomeAutore(d: Domanda) {
    if (d.autore?.nome && d.autore?.cognome) return d.autore.nome + ' ' + d.autore.cognome
    if (d.autore?.nome) return d.autore.nome
    return 'Studente'
  }

  const domandeFiltrate = domande.filter(function(d) {
    const s = search.toLowerCase()
    const matchSearch = !s || d.titolo.toLowerCase().includes(s) || d.testo.toLowerCase().includes(s)
    const matchMateria = !filtroMateria || d.materia === filtroMateria
    return matchSearch && matchMateria
  })

  const materieUniche = Array.from(new Set(domande.map(d => d.materia).filter(Boolean))).sort()

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>💬 Forum Q&A</h1>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Fai domande e aiuta altri studenti</p>
          </div>
          <button
            onClick={() => setMostraForm(!mostraForm)}
            style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + Fai una domanda
          </button>
        </div>

        {mostraForm && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Nuova domanda</h3>
            <input
              type="text"
              placeholder="Titolo della domanda (es. Come si calcola il limite con l'Hospital?)"
              value={titolo}
              onChange={e => setTitolo(e.target.value)}
              style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 12, background: 'white' }}
            />
            <textarea
              placeholder="Descrivi la tua domanda nel dettaglio..."
              value={testo}
              onChange={e => setTesto(e.target.value)}
              rows={4}
              style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 12 }}
            />
            <input
              type="text"
              placeholder="Materia (es. Analisi Matematica)"
              value={materia}
              onChange={e => setMateria(e.target.value)}
              style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 16, background: 'white' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setMostraForm(false)} style={{ flex: 1, background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Annulla
              </button>
              <button onClick={pubblicaDomanda} disabled={invio || !titolo || !testo} style={{ flex: 2, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (invio || !titolo || !testo) ? 0.7 : 1 }}>
                {invio ? 'Pubblicazione...' : 'Pubblica domanda'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Cerca domande..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', fontSize: 13, outline: 'none', background: 'white' }}
          />
          <select
            value={filtroMateria}
            onChange={e => setFiltroMateria(e.target.value)}
            style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white', color: '#374151' }}
          >
            <option value="">Tutte le materie</option>
            {materieUniche.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading && <p style={{ color: '#9CA3AF' }}>Caricamento...</p>}

        {!loading && domandeFiltrate.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Nessuna domanda ancora</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Sii il primo a fare una domanda!</p>
            <button onClick={() => setMostraForm(true)} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Fai una domanda
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {domandeFiltrate.map(function(d) {
            return (
              <div
                key={d.id}
                onClick={() => router.push('/forum/' + d.id)}
                style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', gap: 16 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
                  <button
                    onClick={function(e) { e.stopPropagation(); vota(d.id) }}
                    style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}
                  >
                    ▲
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#185FA5' }}>{d.voti}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.4 }}>{d.titolo}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{d.testo}</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {d.materia && <span style={{ fontSize: 11, background: '#EFF6FF', color: '#185FA5', padding: '2px 8px', borderRadius: 20 }}>{d.materia}</span>}
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>👤 {nomeAutore(d)}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>🕐 {tempoFa(d.created_at)}</span>
                    <span style={{ fontSize: 11, color: d.numeroRisposte > 0 ? '#059669' : '#9CA3AF', fontWeight: d.numeroRisposte > 0 ? 600 : 400 }}>
                      💬 {d.numeroRisposte} {d.numeroRisposte === 1 ? 'risposta' : 'risposte'}
                    </span>
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
