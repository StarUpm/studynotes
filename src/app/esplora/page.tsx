'use client'

import { useState, useEffect, useRef } from 'react'
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
  autore_id: string
  downloads: number
  created_at: string
  profiles: { nome: string; cognome: string }
}

export default function Esplora() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroMateria, setFiltroMateria] = useState('')
  const [filtroUniversita, setFiltroUniversita] = useState('')
  const [filtroPrezzo, setFiltroPrezzo] = useState('tutti')
  const [anteprimaNote, setAnteprimaNote] = useState<Note | null>(null)
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const [suggerimentiUniversita, setSuggerimentiUniversita] = useState<string[]>([])
  const timerM = useRef<any>(null)
  const timerU = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    caricaNotes()
  }, [])

  async function caricaNotes() {
    const result = await supabase
      .from('notes')
      .select('*, profiles(nome, cognome)')
      .order('created_at', { ascending: false })
    if (result.data) setNotes(result.data as any)
    setLoading(false)
  }

  async function cercaMateria(v: string) {
    setFiltroMateria(v)
    if (v.length < 2) { setSuggerimentiMateria([]); return }
    if (timerM.current) clearTimeout(timerM.current)
    timerM.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'materia' }) })
      const data = await res.json()
      setSuggerimentiMateria(data.risultati || [])
    }, 400)
  }

  async function cercaUniversita(v: string) {
    setFiltroUniversita(v)
    if (v.length < 2) { setSuggerimentiUniversita([]); return }
    if (timerU.current) clearTimeout(timerU.current)
    timerU.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'universita' }) })
      const data = await res.json()
      setSuggerimentiUniversita(data.risultati || [])
    }, 400)
  }

  async function acquista(note: Note) {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { router.push('/login'); return }
    if (note.prezzo === 0) {
      window.open(note.file_url, '_blank')
      return
    }
    router.push('/esplora/' + note.id)
  }

  const notesFiltrate = notes.filter(function(n) {
    const s = search.toLowerCase()
    const matchSearch = !s || n.titolo.toLowerCase().includes(s) || n.materia?.toLowerCase().includes(s) || n.universita?.toLowerCase().includes(s)
    const matchMateria = !filtroMateria || n.materia?.toLowerCase().includes(filtroMateria.toLowerCase())
    const matchUniversita = !filtroUniversita || n.universita?.toLowerCase().includes(filtroUniversita.toLowerCase())
    const matchPrezzo = filtroPrezzo === 'tutti' || (filtroPrezzo === 'gratis' && n.prezzo === 0) || (filtroPrezzo === 'pagamento' && n.prezzo > 0)
    return matchSearch && matchMateria && matchUniversita && matchPrezzo
  })

  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Esplora appunti</h1>
          <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Trova materiale di altri studenti</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 10, marginBottom: 24, alignItems: 'start' }}>
          <input
            type="text"
            placeholder="Cerca per titolo, materia o università..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />

          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Materia" value={filtroMateria} onChange={e => cercaMateria(e.target.value)} style={{ ...inputStyle, width: 160 }} />
            {suggerimentiMateria.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                {suggerimentiMateria.map(s => (
                  <button key={s} onClick={() => { setFiltroMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', borderBottom: '0.5px solid #F4F4F5' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Università" value={filtroUniversita} onChange={e => cercaUniversita(e.target.value)} style={{ ...inputStyle, width: 180 }} />
            {suggerimentiUniversita.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                {suggerimentiUniversita.map(s => (
                  <button key={s} onClick={() => { setFiltroUniversita(s); setSuggerimentiUniversita([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', borderBottom: '0.5px solid #F4F4F5' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <select value={filtroPrezzo} onChange={e => setFiltroPrezzo(e.target.value)} style={{ ...inputStyle, width: 120 }}>
            <option value="tutti">Tutti</option>
            <option value="gratis">Gratis</option>
            <option value="pagamento">A pagamento</option>
          </select>
        </div>

        {loading && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Caricamento...</p>}

        {!loading && notesFiltrate.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="ti ti-folder-off" style={{ fontSize: 36, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 4px' }}>Nessun appunto trovato</p>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Prova a modificare i filtri di ricerca</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: anteprimaNote ? '1fr 360px' : '1fr', gap: 20 }}>
          <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
            {notesFiltrate.map(function(note) {
              const attiva = anteprimaNote?.id === note.id
              return (
                <div
                  key={note.id}
                  onClick={() => setAnteprimaNote(attiva ? null : note)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '0.5px solid #F4F4F5', cursor: 'pointer', background: attiva ? '#FFF8F6' : 'white' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="ti ti-file-text" style={{ fontSize: 18, color: '#A1A1AA' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.titolo}</p>
                      <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{note.materia}{note.universita ? ' · ' + note.universita : ''}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: note.prezzo === 0 ? '#15803D' : '#18181B', fontWeight: 500 }}>
                      {note.prezzo === 0 ? 'Gratis' : '€ ' + note.prezzo.toFixed(2)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); acquista(note) }}
                      style={{ fontSize: 12, background: '#18181B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
                    >
                      {note.prezzo === 0 ? 'Scarica' : 'Acquista'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {anteprimaNote && (
            <div style={{ position: 'sticky', top: 72, background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 20, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 4px' }}>{anteprimaNote.titolo}</p>
                  {anteprimaNote.materia && <span style={{ fontSize: 11, background: '#FFF8F6', color: '#D85A30', padding: '2px 8px', borderRadius: 20, border: '0.5px solid #FECACA' }}>{anteprimaNote.materia}</span>}
                </div>
                <button onClick={() => setAnteprimaNote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <i className="ti ti-x" style={{ fontSize: 16, color: '#A1A1AA' }} />
                </button>
              </div>
              {anteprimaNote.descrizione && (
                <p style={{ fontSize: 12, color: '#71717A', lineHeight: 1.6, marginBottom: 14 }}>{anteprimaNote.descrizione}</p>
              )}
              <div style={{ background: '#F4F4F5', borderRadius: 10, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <iframe src={anteprimaNote.file_url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 10 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: anteprimaNote.prezzo === 0 ? '#15803D' : '#18181B' }}>
                  {anteprimaNote.prezzo === 0 ? 'Gratis' : '€ ' + anteprimaNote.prezzo.toFixed(2)}
                </span>
                <button
                  onClick={() => acquista(anteprimaNote)}
                  style={{ fontSize: 13, background: '#18181B', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                >
                  {anteprimaNote.prezzo === 0 ? 'Scarica gratis' : 'Acquista'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
