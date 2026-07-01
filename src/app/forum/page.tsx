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
    const result = await supabase.from('forum_domande').select('*, profiles(nome, cognome)').order('created_at', { ascending: false })
    const risposteResult = await supabase.from('forum_risposte').select('domanda_id')
    if (result.data) {
      setDomande(result.data.map(function(d) {
        return { ...d, numeroRisposte: risposteResult.data?.filter(r => r.domanda_id === d.id).length || 0, autore: d.profiles || { nome: 'Utente', cognome: '' } }
      }))
    }
    setLoading(false)
  }

  async function pubblicaDomanda() {
    if (!titolo || !testo) return
    setInvio(true)
    const result = await supabase.from('forum_domande').insert({ autore_id: userId, titolo, testo, materia, universita: '' })
    if (!result.error) {
      setTitolo(''); setTesto(''); setMateria(''); setMostraForm(false)
      await caricaDomande()
    }
    setInvio(false)
  }

  async function vota(domandaId: string, votiAttuali: number) {
    await supabase.from('forum_domande').update({ voti: votiAttuali + 1 }).eq('id', domandaId)
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

  const domandeFiltrate = domande.filter(function(d) {
    const s = search.toLowerCase()
    return (!s || d.titolo.toLowerCase().includes(s) || d.testo.toLowerCase().includes(s)) &&
      (!filtroMateria || d.materia === filtroMateria)
  })

  const materieUniche = Array.from(new Set(domande.map(d => d.materia).filter(Boolean))).sort()
  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Forum Q&A</h1>
            <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Fai domande e aiuta altri studenti</p>
          </div>
          <button onClick={() => setMostraForm(!mostraForm)} style={{ fontSize: 13, background: '#18181B', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-plus" style={{ fontSize: 15 }} />
            Fai una domanda
          </button>
        </div>

        {mostraForm && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Nuova domanda</h3>
            <input type="text" placeholder="Titolo della domanda" value={titolo} onChange={e => setTitolo(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            <textarea placeholder="Descrivi la tua domanda nel dettaglio..." value={testo} onChange={e => setTesto(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }} />
            <input type="text" placeholder="Materia (opzionale)" value={materia} onChange={e => setMateria(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setMostraForm(false)} style={{ flex: 1, background: 'white', color: '#71717A', border: '0.5px solid #E4E4E7', padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Annulla</button>
              <button onClick={pubblicaDomanda} disabled={invio || !titolo || !testo} style={{ flex: 2, background: '#18181B', color: 'white', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (invio || !titolo || !testo) ? 0.6 : 1 }}>
                {invio ? 'Pubblicazione...' : 'Pubblica domanda'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input type="text" placeholder="Cerca domande..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="">Tutte le materie</option>
            {materieUniche.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Caricamento...</p>}

        {!loading && domandeFiltrate.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="ti ti-message-off" style={{ fontSize: 36, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 4px' }}>Nessuna domanda ancora</p>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Sii il primo a fare una domanda!</p>
          </div>
        )}

        <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
          {domandeFiltrate.map(function(d) {
            return (
              <div key={d.id} style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: '0.5px solid #F4F4F5', cursor: 'pointer' }} onClick={() => router.push('/forum/' + d.id)}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 44 }}>
                  <button onClick={e => { e.stopPropagation(); vota(d.id, d.voti) }} style={{ background: '#FAFAFA', border: '0.5px solid #E4E4E7', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <i className="ti ti-chevron-up" style={{ fontSize: 16, color: '#71717A' }} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#18181B' }}>{d.voti}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 4px', lineHeight: 1.4 }}>{d.titolo}</h3>
                  <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 10px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{d.testo}</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {d.materia && <span style={{ fontSize: 11, background: '#FFF8F6', color: '#D85A30', padding: '2px 8px', borderRadius: 20, border: '0.5px solid #FECACA' }}>{d.materia}</span>}
                    <span style={{ fontSize: 11, color: '#A1A1AA' }}>{d.autore?.nome} {d.autore?.cognome}</span>
                    <span style={{ fontSize: 11, color: '#A1A1AA' }}>{tempoFa(d.created_at)}</span>
                    <span style={{ fontSize: 11, color: d.numeroRisposte > 0 ? '#15803D' : '#A1A1AA', fontWeight: d.numeroRisposte > 0 ? 500 : 400 }}>
                      {d.numeroRisposte} {d.numeroRisposte === 1 ? 'risposta' : 'risposte'}
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
