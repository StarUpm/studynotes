'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Flashcard = {
  fronte: string
  retro: string
}

export default function FlashcardSessione() {
  const [carte, setCarte] = useState<Flashcard[]>([])
  const [indice, setIndice] = useState(0)
  const [girata, setGirata] = useState(false)
  const [stati, setStati] = useState<string[]>([])
  const [mostraRisultato, setMostraRisultato] = useState(false)
  const [vistaGriglia, setVistaGriglia] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('klass_flashcard')
    if (saved) {
      const c = JSON.parse(saved)
      setCarte(c)
      setStati(new Array(c.length).fill(''))
    } else {
      router.push('/studia/flashcard')
    }
    setLoading(false)
  }, [])

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento flashcard...</p>
      </div>
    </Layout>
  )

  if (carte.length === 0) return null

  const carta = carte[indice]
  const sapevo = stati.filter(s => s === 'sapevo').length
  const nonSapevo = stati.filter(s => s === 'nonsapevo').length
  const quasi = stati.filter(s => s === 'quasi').length
  const completate = stati.filter(s => s !== '').length

  function segna(stato: string) {
    const nuovi = [...stati]
    nuovi[indice] = stato
    setStati(nuovi)
    setGirata(false)
    if (indice < carte.length - 1) {
      setTimeout(() => setIndice(indice + 1), 300)
    } else {
      setTimeout(() => setMostraRisultato(true), 300)
    }
  }

  function ripassaDifficili() {
    const difficili = carte.filter((_, i) => stati[i] === 'nonsapevo' || stati[i] === 'quasi')
    sessionStorage.setItem('klass_flashcard', JSON.stringify(difficili))
    setCarte(difficili)
    setStati(new Array(difficili.length).fill(''))
    setIndice(0)
    setGirata(false)
    setMostraRisultato(false)
  }

  function coloreStato(s: string) {
    if (s === 'sapevo') return { bg: '#ECFDF5', border: '#A7F3D0', text: '✅ Sapevo' }
    if (s === 'nonsapevo') return { bg: '#FEF2F2', border: '#FECACA', text: '❌ Non sapevo' }
    if (s === 'quasi') return { bg: '#FFFBEB', border: '#FDE68A', text: '😐 Quasi' }
    return { bg: '#f9fafb', border: '#e5e7eb', text: '⏳ Da fare' }
  }

  if (mostraRisultato) {
    return (
      <Layout>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🃏</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Sessione completata!</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { num: sapevo, label: '✅ Sapevo', color: '#059669' },
                { num: nonSapevo, label: '❌ Non sapevo', color: '#DC2626' },
                { num: quasi, label: '😐 Quasi', color: '#B45309' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(nonSapevo + quasi) > 0 && (
                <button onClick={ripassaDifficili} style={{ background: '#FFFBEB', color: '#B45309', border: '0.5px solid #FDE68A', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  🔁 Ripassa le difficili ({nonSapevo + quasi})
                </button>
              )}
              <button onClick={() => router.push('/studia/flashcard')} style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)', color: 'white', border: 'none', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Nuova sessione
              </button>
              <button onClick={() => router.push('/studia')} style={{ background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Torna alla home
              </button>
            </div>
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Tutte le flashcard</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {carte.map((c, i) => {
                const s = coloreStato(stati[i])
                return (
                  <div key={i} style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{c.fronte}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5, marginBottom: 8 }}>{c.retro}</p>
                    <span style={{ fontSize: 10, color: '#6B7280' }}>{s.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Carta {indice + 1} di {carte.length}</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>✅ {sapevo}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>❌ {nonSapevo}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#B45309' }}>😐 {quasi}</span>
          </div>
        </div>

        <div style={{ background: '#f3f4f6', borderRadius: 20, height: 6, marginBottom: 28 }}>
          <div style={{ height: 6, borderRadius: 20, background: 'linear-gradient(90deg,#534AB7,#7F77DD)', width: `${(completate / carte.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div
          onClick={() => setGirata(!girata)}
          style={{
            background: girata ? 'linear-gradient(135deg,#534AB7,#7F77DD)' : 'white',
            border: girata ? 'none' : '0.5px solid #e5e7eb',
            borderRadius: 20,
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 32px',
            cursor: 'pointer',
            marginBottom: 24,
            position: 'relative',
            transition: 'background 0.3s'
          }}
        >
          <span style={{ position: 'absolute', top: 16, left: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: girata ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}>
            {girata ? 'Retro — risposta' : 'Fronte — clicca per girare'}
          </span>
          <p style={{ fontSize: girata ? 16 : 22, fontWeight: girata ? 400 : 700, color: girata ? 'white' : '#111827', lineHeight: 1.6 }}>
            {girata ? carta.retro : carta.fronte}
          </p>
          {!girata && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>Tocca la carta per vedere la risposta</p>}
        </div>

        {girata && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <button onClick={() => segna('nonsapevo')} style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#FEF2F2', color: '#DC2626' }}>
              ❌ Non sapevo
            </button>
            <button onClick={() => segna('quasi')} style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#FFFBEB', color: '#B45309' }}>
              😐 Quasi
            </button>
            <button onClick={() => segna('sapevo')} style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#ECFDF5', color: '#059669' }}>
              ✅ Sapevo
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { if (indice > 0) { setIndice(indice - 1); setGirata(false) } }} disabled={indice === 0} style={{ background: 'white', border: '0.5px solid #e5e7eb', padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: indice === 0 ? 'default' : 'pointer', color: '#374151', opacity: indice === 0 ? 0.4 : 1 }}>
            ← Precedente
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {carte.slice(Math.max(0, indice - 4), Math.min(carte.length, indice + 5)).map((_, i) => {
              const realI = Math.max(0, indice - 4) + i
              const s = stati[realI]
              let bg = '#e5e7eb'
              if (realI === indice) bg = '#534AB7'
              else if (s === 'sapevo') bg = '#059669'
              else if (s === 'nonsapevo') bg = '#DC2626'
              else if (s === 'quasi') bg = '#B45309'
              return (
                <div key={realI} style={{ width: realI === indice ? 20 : 8, height: 8, borderRadius: 4, background: bg, transition: 'all 0.2s' }} />
              )
            })}
          </div>
          <button onClick={() => { if (!girata) setGirata(true) }} style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'white' }}>
            Gira →
          </button>
        </div>
      </div>
    </Layout>
  )
}
