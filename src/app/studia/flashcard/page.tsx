'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function StudiaFlashcard() {
  const [numeroCarte, setNumeroCarte] = useState(20)
  const [modalita, setModalita] = useState('classica')
  const [tipoContenuto, setTipoContenuto] = useState('termine')
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

      const res = await fetch('/api/generate-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testo: testoFinale, numeroCarte, tipoContenuto })
      })
      const data = await res.json()

      if (data.flashcard) {
        let carte = data.flashcard
        if (modalita === 'casuale') {
          carte = carte.sort(() => Math.random() - 0.5)
        }
        sessionStorage.setItem('klass_flashcard', JSON.stringify(carte))
        sessionStorage.setItem('klass_flashcard_config', JSON.stringify({ modalita }))
        router.push('/studia/flashcard/sessione')
      } else {
        setError(data.error || 'Errore nella generazione')
      }
    } catch (e) {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  const chipStyle = (sel: boolean) => ({
    padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: sel ? 'none' : '0.5px solid #e5e7eb',
    background: sel ? 'linear-gradient(135deg,#534AB7,#7F77DD)' : 'white',
    color: sel ? 'white' : '#6B7280',
    fontWeight: sel ? 600 : 400
  } as React.CSSProperties)

  const tabStyle = (sel: boolean) => ({
    flex: 1, padding: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    border: 'none', textAlign: 'center' as const,
    background: sel ? 'linear-gradient(135deg,#534AB7,#7F77DD)' : 'white',
    color: sel ? 'white' : '#6B7280',
  })

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/studia')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna a Studia con AI</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🃏 Flashcard</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Genera flashcard automatiche dai tuoi appunti</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Impostazioni flashcard</h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Scegli quante carte generare e come vuoi studiare</p>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Numero di flashcard</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[10, 20, 30, 50].map(n => (
              <button key={n} onClick={() => setNumeroCarte(n)} style={chipStyle(numeroCarte === n)}>
                {n} carte
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Modalità di studio</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { id: 'classica', label: '🔄 Classica — gira la carta' },
              { id: 'difficili', label: '⚡ Solo le difficili' },
              { id: 'casuale', label: '🎲 Ordine casuale' },
            ].map(m => (
              <button key={m.id} onClick={() => setModalita(m.id)} style={chipStyle(modalita === m.id)}>
                {m.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Tipo di contenuto</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { id: 'termine', label: 'Termine → Definizione' },
              { id: 'domanda', label: 'Domanda → Risposta' },
              { id: 'concetto', label: 'Concetto → Esempio' },
            ].map(t => (
              <button key={t.id} onClick={() => setTipoContenuto(t.id)} style={chipStyle(tipoContenuto === t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#EEEDFE', border: '0.5px solid #C4C0F0', borderRadius: 10, padding: '14px 16px', marginBottom: 24, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <p style={{ fontSize: 12, color: '#534AB7', lineHeight: 1.6 }}>Le flashcard vengono generate automaticamente dall&apos;AI analizzando i tuoi appunti. Non devi prepararle tu — ci pensa Klass!</p>
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
              placeholder="Incolla qui il testo dei tuoi appunti. Più testo fornisci, più precise saranno le flashcard generate..."
              value={testo}
              onChange={e => setTesto(e.target.value)}
              rows={8}
              style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
            />
          )}

          <button
            onClick={genera}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#534AB7,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Generazione in corso...' : 'Genera flashcard →'}
          </button>
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>Dopo aver cliccato verrai portato alla sessione di studio</p>
        </div>
      </div>
    </Layout>
  )
}
