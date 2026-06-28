'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function Upload() {
  const [titolo, setTitolo] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [materia, setMateria] = useState('')
  const [universitaSelezionata, setUniversitaSelezionata] = useState('')
  const [prezzo, setPrezzo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const [suggerimentiUniversita, setSuggerimentiUniversita] = useState<string[]>([])
  const [cercandoMateria, setCercandoMateria] = useState(false)
  const [cercandoUniversita, setCercandoUniversita] = useState(false)
  const router = useRouter()

  const timerMateria = { current: null as any }
  const timerUniversita = { current: null as any }

  async function cercaMateria(v: string) {
    setMateria(v)
    if (v.length < 2) { setSuggerimentiMateria([]); return }
    setCercandoMateria(true)
    if (timerMateria.current) clearTimeout(timerMateria.current)
    timerMateria.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/cerca-universita', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: v, tipo: 'materia' })
        })
        const data = await res.json()
        setSuggerimentiMateria(data.risultati || [])
      } catch (e) { setSuggerimentiMateria([]) }
      setCercandoMateria(false)
    }, 400)
  }

  async function cercaUniversita(v: string) {
    setUniversitaSelezionata(v)
    if (v.length < 2) { setSuggerimentiUniversita([]); return }
    setCercandoUniversita(true)
    if (timerUniversita.current) clearTimeout(timerUniversita.current)
    timerUniversita.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/cerca-universita', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: v, tipo: 'universita' })
        })
        const data = await res.json()
        setSuggerimentiUniversita(data.risultati || [])
      } catch (e) { setSuggerimentiUniversita([]) }
      setCercandoUniversita(false)
    }, 400)
  }

  const handleUpload = async () => {
    if (!file) { setError('Seleziona un file PDF'); return }
    setLoading(true)
    setError('')

    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { setError('Devi accedere prima'); setLoading(false); return }
    const uid = userData.data.user.id

    const fileName = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('appunti').upload(fileName, file)
    if (uploadError) { setError('Errore nel caricamento: ' + uploadError.message); setLoading(false); return }

    const { data: urlData } = supabase.storage.from('appunti').getPublicUrl(fileName)
    const { error: dbError } = await supabase.from('notes').insert({
      titolo, descrizione, materia,
      universita: universitaSelezionata,
      prezzo: parseFloat(prezzo) || 0,
      file_url: urlData.publicUrl,
      autore_id: uid
    })

    if (dbError) {
      setError('Errore nel salvataggio: ' + dbError.message)
    } else {
      await fetch('/api/punti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utente_id: uid, azione: 'appunto_caricato' })
      })
      await fetch('/api/notifica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utente_id: uid,
          tipo: 'acquisto',
          titolo: 'Appunto pubblicato!',
          messaggio: 'Il tuo appunto "' + titolo + '" è ora disponibile su Klass. Hai guadagnato 50 punti!',
          link: '/esplora'
        })
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 12, background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Carica i tuoi appunti</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Condividi e guadagna con i tuoi materiali · <span style={{ color: '#059669', fontWeight: 600 }}>+50 punti</span></p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: 13, marginBottom: 16, background: '#ECFDF5', padding: '10px 14px', borderRadius: 8 }}>✓ Appunti caricati! Hai guadagnato 50 punti 🎉</p>}

          <input type="text" placeholder="Titolo (es. Analisi Matematica 1 — Limiti)" value={titolo} onChange={e => setTitolo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpload()} style={inputStyle} />
          <textarea placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input type="text" placeholder="Materia (es. Analisi Matematica)" value={materia} onChange={e => cercaMateria(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            {cercandoMateria && <p style={{ fontSize: 11, color: '#9CA3AF', padding: '4px 0' }}>Ricerca in corso...</p>}
            {suggerimentiMateria.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {suggerimentiMateria.map(s => (
                  <button key={s} onClick={() => { setMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input type="text" placeholder="Università o scuola" value={universitaSelezionata} onChange={e => cercaUniversita(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            {cercandoUniversita && <p style={{ fontSize: 11, color: '#9CA3AF', padding: '4px 0' }}>Ricerca in corso...</p>}
            {suggerimentiUniversita.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {suggerimentiUniversita.map(s => (
                  <button key={s} onClick={() => { setUniversitaSelezionata(s); setSuggerimentiUniversita([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <input type="number" step="0.01" placeholder="Prezzo in euro (0 per gratis)" value={prezzo} onChange={e => setPrezzo(e.target.value)} style={inputStyle} />

          <div style={{ border: '1px dashed #e5e7eb', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 20, background: '#f9fafb' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Trascina il PDF qui oppure clicca per selezionarlo</p>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
            {file && <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>✓ File selezionato: {file.name}</p>}
          </div>

          <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            <p style={{ fontSize: 12, color: '#059669' }}>Guadagnerai <strong>50 punti</strong> caricando questi appunti!</p>
          </div>

          <button onClick={handleUpload} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Caricamento in corso...' : 'Pubblica appunti (+50 punti)'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
