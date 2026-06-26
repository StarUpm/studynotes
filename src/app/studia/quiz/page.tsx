'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function StudiaQuiz() {
  const [numeroDomande, setNumeroDomande] = useState(20)
  const [tipoDomande, setTipoDomande] = useState('multipla')
  const [difficolta, setDifficolta] = useState('media')
  const [sorgente, setSorgente] = useState('file')
  const [file, setFile] = useState<File | null>(null)
  const [testo, setTesto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function genera() {
    if (sorgente === 'file' && !file) { setError('Seleziona un file'); return }
    if (sorgente === 'testo' && testo.length < 50) { setError('Inserisci almeno 50 caratteri'); return }
    setLoading(true)
    setError('')

    try {
      let testoFinale = testo

      if (sorgente === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/estrai-testo', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        testoFinale = data.testo
      }

      const prompt = `Genera ${numeroDomande} domande in italiano di tipo "${tipoDomande}" con difficoltà "${difficolta}" basate su questi appunti universitari. Per ogni domanda fornisci 4 opzioni e indica quale è corretta. Rispondi SOLO con un array JSON in questo formato esatto, senza testo aggiuntivo: [{"domanda": "testo", "opzioni": ["a","b","c","d"], "risposta_corretta": 0, "spiegazione": "testo"}]. Testo appunti: ${testoFinale.substring(0, 8000)}`

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testo: testoFinale, prompt, numeroDomande, tipoDomande, difficolta })
      })
      const data = await res.json()

      if (data.quiz) {
        sessionStorage.setItem('klass_quiz', JSON.stringify(data.quiz))
        sessionStorage.setItem('klass_quiz_config', JSON.stringify({ numeroDomande, tipoDomande, difficolta }))
        router.push('/studia/quiz/sessione')
      } else {
        setError(data.error || 'Errore nella generazione')
      }
    } catch (e) {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  const chipStyle = (sel: boolean, color: string) => ({
    padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: sel ? 'none' : '0.5px solid #e5e7eb',
    background: sel ? color : 'white',
    color: sel ? 'white' : '#6B7280',
    fontWeight: sel ? 600 : 400
  } as React.CSSProperties)

  const tabStyle = (sel: boolean) => ({
    flex: 1, padding: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    border: 'none', textAlign: 'center' as const,
    background: sel ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white',
    color: sel ? 'white' : '#6B7280',
  })

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <button onClick={() => router.push('/studia')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer' }}>← Torna a Studia con AI</button>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🧠 Quiz</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Configura il tuo quiz personalizzato</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Impostazioni quiz</h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Scegli come vuoi che sia il tuo quiz</p>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Numero di domande</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[10, 20, 30, 40].map(n => (
              <button key={n} onClick={() => setNumeroDomande(n)} style={chipStyle(numeroDomande === n, 'linear-gradient(135deg,#185FA5,#7F77DD)')}>
                {n} domande
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Tipo di domande</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { id: 'multipla', label: 'Risposta multipla' },
              { id: 'verofalso', label: 'Vero / Falso' },
              { id: 'breve', label: 'Risposta breve' },
              { id: 'misto', label: 'Misto' },
            ].map(t => (
              <button key={t.id} onClick={() => setTipoDomande(t.id)} style={chipStyle(tipoDomande === t.id, 'linear-gradient(135deg,#185FA5,#7F77DD)')}>
                {t.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Difficoltà</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { id: 'facile', label: 'Facile' },
              { id: 'media', label: 'Media' },
              { id: 'difficile', label: 'Difficile' },
            ].map(d => (
              <button key={d.id} onClick={() => setDifficolta(d.id)} style={chipStyle(difficolta === d.id, 'linear-gradient(135deg,#185FA5,#7F77DD)')}>
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ height: '0.5px', background: '#e5e7eb', margin: '24px 0' }} />

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Sorgente degli appunti — scegli uno</p>
          <div style={{ display: 'flex', border: '0.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <button onClick={() => setSorgente('file')} style={tabStyle(sorgente === 'file')}>📄 Carica file</button>
            <button onClick={() => setSorgente('testo')} style={tabStyle(sorgente === 'testo')}>✏️ Incolla testo</button>
          </div>

          {sorgente === 'file' && (
            <div style={{ border: '1px dashed #e5e7eb', borderRadius: 12, padding: 28, background: '#f9fafb', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Trascina qui il tuo file oppure clicca per selezionarlo</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>PDF · Word (.docx) · Testo (.txt)</p>
              <input type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
              {file && <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>✓ {file.name}</p>}
            </div>
          )}

          {sorgente === 'testo' && (
            <textarea
              placeholder="Incolla qui il testo dei tuoi appunti. Più testo fornisci, più preciso sarà il quiz generato..."
              value={testo}
              onChange={e => setTesto(e.target.value)}
              rows={8}
              style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
            />
          )}

          <button
            onClick={genera}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Generazione in corso...' : 'Genera quiz →'}
          </button>
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>Dopo aver cliccato verrai portato al quiz</p>
        </div>
      </div>
    </Layout>
  )
}
