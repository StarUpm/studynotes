'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { universita, materie } from '@/lib/dati-universita'
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
  const router = useRouter()

  function updateMateria(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setMateria(v)
    setSuggerimentiMateria(v.length > 0 ? materie.filter(m => m.toLowerCase().includes(v.toLowerCase())).slice(0, 6) : [])
  }

  function updateUniversita(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setUniversitaSelezionata(v)
    setSuggerimentiUniversita(v.length > 0 ? universita.filter(u => u.toLowerCase().includes(v.toLowerCase())).slice(0, 6) : [])
  }

  const handleUpload = async () => {
    if (!file) { setError('Seleziona un file PDF'); return }
    setLoading(true)
    setError('')
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setError('Devi accedere prima'); setLoading(false); return }

    const fileName = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('appunti').upload(fileName, file)
    if (uploadError) { setError('Errore nel caricamento: ' + uploadError.message); setLoading(false); return }

    const { data: urlData } = supabase.storage.from('appunti').getPublicUrl(fileName)
    const { error: dbError } = await supabase.from('notes').insert({
      titolo, descrizione, materia,
      universita: universitaSelezionata,
      prezzo: parseFloat(prezzo) || 0,
      file_url: urlData.publicUrl,
      autore_id: userData.user.id
    })

    if (dbError) { setError('Errore nel salvataggio: ' + dbError.message) }
    else { setSuccess(true); setTimeout(() => router.push('/dashboard'), 1500) }
    setLoading(false)
  }

  const inputStyle = { width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 12, background: 'white' }

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Carica i tuoi appunti</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Condividi e guadagna con i tuoi materiali</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: 13, marginBottom: 16 }}>Appunti caricati con successo!</p>}

          <input type="text" placeholder="Titolo (es. Analisi Matematica 1 — Limiti)" value={titolo} onChange={e => setTitolo(e.target.value)} style={inputStyle} />
          <textarea placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input type="text" placeholder="Materia (es. Analisi Matematica)" value={materia} onChange={updateMateria} style={{ ...inputStyle, marginBottom: 0 }} />
            {suggerimentiMateria.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {suggerimentiMateria.map(s => (
                  <button key={s} onClick={() => { setMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input type="text" placeholder="Università" value={universitaSelezionata} onChange={updateUniversita} style={{ ...inputStyle, marginBottom: 0 }} />
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
            {file && <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>File selezionato: {file.name}</p>}
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Caricamento in corso...' : 'Pubblica appunti'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
