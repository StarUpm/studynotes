'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Note = {
  id: string
  titolo: string
  descrizione: string
  materia: string
  universita: string
  prezzo: number
  file_url: string
  downloads: number
  created_at: string
  votoMedio: number
  numeroRecensioni: number
}

export default function Esplora() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [acquistoInCorso, setAcquistoInCorso] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchNotes = async () => {
      const result = await supabase.from('notes').select('*').order('created_at', { ascending: false })
      const recensioniResult = await supabase.from('reviews').select('*')

      if (result.data) {
        const noteConVoti = result.data.map(function (n) {
          const recensioniNota = recensioniResult.data ? recensioniResult.data.filter(function (r) {
            return r.note_id === n.id
          }) : []
          const numeroRecensioni = recensioniNota.length
          let votoMedio = 0
          if (numeroRecensioni > 0) {
            const somma = recensioniNota.reduce(function (acc, r) { return acc + r.voto }, 0)
            votoMedio = somma / numeroRecensioni
          }
          return Object.assign({}, n, { votoMedio, numeroRecensioni })
        })
        setNotes(noteConVoti)
      }
      setLoading(false)
    }
    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(function (note) {
    const s = search.toLowerCase()
    return note.titolo.toLowerCase().includes(s) ||
      note.materia.toLowerCase().includes(s) ||
      note.universita.toLowerCase().includes(s)
  })

  function renderStelle(voto: number) {
    return [1,2,3,4,5].map(i => i <= Math.round(voto) ? '★' : '☆').join('')
  }

  async function gestisciAcquisto(note: Note) {
    if (note.prezzo === 0) {
      window.open(note.file_url, '_blank')
      return
    }
    setAcquistoInCorso(note.id)
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) {
      alert('Devi accedere prima di acquistare')
      setAcquistoInCorso('')
      return
    }
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: note.id,
          titolo: note.titolo,
          prezzo: note.prezzo,
          fileUrl: note.file_url,
          buyerId: userData.data.user.id
        })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Errore nella creazione del pagamento')
        setAcquistoInCorso('')
      }
    } catch (e) {
      alert('Errore di connessione')
      setAcquistoInCorso('')
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Esplora appunti</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Trova gli appunti che ti servono</p>

        <input
          type="text"
          placeholder="Cerca per titolo, materia o università..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 480, border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 32, background: 'white' }}
        />

        {loading && <p style={{ color: '#9CA3AF' }}>Caricamento...</p>}
        {!loading && filteredNotes.length === 0 && <p style={{ color: '#9CA3AF' }}>Nessun appunto trovato</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filteredNotes.map(function (note) {
            const inCorso = acquistoInCorso === note.id
            return (
              <div key={note.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, background: '#EFF6FF', color: '#185FA5', padding: '2px 10px', borderRadius: 20 }}>{note.materia}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{note.prezzo > 0 ? `€ ${note.prezzo.toFixed(2)}` : 'Gratis'}</span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{note.titolo}</h3>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, lineHeight: 1.5 }}>{note.descrizione}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{note.universita}</p>
                <div style={{ fontSize: 12, color: '#B45309', marginBottom: 14 }}>
                  {renderStelle(note.votoMedio)} <span style={{ color: '#9CA3AF' }}>({note.numeroRecensioni})</span>
                </div>
                <button
                  onClick={() => gestisciAcquisto(note)}
                  disabled={inCorso}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 8, opacity: inCorso ? 0.6 : 1 }}
                >
                  {inCorso ? 'Caricamento...' : (note.prezzo > 0 ? 'Acquista e scarica' : 'Scarica gratis')}
                </button>
                <button
                  onClick={() => router.push('/recensione-appunto/' + note.id)}
                  style={{ width: '100%', background: 'white', color: '#6B7280', border: '0.5px solid #e5e7eb', padding: '8px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                >
                  Lascia una recensione
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
