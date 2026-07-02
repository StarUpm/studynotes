'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function QuizSetup() {
  const [testo, setTesto] = useState('')
  const [numeroDomande, setNumeroDomande] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('klass_testo_studio')
    if (saved) setTesto(saved)
  }, [])

  async function generaQuiz() {
    if (!testo) { setError('Inserisci del testo prima di generare il quiz'); return }
    setLoading(true); setError('')
    try {
      const prompt = `Genera ${numeroDomande} domande a risposta multipla in italiano basate su questo testo. Per ogni domanda fornisci 4 opzioni e indica quale è corretta. Rispondi SOLO con un array JSON in questo formato esatto, senza testo aggiuntivo: [{"domanda": "testo", "opzioni": ["a","b","c","d"], "risposta_corretta": 0, "spiegazione": "testo"}]. Testo: ${testo.substring(0, 8000)}`
      const res = await fetch('/api/generate-quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testo: prompt }) })
      const data = await res.json()
      if (data.quiz) {
        sessionStorage.setItem('klass_quiz', JSON.stringify(data.quiz))
        router.push('/studia/quiz/sessione')
      } else { setError(data.error || 'Errore nella generazione') }
    } catch (e) { setError('Errore di connessione') }
    setLoading(false)
  }

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/studia')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: 13, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Torna a Studia
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Genera quiz</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 28px' }}>L&apos;AI crea domande a risposta multipla dai tuoi appunti</p>

        {error && <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#D85A30', margin: 0 }}>{error}</p></div>}

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 8 }}>Testo degli appunti</label>
          <textarea placeholder="Incolla qui il testo..." value={testo} onChange={e => setTesto(e.target.value)} rows={8} style={{ width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 12 }}>Numero di domande</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[5, 10, 15, 20].map(function(n) {
              return (
                <button key={n} onClick={() => setNumeroDomande(n)} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: numeroDomande === n ? '#18181B' : 'white', color: numeroDomande === n ? 'white' : '#71717A', border: numeroDomande === n ? 'none' : '0.5px solid #E4E4E7', fontWeight: numeroDomande === n ? 500 : 400 }}>
                  {n}
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={generaQuiz} disabled={loading || !testo} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: (loading || !testo) ? 0.6 : 1 }}>
          {loading ? 'Generazione in corso...' : 'Genera quiz'}
        </button>
      </div>
    </Layout>
  )
}
