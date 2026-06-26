'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function RecensioneAppunto() {
  const [voto, setVoto] = useState(5)
  const [commento, setCommento] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const noteId = params.noteId as string

  async function inviaRecensione() {
    setLoading(true)
    setError('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { setError('Devi accedere prima'); setLoading(false); return }
    const result = await supabase.from('reviews').insert({
      note_id: noteId,
      studente_id: userData.data.user.id,
      voto, commento
    })
    if (result.error) { setError('Errore: ' + result.error.message) }
    else { setSuccess(true); setTimeout(() => router.push('/esplora'), 1500) }
    setLoading(false)
  }

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/esplora')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna agli appunti</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>⭐ Lascia una recensione</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Aiuta altri studenti a scegliere i migliori appunti</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: 13, marginBottom: 16, background: '#ECFDF5', padding: '10px 14px', borderRadius: 8 }}>✓ Recensione inviata, grazie!</p>}

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Voto</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[1,2,3,4,5].map(function(v) {
              return (
                <button key={v} onClick={() => setVoto(v)} style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', color: v <= voto ? '#B45309' : '#e5e7eb' }}>★</button>
              )
            })}
          </div>

          <textarea
            placeholder="Scrivi un commento (opzionale)"
            value={commento}
            onChange={e => setCommento(e.target.value)}
            rows={5}
            style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 20 }}
          />

          <button onClick={inviaRecensione} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Invio in corso...' : 'Invia recensione'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
