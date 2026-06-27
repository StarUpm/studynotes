'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function Importa() {
  const [tab, setTab] = useState('youtube')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [risultato, setRisultato] = useState('')

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [testoRiassunto, setTestoRiassunto] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
    }
    init()
  }, [router])

  async function importaYoutube() {
    if (!youtubeUrl) { setError('Inserisci un URL YouTube'); return }
    setLoading(true)
    setError('')
    setRisultato('')
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      })
      const data = await res.json()
      if (data.testo) {
        setRisultato(data.testo)
      } else {
        setError(data.error || 'Errore nel processare il video')
      }
    } catch (e) {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  async function importaFoto() {
    if (!fotoFile) { setError('Seleziona una foto'); return }
    setLoading(true)
    setError('')
    setRisultato('')
    try {
      const reader = new FileReader()
      reader.onload = async function(e) {
        const base64 = (e.target?.result as string)?.split(',')[1]
        const res = await fetch('/api/scansiona-foto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ immagine: base64, mimeType: fotoFile.type })
        })
        const data = await res.json()
        if (data.testo) {
          setRisultato(data.testo)
        } else {
          setError(data.error || 'Errore nella scansione')
        }
        setLoading(false)
      }
      reader.readAsDataURL(fotoFile)
    } catch (e) {
      setError('Errore di connessione')
      setLoading(false)
    }
  }

  async function generaRiassunto() {
    if (testoRiassunto.length < 50) { setError('Inserisci almeno 50 caratteri'); return }
    setLoading(true)
    setError('')
    setRisultato('')
    try {
      const res = await fetch('/api/generate-riassunto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testo: testoRiassunto })
      })
      const data = await res.json()
      if (data.riassunto) {
        setRisultato(data.riassunto)
      } else {
        setError(data.error || 'Errore nella generazione')
      }
    } catch (e) {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  function usaPerStudiare() {
    sessionStorage.setItem('klass_testo_importato', risultato)
    router.push('/studia')
  }

  function copia() {
    navigator.clipboard.writeText(risultato)
    alert('Testo copiato!')
  }

  const tabs = [
    { id: 'youtube', label: '▶️ Da YouTube', desc: 'Importa e trascrivi video YouTube' },
    { id: 'foto', label: '📷 Scansiona foto', desc: 'Fotografa appunti scritti a mano' },
    { id: 'riassunto', label: '📝 Riassunto AI', desc: 'Genera riassunto da testo o PDF' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>⚡ Importa contenuti</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Trasforma qualsiasi contenuto in materiale di studio con l&apos;AI</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
          {tabs.map(function(t) {
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setRisultato(''); setError('') }}
                style={{ padding: '16px 20px', borderRadius: 12, fontSize: 14, cursor: 'pointer', border: tab === t.id ? 'none' : '0.5px solid #e5e7eb', background: tab === t.id ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: tab === t.id ? 'white' : '#374151', textAlign: 'left', fontWeight: tab === t.id ? 600 : 400 }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{t.label.split(' ')[0]}</div>
                <div style={{ fontSize: 13, fontWeight: tab === t.id ? 600 : 500, marginBottom: 4 }}>{t.label.split(' ').slice(1).join(' ')}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{t.desc}</div>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: risultato ? '1fr 1fr' : '1fr', gap: 20 }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28 }}>

            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

            {tab === 'youtube' && (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Importa da YouTube</h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Incolla il link di un video YouTube — l&apos;AI lo trascriverà e riassumerà</p>

                <div style={{ background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: '#B45309' }}>⚠️ Funziona meglio con video che hanno i sottotitoli abilitati. Lezioni universitarie, TED Talks, tutorial — ideali!</p>
                </div>

                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>URL del video</p>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 20, background: 'white' }}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=...'].map(function(ex, i) {
                    return (
                      <span key={i} style={{ fontSize: 11, background: '#f9fafb', border: '0.5px solid #e5e7eb', padding: '4px 10px', borderRadius: 20, color: '#6B7280' }}>
                        {i === 0 ? '✓ youtu.be/...' : '✓ youtube.com/watch?v=...'}
                      </span>
                    )
                  })}
                </div>

                <button onClick={importaYoutube} disabled={loading || !youtubeUrl} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (loading || !youtubeUrl) ? 0.7 : 1 }}>
                  {loading ? '⏳ Elaborazione video...' : '▶️ Importa da YouTube'}
                </button>
              </>
            )}

            {tab === 'foto' && (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Scansiona appunti scritti a mano</h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Carica una foto dei tuoi appunti — l&apos;AI li leggerà e digitalizzerà automaticamente</p>

                <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: '#185FA5', lineHeight: 1.6 }}>
                    💡 Suggerimenti per risultati migliori:
                    <br />• Fotografa in buona luce
                    <br />• Tieni la foto dritta e ben leggibile
                    <br />• Un foglio alla volta per migliore precisione
                  </p>
                </div>

                <div style={{ border: '1px dashed #e5e7eb', borderRadius: 12, padding: 28, background: '#f9fafb', textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Carica una foto degli appunti</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>JPG, PNG, HEIC — max 10MB</p>
                  <input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
                  {fotoFile && <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>✓ {fotoFile.name}</p>}
                </div>

                <button onClick={importaFoto} disabled={loading || !fotoFile} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (loading || !fotoFile) ? 0.7 : 1 }}>
                  {loading ? '⏳ Scansione in corso...' : '📷 Scansiona appunti'}
                </button>
              </>
            )}

            {tab === 'riassunto' && (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Genera riassunto AI</h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Incolla un testo lungo — l&apos;AI lo riassumerà in modo strutturato con i punti chiave</p>

                <textarea
                  placeholder="Incolla qui il testo che vuoi riassumere — capitoli di libri, dispense, appunti..."
                  value={testoRiassunto}
                  onChange={e => setTestoRiassunto(e.target.value)}
                  rows={10}
                  style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 16, lineHeight: 1.6 }}
                />

                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                  {testoRiassunto.length} caratteri · il riassunto sarà circa {Math.round(testoRiassunto.length / 4)} caratteri
                </p>

                <button onClick={generaRiassunto} disabled={loading || testoRiassunto.length < 50} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (loading || testoRiassunto.length < 50) ? 0.7 : 1 }}>
                  {loading ? '⏳ Generazione riassunto...' : '📝 Genera riassunto'}
                </button>
              </>
            )}
          </div>

          {risultato && (
            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                  {tab === 'youtube' ? '▶️ Contenuto estratto' : tab === 'foto' ? '📷 Testo scansionato' : '📝 Riassunto generato'}
                </h3>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{risultato.length} caratteri</span>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{risultato}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={usaPerStudiare} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  🤖 Usa per studiare con AI
                </button>
                <button onClick={copia} style={{ width: '100%', background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  📋 Copia testo
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([risultato], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'klass_contenuto.txt'
                    a.click()
                  }}
                  style={{ width: '100%', background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                >
                  ⬇️ Scarica come file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
