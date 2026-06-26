'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function StudiaSchema() {
  const [tipoSchema, setTipoSchema] = useState('mappa')
  const [dettaglio, setDettaglio] = useState('medio')
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

      const res = await fetch('/api/generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testo: testoFinale, tipoSchema, dettaglio })
      })
      const data = await res.json()

      if (data.schema) {
        sessionStorage.setItem('klass_schema', JSON.stringify(data.schema))
        sessionStorage.setItem('klass_schema_config', JSON.stringify({ tipoSchema, dettaglio }))
        router.push('/studia/schema/risultato')
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
    background: sel ? 'linear-gradient(135deg,#0F6E56,#1D9E75)' : 'white',
    color: sel ? 'white' : '#6B7280',
  })

  const tipiSchema = [
    { id: 'mappa', icon: '🗺️', title: 'Mappa concettuale', desc: 'Schema visivo con nodi e connessioni tra i concetti principali' },
    { id: 'discorsivo', icon: '📝', title: 'Schema discorsivo', desc: 'Testo strutturato con titoli, paragrafi e spiegazioni' },
    { id: 'punti', icon: '📋', title: 'Schema a punti', desc: 'Elenco gerarchico con punti e sottopunti ben organizzati' },
    { id: 'tabella', icon: '📊', title: 'Tabella comparativa', desc: 'Confronto tra concetti, teorie o elementi in formato tabella' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={function() { router.push('/studia') }} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
          ← Torna a Studia con AI
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🗺️ Schema</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Genera schemi e mappe concettuali dai tuoi appunti</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Impostazioni schema</h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Scegli il tipo di schema che vuoi generare</p>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Tipo di schema</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
            {tipiSchema.map(function(t) {
              const sel = tipoSchema === t.id
              return (
                <button
                  key={t.id}
                  onClick={function() { setTipoSchema(t.id) }}
                  style={{
                    border: sel ? '1.5px solid #1D9E75' : '0.5px solid #e5e7eb',
                    borderRadius: 12, padding: 16, cursor: 'pointer',
                    background: sel ? '#ECFDF5' : 'white', textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: sel ? '#0F6E56' : '#111827', marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>{t.desc}</div>
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Livello di dettaglio</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { id: 'sintetico', label: '🔹 Sintetico' },
              { id: 'medio', label: '🔶 Medio' },
              { id: 'dettagliato', label: '🔷 Dettagliato' },
            ].map(function(d) {
              return (
                <button key={d.id} onClick={function() { setDettaglio(d.id) }} style={chipStyle(dettaglio === d.id, 'linear-gradient(135deg,#0F6E56,#1D9E75)')}>
                  {d.label}
                </button>
              )
            })}
          </div>

          <div style={{ height: '0.5px', background: '#e5e7eb', margin: '24px 0' }} />

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Sorgente degli appunti — scegli uno</p>
          <div style={{ display: 'flex', border: '0.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <button onClick={function() { setSorgente('file') }} style={tabStyle(sorgente === 'file')}>📄 Carica file</button>
            <button onClick={function() { setSorgente('testo') }} style={tabStyle(sorgente === 'testo')}>✏️ Incolla testo</button>
          </div>

          {sorgente === 'file' && (
            <div style={{ border: '1px dashed #e5e7eb', borderRadius: 12, padding: 28, background: '#f9fafb', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Trascina qui il tuo file oppure clicca per selezionarlo</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>PDF · Word (.docx) · Testo (.txt)</p>
              <input type="file" accept=".pdf,.docx,.txt" onChange={function(e) { setFile(e.target.files?.[0] || null) }} style={{ fontSize: 13 }} />
              {file && <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>✓ {file.name}</p>}
            </div>
          )}

          {sorgente === 'testo' && (
            <textarea
              placeholder="Incolla qui il testo dei tuoi appunti. Più testo fornisci, più completo sarà lo schema generato..."
              value={testo}
              onChange={function(e) { setTesto(e.target.value) }}
              rows={8}
              style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
            />
          )}

          <button
            onClick={genera}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Generazione in corso...' : 'Genera schema →'}
          </button>
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>Dopo aver cliccato verrai portato allo schema — potrai scaricarlo e stamparlo</p>
        </div>
      </div>
    </Layout>
  )
}
