'use client'

import { useState, useRef } from 'react'
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
  const timerM = useRef<any>(null)
  const timerU = useRef<any>(null)
  const router = useRouter()

  async function cercaMateria(v: string) {
    setMateria(v)
    if (v.length < 2) { setSuggerimentiMateria([]); return }
    if (timerM.current) clearTimeout(timerM.current)
    timerM.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'materia' }) })
      const data = await res.json()
      setSuggerimentiMateria(data.risultati || [])
    }, 400)
  }

  async function cercaUniversita(v: string) {
    setUniversitaSelezionata(v)
    if (v.length < 2) { setSuggerimentiUniversita([]); return }
    if (timerU.current) clearTimeout(timerU.current)
    timerU.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'universita' }) })
      const data = await res.json()
      setSuggerimentiUniversita(data.risultati || [])
    }, 400)
  }

  const handleUpload = async () => {
    if (!file) { setError('Seleziona un file PDF'); return }
    if (!titolo) { setError('Inserisci un titolo'); return }
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
      titolo, descrizione, materia, universita: universitaSelezionata,
      prezzo: parseFloat(prezzo) || 0, file_url: urlData.publicUrl, autore_id: uid
    })
    if (dbError) { setError('Errore nel salvataggio: ' + dbError.message) }
    else {
      await fetch('/api/punti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: uid, azione: 'appunto_caricato' }) })
      await fetch('/api/notifica', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: uid, tipo: 'acquisto', titolo: 'Appunto pubblicato!', messaggio: 'Il tuo appunto "' + titolo + '" è ora disponibile. Hai guadagnato 50 punti!', link: '/esplora' }) })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Carica appunti</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 32px' }}>Condividi i tuoi materiali e guadagna <span style={{ color: '#15803D', fontWeight: 500 }}>+50 punti</span></p>

        {error && <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#D85A30', margin: 0 }}>{error}</p></div>}
        {success && <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#15803D', margin: 0 }}>Appunti caricati! Hai guadagnato 50 punti.</p></div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Titolo</label>
            <input type="text" placeholder="Es. Analisi Matematica 1 — Limiti" value={titolo} onChange={e => setTitolo(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Descrizione</label>
            <textarea placeholder="Descrivi il contenuto degli appunti..." value={descrizione} onChange={e => setDescrizione(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Materia</label>
            <input type="text" placeholder="Es. Analisi Matematica" value={materia} onChange={e => cercaMateria(e.target.value)} style={inputStyle} />
            {suggerimentiMateria.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                {suggerimentiMateria.map(s => <button key={s} onClick={() => { setMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#18181B', borderBottom: '0.5px solid #F4F4F5' }}>{s}</button>)}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Università</label>
            <input type="text" placeholder="Es. Università di Bologna" value={universitaSelezionata} onChange={e => cercaUniversita(e.target.value)} style={inputStyle} />
            {suggerimentiUniversita.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                {suggerimentiUniversita.map(s => <button key={s} onClick={() => { setUniversitaSelezionata(s); setSuggerimentiUniversita([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#18181B', borderBottom: '0.5px solid #F4F4F5' }}>{s}</button>)}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Prezzo (€)</label>
            <input type="number" step="0.01" placeholder="0 per gratis" value={prezzo} onChange={e => setPrezzo(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>File PDF</label>
            <div style={{ border: '0.5px dashed #E4E4E7', borderRadius: 10, padding: '24px', textAlign: 'center', background: '#FAFAFA' }}>
              <i className="ti ti-file-upload" style={{ fontSize: 28, color: '#D4D4D8', display: 'block', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 12px' }}>Seleziona un file PDF</p>
              <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 12 }} />
              {file && <p style={{ fontSize: 12, color: '#15803D', marginTop: 8 }}>✓ {file.name}</p>}
            </div>
          </div>

          <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-trophy" style={{ fontSize: 15, color: '#15803D' }} />
            <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>Guadagnerai <strong>50 punti</strong> caricando questi appunti</p>
          </div>

          <button onClick={handleUpload} disabled={loading} style={{ background: '#18181B', color: 'white', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Caricamento...' : 'Pubblica appunti'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
