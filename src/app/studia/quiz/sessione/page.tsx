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
    if (saved) {
      const q = JSON.parse(saved)
      setQuiz(q)
      setRisposte(new Array(q.length).fill(-1))
    } else {
      router.push('/studia/quiz')
    }
    setLoading(false)
  }, [router])

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento quiz...</p>
      </div>
    </Layout>
  )

  if (quiz.length === 0) return null

  const domanda = quiz[indice]
  const haRisposto = risposte[indice] !== -1
  const corrette = risposte.filter((r, i) => r === quiz[i]?.risposta_corretta).length
  const errate = risposte.filter((r, i) => r !== -1 && r !== quiz[i]?.risposta_corretta).length
  const punteggio = Math.round((corrette / quiz.length) * 100)

  function rispondi(i: number) {
    if (haRisposto) return
    const nuove = [...risposte]
    nuove[indice] = i
    setRisposte(nuove)
  }

  async function prossima() {
    if (indice < quiz.length - 1) {
      setIndice(indice + 1)
    } else {
      const userData = await supabase.auth.getUser()
      if (userData.data.user) {
        await fetch('/api/punti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utente_id: userData.data.user.id, azione: 'quiz_completato' })
        })
      }
      setMostrandoRisultato(true)
    }
  }

  function precedente() {
    if (indice > 0) setIndice(indice - 1)
  }

  function riprovaErrori() {
    const quizErrori = quiz.filter((_, i) => risposte[i] !== quiz[i].risposta_corretta)
    sessionStorage.setItem('klass_quiz', JSON.stringify(quizErrori))
    setQuiz(quizErrori)
    setRisposte(new Array(quizErrori.length).fill(-1))
    setIndice(0)
    setMostrandoRisultato(false)
  }

  function emoji() {
    if (punteggio >= 90) return '🏆'
    if (punteggio >= 70) return '🎉'
    if (punteggio >= 50) return '💪'
    return '📚'
  }

  function messaggio() {
    if (punteggio >= 90) return 'Eccellente! Conosci benissimo questo argomento.'
    if (punteggio >= 70) return 'Ottimo risultato! Hai risposto bene alla maggior parte delle domande.'
    if (punteggio >= 50) return 'Buon lavoro! Ripassa gli argomenti sbagliati per migliorare.'
    return 'Continua a studiare — ripassa gli argomenti e riprova!'
  }

  if (mostrandoRisultato) {
    return (
      <Layout>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji()}</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: '#185FA5', marginBottom: 4 }}>{punteggio}%</div>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 12 }}>{messaggio()}</p>
            <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 10, padding: '10px 16px', marginBottom: 24, display: 'inline-block' }}>
              <p style={{ fontSize: 13, color: '#059669' }}>🏆 Hai guadagnato <strong>20 punti</strong> per aver completato il quiz!</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { num: corrette, label: '✅ Corrette', color: '#059669' },
                { num: errate, label: '❌ Errate', color: '#DC2626' },
                { num: quiz.length - corrette - errate, label: '⏭ Saltate', color: '#B45309' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {errate > 0 && (
                <button onClick={riprovaErrori} style={{ background: '#FFFBEB', color: '#B45309', border: '0.5px solid #FDE68A', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  🔁 Riprova gli errori ({errate})
                </button>
              )}
              <button onClick={() => router.push('/punti')} style={{ background: '#ECFDF5', color: '#059669', border: '0.5px solid #A7F3D0', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                🏆 Vedi i miei punti
              </button>
              <button onClick={() => router.push('/studia/quiz')} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Nuovo quiz
              </button>
              <button onClick={() => router.push('/studia')} style={{ background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Torna alla home
              </button>
            </div>
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Riepilogo domande</h3>
            {quiz.map((d, i) => {
              const corretta = risposte[i] === d.risposta_corretta
              const risposta = risposte[i]
              return (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < quiz.length - 1 ? '0.5px solid #f3f4f6' : 'none' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14 }}>{corretta ? '✅' : '❌'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 4 }}>{i + 1}. {d.domanda}</p>
                      {risposta !== -1 && !corretta && (
                        <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 2 }}>Tua risposta: {d.opzioni[risposta]}</p>
                      )}
                      {!corretta && (
                        <p style={{ fontSize: 12, color: '#059669' }}>Risposta corretta: {d.opzioni[d.risposta_corretta]}</p>
                      )}
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

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Domanda {indice + 1} di {quiz.length}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#185FA5' }}>✅ {corrette} corrette · ❌ {errate} errate</span>
        </div>

        <div style={{ background: '#f3f4f6', borderRadius: 20, height: 6, marginBottom: 28 }}>
          <div style={{ height: 6, borderRadius: 20, background: 'linear-gradient(90deg,#185FA5,#7F77DD)', width: `${((indice + 1) / quiz.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28, marginBottom: 16 }}>
          <span style={{ fontSize: 11, background: '#EFF6FF', color: '#185FA5', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 14 }}>Risposta multipla</span>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20, lineHeight: 1.5 }}>{domanda.domanda}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {domanda.opzioni.map((opzione, i) => {
              const selezionata = risposte[indice] === i
              const corretta = domanda.risposta_corretta === i
              let bg = 'white', border = '0.5px solid #e5e7eb', color = '#374151'
              let letterBg = '#f3f4f6', letterColor = '#6B7280'
              if (haRisposto && corretta) { bg = '#ECFDF5'; border = '1px solid #059669'; color = '#065F46'; letterBg = '#059669'; letterColor = 'white' }
              else if (haRisposto && selezionata && !corretta) { bg = '#FEF2F2'; border = '1px solid #DC2626'; color = '#991B1B'; letterBg = '#DC2626'; letterColor = 'white' }
              return (
                <button key={i} onClick={() => rispondi(i)} style={{ width: '100%', textAlign: 'left', border, borderRadius: 10, padding: '13px 16px', fontSize: 14, cursor: haRisposto ? 'default' : 'pointer', background: bg, color, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: letterBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: letterColor, flexShrink: 0 }}>
                    {['A','B','C','D'][i]}
                  </div>
                  {opzione}
                </button>
              )
            })}
          </div>

          {haRisposto && (
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginTop: 16, borderLeft: '3px solid #185FA5' }}>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>💡 {domanda.spiegazione}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={precedente} disabled={indice === 0} style={{ background: 'white', border: '0.5px solid #e5e7eb', padding: '11px 20px', borderRadius: 8, fontSize: 13, cursor: indice === 0 ? 'default' : 'pointer', color: '#374151', opacity: indice === 0 ? 0.4 : 1 }}>
            ← Precedente
          </button>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {haRisposto ? (indice < quiz.length - 1 ? 'Vai alla prossima' : 'Vedi risultati') : 'Seleziona una risposta'}
          </span>
          <button onClick={prossima} disabled={!haRisposto} style={{ background: haRisposto ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : '#f3f4f6', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: haRisposto ? 'pointer' : 'default', color: haRisposto ? 'white' : '#9CA3AF' }}>
            {indice < quiz.length - 1 ? 'Prossima →' : 'Vedi risultati →'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
