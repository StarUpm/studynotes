'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/app/components/Layout'

type Domanda = {
  domanda: string
  opzioni: string[]
  risposta_corretta: number
  spiegazione: string
}

export default function QuizSessione() {
  const [quiz, setQuiz] = useState<Domanda[]>([])
  const [indice, setIndice] = useState(0)
  const [risposte, setRisposte] = useState<number[]>([])
  const [mostrandoRisultato, setMostrandoRisultato] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('klass_quiz')
    if (saved) { const q = JSON.parse(saved); setQuiz(q); setRisposte(new Array(q.length).fill(-1)) }
    else { router.push('/studia/quiz') }
    setLoading(false)
  }, [router])

  if (loading || quiz.length === 0) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  const domanda = quiz[indice]
  const haRisposto = risposte[indice] !== -1
  const corrette = risposte.filter((r, i) => r === quiz[i]?.risposta_corretta).length
  const errate = risposte.filter((r, i) => r !== -1 && r !== quiz[i]?.risposta_corretta).length
  const punteggio = Math.round((corrette / quiz.length) * 100)

  function rispondi(i: number) {
    if (haRisposto) return
    const nuove = [...risposte]; nuove[indice] = i; setRisposte(nuove)
  }

  async function prossima() {
    if (indice < quiz.length - 1) { setIndice(indice + 1) }
    else {
      const userData = await supabase.auth.getUser()
      if (userData.data.user) {
        await fetch('/api/punti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: userData.data.user.id, azione: 'quiz_completato' }) })
      }
      setMostrandoRisultato(true)
    }
  }

  function riprovaErrori() {
    const quizErrori = quiz.filter((_, i) => risposte[i] !== quiz[i].risposta_corretta)
    sessionStorage.setItem('klass_quiz', JSON.stringify(quizErrori))
    setQuiz(quizErrori); setRisposte(new Array(quizErrori.length).fill(-1)); setIndice(0); setMostrandoRisultato(false)
  }

  if (mostrandoRisultato) {
    return (
      <Layout>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 32, textAlign: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 56, fontWeight: 500, color: '#18181B', margin: '0 0 4px', letterSpacing: -1 }}>{punteggio}%</p>
            <p style={{ fontSize: 14, color: '#71717A', margin: '0 0 16px' }}>
              {punteggio >= 90 ? 'Eccellente!' : punteggio >= 70 ? 'Ottimo risultato!' : punteggio >= 50 ? 'Buon lavoro!' : 'Continua a studiare!'}
            </p>
            <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', display: 'inline-block', marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>Hai guadagnato <strong>20 punti</strong></p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
              {[{ num: corrette, label: 'Corrette', color: '#15803D' }, { num: errate, label: 'Errate', color: '#DC2626' }, { num: quiz.length - corrette - errate, label: 'Saltate', color: '#B45309' }].map(s => (
                <div key={s.label} style={{ background: '#FAFAFA', borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 22, fontWeight: 500, color: s.color, margin: '0 0 2px' }}>{s.num}</p>
                  <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {errate > 0 && <button onClick={riprovaErrori} style={{ fontSize: 13, background: '#FFFBEB', color: '#B45309', border: '0.5px solid #FDE68A', padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>Riprova errori ({errate})</button>}
              <button onClick={() => router.push('/punti')} style={{ fontSize: 13, background: '#F0FDF4', color: '#15803D', border: '0.5px solid #BBF7D0', padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>Vedi punti</button>
              <button onClick={() => router.push('/studia/quiz')} style={{ fontSize: 13, background: '#18181B', color: 'white', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>Nuovo quiz</button>
            </div>
          </div>
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 14px' }}>Riepilogo</h3>
            <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
              {quiz.map(function(d, i) {
                const corretta = risposte[i] === d.risposta_corretta
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '0.5px solid #F4F4F5', alignItems: 'flex-start' }}>
                    <i className={`ti ${corretta ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 16, color: corretta ? '#15803D' : '#DC2626', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, color: '#18181B', margin: '0 0 2px' }}>{d.domanda}</p>
                      {!corretta && risposte[i] !== -1 && <p style={{ fontSize: 12, color: '#DC2626', margin: '0 0 2px' }}>Tua: {d.opzioni[risposte[i]]}</p>}
                      {!corretta && <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>Corretta: {d.opzioni[d.risposta_corretta]}</p>}
                    </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#71717A' }}>Domanda {indice + 1} di {quiz.length}</span>
          <span style={{ fontSize: 13, color: '#18181B', fontWeight: 500 }}>{corrette} corrette · {errate} errate</span>
        </div>
        <div style={{ background: '#F4F4F5', borderRadius: 20, height: 4, marginBottom: 24 }}>
          <div style={{ height: 4, borderRadius: 20, background: '#18181B', width: `${((indice + 1) / quiz.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 20px', lineHeight: 1.5 }}>{domanda.domanda}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {domanda.opzioni.map(function(opzione, i) {
              const selezionata = risposte[indice] === i
              const corretta = domanda.risposta_corretta === i
              let bg = 'white', borderColor = '#E4E4E7', color = '#374151'
              if (haRisposto && corretta) { bg = '#F0FDF4'; borderColor = '#15803D'; color = '#15803D' }
              else if (haRisposto && selezionata && !corretta) { bg = '#FEF2F2'; borderColor = '#DC2626'; color = '#DC2626' }
              return (
                <button key={i} onClick={() => rispondi(i)} style={{ width: '100%', textAlign: 'left', border: `0.5px solid ${borderColor}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, cursor: haRisposto ? 'default' : 'pointer', background: bg, color, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: haRisposto && corretta ? '#15803D' : haRisposto && selezionata && !corretta ? '#DC2626' : '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: haRisposto && (corretta || (selezionata && !corretta)) ? 'white' : '#71717A', flexShrink: 0 }}>
                    {['A','B','C','D'][i]}
                  </div>
                  {opzione}
                </button>
              )
            })}
          </div>
          {haRisposto && (
            <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '12px 14px', marginTop: 14, borderLeft: '3px solid #18181B' }}>
              <p style={{ fontSize: 12, color: '#71717A', lineHeight: 1.6, margin: 0 }}>{domanda.spiegazione}</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => indice > 0 && setIndice(indice - 1)} disabled={indice === 0} style={{ background: 'white', border: '0.5px solid #E4E4E7', padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: indice === 0 ? 'default' : 'pointer', color: '#71717A', opacity: indice === 0 ? 0.4 : 1 }}>
            Precedente
          </button>
          <button onClick={prossima} disabled={!haRisposto} style={{ background: haRisposto ? '#18181B' : '#F4F4F5', border: 'none', padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: haRisposto ? 'pointer' : 'default', color: haRisposto ? 'white' : '#A1A1AA' }}>
            {indice < quiz.length - 1 ? 'Prossima' : 'Risultati'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
