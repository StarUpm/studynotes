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
    setLoading(true); setError(''); setRisultato('')
    try {
      const res = await fetch('/api/youtube', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: youtubeUrl }) })
      const data = await res.json()
      if (data.testo) { setRisultato(data.testo) }
      else { setError(data.error || 'Errore nel processare il video') }
    } catch (e) { setError('Errore di connessione') }
    setLoading(false)
  }

  async function importaFoto() {
    if (!fotoFile) { setError('Seleziona una foto'); return }
    setLoading(true); setError(''); setRisultato('')
    try {
      const reader = new FileReader()
      reader.onload = async function(e) {
        const base64 = (e.target?.result as string)?.split(',')[1]
        const res = await fetch('/api/scansiona-foto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ immagine: base64, mimeType: fotoFile.type }) })
        const data = await res.json()
        if (data.testo) { setRisultato(data.testo) }
        else { setError(data.error || 'Errore nella scansione') }
        setLoading(false)
      }
      reader.readAsDataURL(fotoFile)
    } catch (e) { setError('Errore di connessione'); setLoading(false) }
  }

  async function generaRiassunto() {
    if (testoRiassunto.length < 50) { setError('Inserisci almeno 50 caratteri'); return }
    setLoading(true); setError(''); setRisultato('')
    try {
      const res = await fetch('/api/generate-riassunto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testo: testoRiassunto }) })
      const data = await res.json()
      if (data.riassunto) { setRisultato(data.riassunto) }
      else { setError(data.error || 'Errore nella generazione') }
    } catch (e) { setError('Errore di connessione') }
    setLoading(false)
  }

  function usaPerStudiare() {
    sessionStorage.setItem('klass_testo_importato', risultato)
    router.push('/studia')
  }

  const tabs = [
    { id: 'youtube', icon: 'ti-brand-youtube', label: 'Da YouTube' },
    { id: 'foto', icon: 'ti-camera', label: 'Scansiona foto' },
    { id: 'riassunto', icon: 'ti-file-text', label: 'Riassunto AI' },
  ]

  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Importa contenuti</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 28px' }}>Trasforma qualsiasi contenuto in materiale di studio</p>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '0.5px solid #F4F4F5' }}>
          {tabs.map(function(t) {
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setRisultato(''); setError('') }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, cursor: 'pointer', background: 'transparent', color: tab === t.id ? '#18181B' : '#A1A1AA', fontWeight: tab === t.id ? 500 : 400, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: tab === t.id ? '2px solid #18181B' : '2px solid transparent' }}>
                <i className={`ti ${t.icon}`} style={{ fontSize: 15 }} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: risultato ? '1fr 1fr' : '1fr', gap: 20 }}>
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
            {error && <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><p style={{ fontSize: 12, color: '#D85A30', margin: 0 }}>{error}</p></div>}

            {tab === 'youtube' && (
              <>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Importa da YouTube</h2>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 16px', lineHeight: 1.5 }}>Incolla il link di un video YouTube con i sottotitoli attivati</p>
                <div style={{ background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>Funziona con video che hanno i sottotitoli abilitati (CC)</p>
                </div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>URL del video</label>
                <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && importaYoutube()} style={{ ...inputStyle, marginBottom: 16 }} />
                <button onClick={importaYoutube} disabled={loading || !youtubeUrl} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (loading || !youtubeUrl) ? 0.6 : 1 }}>
                  {loading ? 'Elaborazione...' : 'Importa da YouTube'}
                </button>
              </>
            )}

            {tab === 'foto' && (
              <>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Scansiona appunti scritti a mano</h2>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 16px', lineHeight: 1.5 }}>Carica una foto dei tuoi appunti — l&apos;AI li digitalizza automaticamente</p>
                <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#185FA5', margin: 0, lineHeight: 1.5 }}>Fotografia in buona luce · Un foglio alla volta per risultati migliori</p>
                </div>
                <div style={{ border: '0.5px dashed #E4E4E7', borderRadius: 10, padding: '24px', textAlign: 'center', background: '#FAFAFA', marginBottom: 16 }}>
                  <i className="ti ti-camera" style={{ fontSize: 28, color: '#D4D4D8', display: 'block', marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 10px' }}>JPG, PNG, HEIC · max 10MB</p>
                  <input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files?.[0] || null)} style={{ fontSize: 12 }} />
                  {fotoFile && <p style={{ fontSize: 12, color: '#15803D', marginTop: 8 }}>✓ {fotoFile.name}</p>}
                </div>
                <button onClick={importaFoto} disabled={loading || !fotoFile} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (loading || !fotoFile) ? 0.6 : 1 }}>
                  {loading ? 'Scansione in corso...' : 'Scansiona appunti'}
                </button>
              </>
            )}

            {tab === 'riassunto' && (
              <>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Genera riassunto AI</h2>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 16px', lineHeight: 1.5 }}>Incolla un testo lungo — l&apos;AI lo riassume con i punti chiave</p>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Testo da riassumere</label>
                <textarea placeholder="Incolla qui il testo..." value={testoRiassunto} onChange={e => setTestoRiassunto(e.target.value)} rows={10} style={{ ...inputStyle, resize: 'vertical', marginBottom: 8, lineHeight: 1.6 }} />
                <p style={{ fontSize: 11, color: '#A1A1AA', margin: '0 0 16px' }}>{testoRiassunto.length} caratteri</p>
                <button onClick={generaRiassunto} disabled={loading || testoRiassunto.length < 50} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (loading || testoRiassunto.length < 50) ? 0.6 : 1 }}>
                  {loading ? 'Generazione...' : 'Genera riassunto'}
                </button>
              </>
            )}
          </div>

          {risultato && (
            <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: 0 }}>Risultato</h3>
                <span style={{ fontSize: 11, color: '#A1A1AA' }}>{risultato.length} caratteri</span>
              </div>
              <div style={{ background: '#FAFAFA', borderRadius: 8, padding: 14, maxHeight: 380, overflowY: 'auto', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{risultato}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={usaPerStudiare} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Usa per studiare con AI
                </button>
                <button onClick={() => navigator.clipboard.writeText(risultato)} style={{ width: '100%', background: 'white', color: '#18181B', border: '0.5px solid #E4E4E7', padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  Copia testo
                </button>
                <button onClick={() => { const blob = new Blob([risultato], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'klass_contenuto.txt'; a.click() }} style={{ width: '100%', background: 'white', color: '#18181B', border: '0.5px solid #E4E4E7', padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  Scarica come file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
