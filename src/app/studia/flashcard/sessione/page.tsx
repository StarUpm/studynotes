'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/app/components/Layout'

type Flashcard = { fronte: string; retro: string }

export default function FlashcardSessione() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [indice, setIndice] = useState(0)
  const [girata, setGirata] = useState(false)
  const [completate, setCompletate] = useState<boolean[]>([])
  const [fine, setFine] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('klass_flashcard')
    if (saved) { const c = JSON.parse(saved); setCards(c); setCompletate(new Array(c.length).fill(false)) }
    else { router.push('/studia/flashcard') }
    setLoading(false)
  }, [router])

  async function segnaEAvanza(sapevo: boolean) {
    const nuove = [...completate]; nuove[indice] = sapevo; setCompletate(nuove)
    if (indice < cards.length - 1) { setIndice(indice + 1); setGirata(false) }
    else {
      const userData = await supabase.auth.getUser()
      if (userData.data.user) {
        await fetch('/api/punti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: userData.data.user.id, azione: 'flashcard_completata' }) })
      }
      setFine(true)
    }
  }

  if (loading || cards.length === 0) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  const sapevo = completate.filter(Boolean).length
  const nonSapevo = completate.filter((c, i) => i < indice && !c).length

  if (fine) {
    return (
      <Layout>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 48, fontWeight: 500, color: '#18181B', margin: '0 0 8px', letterSpacing: -1 }}>{Math.round((sapevo / cards.length) * 100)}%</p>
          <p style={{ fontSize: 14, color: '#71717A', margin: '0 0 24px' }}>
            {sapevo} su {cards.length} flashcard — Hai guadagnato 15 punti!
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {nonSapevo > 0 && (
              <button onClick={() => { const difficili = cards.filter((_, i) => !completate[i]); sessionStorage.setItem('klass_flashcard', JSON.stringify(difficili)); setCards(difficili); setCompletate(new Array(difficili.length).fill(false)); setIndice(0); setGirata(false); setFine(false) }} style={{ fontSize: 13, background: '#FFFBEB', color: '#B45309', border: '0.5px solid #FDE68A', padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>
                Riprova difficili ({nonSapevo})
              </button>
            )}
            <button onClick={() => router.push('/studia/flashcard')} style={{ fontSize: 13, background: '#18181B', color: 'white', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
              Nuove flashcard
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const card = cards[indice]
  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#71717A' }}>{indice + 1} / {cards.length}</span>
          <span style={{ fontSize: 13, color: '#18181B' }}>{sapevo} sapevo · {nonSapevo} ripassare</span>
        </div>
        <div style={{ background: '#F4F4F5', borderRadius: 20, height: 4, marginBottom: 28 }}>
          <div style={{ height: 4, borderRadius: 20, background: '#18181B', width: `${((indice) / cards.length) * 100}%` }} />
        </div>
        <div onClick={() => setGirata(!girata)} style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 16, padding: '48px 32px', textAlign: 'center', cursor: 'pointer', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: '#A1A1AA', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{girata ? 'Risposta' : 'Domanda'}</p>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#18181B', margin: 0, lineHeight: 1.5 }}>{girata ? card.retro : card.fronte}</p>
          {!girata && <p style={{ fontSize: 12, color: '#D85A30', margin: '16px 0 0' }}>Clicca per vedere la risposta</p>}
        </div>
        {girata && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => segnaEAvanza(false)} style={{ background: '#FEF2F2', color: '#DC2626', border: '0.5px solid #FECACA', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Non sapevo
            </button>
            <button onClick={() => segnaEAvanza(true)} style={{ background: '#F0FDF4', color: '#15803D', border: '0.5px solid #BBF7D0', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Sapevo
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
