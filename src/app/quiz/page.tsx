'use client'

import { useState } from 'react'
import Layout from '@/app/components/Layout'

type Domanda = {
  domanda: string
  opzioni: string[]
  risposta_corretta: number
  spiegazione: string
}

type Flashcard = {
  fronte: string
  retro: string
}

type Schema = {
  titolo: string
  sezioni: { sottotema: string; punti: string[] }[]
}

export default function Quiz() {
  const [testoManuale, setTestoManuale] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [tabAttivo, setTabAttivo] = useState('quiz')
  const [quiz, setQuiz] = useState<Domanda[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [schema, setSchema] = useState<Schema | null>(null)
  const [flashcardGirate, setFlashcardGirate] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)
  const [error, setError] = useState('')
  const [rispostePresenti, setRispostePresenti] = useState<number[]>([])

  async function updateFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fileSelezionato = e.target.files ? e.target.files[0] : null
    setFile(fileSelezionato)
    if (!fileSelezionato) return
    setLoadingFile(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', fileSelezionato)
      const response = await fetch('/api/estrai-testo', { method: 'POST', body: formData })
      const data = await response.json()
      if (data.testo) { setTestoManuale(data.testo) }
      else { setError(data.error || 'Errore nella lettura del file') }
    } catch (e) { setError('Errore nel caricamento del file') }
    setLoadingFile(false)
  }

  async function generaContenuto() {
    if (testoManuale.length < 50) { setError('Carica un file oppure inserisci almeno 50 caratteri'); return }
    setLoading(true)
    setError('')
    setQuiz([])
    setFlashcards([])
    setSchema(null)
    setRispostePresenti([])
    setFlashcardGirate([])
    try {
      const endpoint = tabAttivo === 'flashcard' ? '/api/generate-flashcard' : tabAttivo === 'schema' ? '/api/generate-schema' : '/api/generate-quiz'
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testo: testoManuale }) })
      const data = await response.json()
      if (tabAttivo === 'quiz' && data.quiz) { setQuiz(data.quiz); setRispostePresenti(new Array(data.quiz.length).fill(-1)) }
      else if (tabAttivo === 'flashcard' && data.flashcard) { setFlashcards(data.flashcard) }
      else if (tabAttivo === 'schema' && data.schema) { setSchema(data.schema) }
      else { setError(data.error || 'Errore nella generazione') }
    } catch (e) { setError('Errore di connessione') }
    setLoading(false)
  }

  function giraFlashcard(i: number) {
    setFlashcardGirate(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  function cambiaTab(tab: string) {
    setTabAttivo(tab)
    setQuiz([])
    setFlashcards([])
    setSchema(null)
  }

  const tabs = [
    { id: 'quiz', label: '🧠 Quiz' },
    { id: 'flashcard', label: '🃏 Flashcard' },
    { id: 'schema', label: '🗺️ Schema' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Studia con AI</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Genera quiz, flashcard o schemi dai tuoi appunti</p>

        {/* TAB */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => cambiaTab(t.id)} style={{ padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: tabAttivo === t.id ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: tabAttivo === t.id ? 'white' : '#6B7280', boxShadow: tabAttivo === t.id ? 'none' : '0 0 0 0.5px #e5e7eb' }}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {/* INPUT */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Carica un file (PDF, Word o TXT)</p>
          <div style={{ border: '1px dashed #e5e7eb', borderRadius: 10, padding: 16, background: '#f9fafb', marginBottom: 16, textAlign: 'center' }}>
            <input type="file" accept=".pdf,.docx,.txt" onChange={updateFile} style={{ fontSize: 13 }} />
            {loadingFile && <p style={{ fontSize: 12, color: '#185FA5', marginTop: 8 }}>Lettura file in corso...</p>}
            {file && !loadingFile && testoManuale.length > 0 && (
              <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>File letto: {testoManuale.length} caratteri</p>
            )}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Oppure incolla il testo</p>
          <textarea
            placeholder="Incolla qui il testo dei tuoi appunti..."
            value={testoManuale}
            onChange={e => setTestoManuale(e.target.value)}
            rows={6}
            style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        <button
          onClick={generaContenuto}
          disabled={loading || loadingFile}
          style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '13px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 32, opacity: (loading || loadingFile) ? 0.7 : 1 }}
        >
          {loading ? 'Generazione in corso...' : `Genera ${tabAttivo}`}
        </button>

        {/* QUIZ */}
        {tabAttivo === 'quiz' && quiz.map((domanda, idx) => (
          <div key={idx} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>{idx + 1}. {domanda.domanda}</p>
            {domanda.opzioni.map((opzione, i) => {
              const selezionata = rispostePresenti[idx] === i
              const corretta = domanda.risposta_corretta === i
              const haRisposto = rispostePresenti[idx] !== -1
              let bg = 'white', border = '0.5px solid #e5e7eb', color = '#374151'
              if (haRisposto && corretta) { bg = '#ECFDF5'; border = '1px solid #059669'; color = '#065F46' }
              else if (haRisposto && selezionata && !corretta) { bg = '#FEF2F2'; border = '1px solid #DC2626'; color = '#991B1B' }
              return (
                <button key={i} onClick={() => { const n = [...rispostePresenti]; n[idx] = i; setRispostePresenti(n) }} style={{ width: '100%', textAlign: 'left', border, borderRadius: 8, padding: '11px 16px', marginBottom: 8, fontSize: 13, cursor: 'pointer', background: bg, color }}>
                  {opzione}
                </button>
              )
            })}
            {rispostePresenti[idx] !== -1 && (
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, fontStyle: 'italic' }}>{domanda.spiegazione}</p>
            )}
          </div>
        ))}

        {/* FLASHCARD */}
        {tabAttivo === 'flashcard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {flashcards.map((fc, i) => {
              const girata = flashcardGirate.includes(i)
              return (
                <div key={i} onClick={() => giraFlashcard(i)} style={{ background: girata ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, cursor: 'pointer', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: girata ? 'white' : '#111827', fontWeight: girata ? 400 : 600, lineHeight: 1.6 }}>
                    {girata ? fc.retro : fc.fronte}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* SCHEMA */}
        {tabAttivo === 'schema' && schema && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>{schema.titolo}</h2>
            {schema.sezioni.map((sezione, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#185FA5', marginBottom: 8 }}>{sezione.sottotema}</p>
                <ul style={{ paddingLeft: 20 }}>
                  {sezione.punti.map((punto, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{punto}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
