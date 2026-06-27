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
  const [filtroMateria, setFiltroMateria] = useState('')
  const [filtroUniversita, setFiltroUniversita] = useState('')
  const [filtroPrezzo, setFiltroPrezzo] = useState('tutti')
  const [filtroVoto, setFiltroVoto] = useState('tutti')
  const [ordinamento, setOrdinamento] = useState('recenti')
  const [filtriAperti, setFiltriAperti] = useState(false)
  const [acquistoInCorso, setAcquistoInCorso] = useState('')
  const [anteprimaNote, setAnteprimaNote] = useState<Note | null>(null)
  const [paginaAnteprima, setPaginaAnteprima] = useState(1)
  const [totalePageAnteprima] = useState(3)
  const router = useRouter()

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const result = await supabase.from('notes').select('*').order('created_at', { ascending: false })
    const recensioniResult = await supabase.from('reviews').select('*')
    if (result.data) {
      const noteConVoti = result.data.map(function(n) {
        const recensioniNota = recensioniResult.data ? recensioniResult.data.filter(function(r) { return r.note_id === n.id }) : []
        const numeroRecensioni = recensioniNota.length
        const votoMedio = numeroRecensioni > 0 ? recensioniNota.reduce(function(acc, r) { return acc + r.voto }, 0) / numeroRecensioni : 0
        return { ...n, votoMedio, numeroRecensioni }
      })
      setNotes(noteConVoti)
    }
    setLoading(false)
  }

  const materieUniche = Array.from(new Set(notes.map(n => n.materia).filter(Boolean))).sort()
  const universitaUniche = Array.from(new Set(notes.map(n => n.universita).filter(Boolean))).sort()

  const filteredNotes = notes
    .filter(function(note) {
      const s = search.toLowerCase()
      const matchSearch = !s || note.titolo.toLowerCase().includes(s) || note.materia.toLowerCase().includes(s) || note.universita.toLowerCase().includes(s)
      const matchMateria = !filtroMateria || note.materia === filtroMateria
      const matchUniversita = !filtroUniversita || note.universita === filtroUniversita
      const matchPrezzo = filtroPrezzo === 'tutti' ||
        (filtroPrezzo === 'gratis' && note.prezzo === 0) ||
        (filtroPrezzo === 'sotto5' && note.prezzo > 0 && note.prezzo <= 5) ||
        (filtroPrezzo === 'sopra5' && note.prezzo > 5)
      const matchVoto = filtroVoto === 'tutti' ||
        (filtroVoto === '4' && note.votoMedio >= 4) ||
        (filtroVoto === '3' && note.votoMedio >= 3)
      return matchSearch && matchMateria && matchUniversita && matchPrezzo && matchVoto
    })
    .sort(function(a, b) {
      if (ordinamento === 'recenti') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (ordinamento === 'voto') return b.votoMedio - a.votoMedio
      if (ordinamento === 'prezzo_asc') return a.prezzo - b.prezzo
      if (ordinamento === 'prezzo_desc') return b.prezzo - a.prezzo
      return 0
    })

  function resetFiltri() {
    setFiltroMateria('')
    setFiltroUniversita('')
    setFiltroPrezzo('tutti')
    setFiltroVoto('tutti')
    setOrdinamento('recenti')
    setSearch('')
  }

  const filtriAttivi = filtroMateria || filtroUniversita || filtroPrezzo !== 'tutti' || filtroVoto !== 'tutti' || ordinamento !== 'recenti'

  function renderStelle(voto: number) {
    return [1,2,3,4,5].map(i => i <= Math.round(voto) ? '★' : '☆').join('')
  }

  async function gestisciAcquisto(note: Note) {
    if (note.prezzo === 0) { window.open(note.file_url, '_blank'); return }
    setAcquistoInCorso(note.id)
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { alert('Devi accedere prima di acquistare'); setAcquistoInCorso(''); return }
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, titolo: note.titolo, prezzo: note.prezzo, fileUrl: note.file_url, buyerId: userData.data.user.id })
      })
      const data = await response.json()
      if (data.url) { window.location.href = data.url }
      else { alert('Errore nella creazione del pagamento'); setAcquistoInCorso('') }
    } catch (e) { alert('Errore di connessione'); setAcquistoInCorso('') }
  }

  function apriAnteprima(note: Note) { setAnteprimaNote(note); setPaginaAnteprima(1) }
  function chiudiAnteprima() { setAnteprimaNote(null); setPaginaAnteprima(1) }

  const selectStyle = { border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: 'white', color: '#374151', cursor: 'pointer' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Esplora appunti</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Trova gli appunti che ti servono</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cerca per titolo, materia o università..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', fontSize: 14, outline: 'none', background: 'white' }}
          />
          <button
            onClick={() => setFiltriAperti(!filtriAperti)}
            style={{ background: filtriAttivi ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: filtriAttivi ? 'white' : '#374151', border: '0.5px solid #e5e7eb', padding: '10px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🔧 Filtri {filtriAttivi && '●'}
          </button>
          {filtriAttivi && (
            <button onClick={resetFiltri} style={{ background: '#FEF2F2', color: '#DC2626', border: '0.5px solid #FECACA', padding: '10px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
              ✕ Reset
            </button>
          )}
        </div>

        {filtriAperti && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Materia</p>
              <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value="">Tutte le materie</option>
                {materieUniche.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Università</p>
              <select value={filtroUniversita} onChange={e => setFiltroUniversita(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value="">Tutte le università</option>
                {universitaUniche.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Prezzo</p>
              <select value={filtroPrezzo} onChange={e => setFiltroPrezzo(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value="tutti">Tutti i prezzi</option>
                <option value="gratis">Solo gratis</option>
                <option value="sotto5">Sotto € 5</option>
                <option value="sopra5">Sopra € 5</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Voto minimo</p>
              <select value={filtroVoto} onChange={e => setFiltroVoto(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value="tutti">Tutti i voti</option>
                <option value="3">Almeno 3 stelle</option>
                <option value="4">Almeno 4 stelle</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Ordina per</p>
              <select value={ordinamento} onChange={e => setOrdinamento(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value="recenti">Più recenti</option>
                <option value="voto">Voto più alto</option>
                <option value="prezzo_asc">Prezzo crescente</option>
                <option value="prezzo_desc">Prezzo decrescente</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>
            {filteredNotes.length} appunt{filteredNotes.length === 1 ? 'o' : 'i'} trovat{filteredNotes.length === 1 ? 'o' : 'i'}
            {filtriAttivi && ' (filtri attivi)'}
          </p>
        </div>

        {loading && <p style={{ color: '#9CA3AF' }}>Caricamento...</p>}
        {!loading && filteredNotes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 12 }}>Nessun appunto trovato</p>
            {filtriAttivi && <button onClick={resetFiltri} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Rimuovi filtri</button>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filteredNotes.map(function(note) {
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => gestisciAcquisto(note)} disabled={inCorso} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: inCorso ? 0.6 : 1 }}>
                    {inCorso ? 'Caricamento...' : (note.prezzo > 0 ? 'Acquista e scarica' : 'Scarica gratis')}
                  </button>
                  <button onClick={() => apriAnteprima(note)} style={{ width: '100%', background: 'white', color: '#185FA5', border: '0.5px solid #185FA5', padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    👁 Anteprima gratuita
                  </button>
                  <button onClick={() => router.push('/recensione-appunto/' + note.id)} style={{ width: '100%', background: 'white', color: '#6B7280', border: '0.5px solid #e5e7eb', padding: '8px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                    Lascia una recensione
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {anteprimaNote && (
        <div onClick={chiudiAnteprima} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 600, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{anteprimaNote.titolo}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>Anteprima gratuita — pagina {paginaAnteprima} di {totalePageAnteprima}</p>
              </div>
              <button onClick={chiudiAnteprima} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#f9fafb' }}>
              <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                <iframe
                  src={anteprimaNote.file_url + '#page=' + paginaAnteprima + '&toolbar=0&navpanes=0&scrollbar=0&view=FitH'}
                  style={{ width: '100%', height: 400, border: 'none', display: 'block' }}
                  title="Anteprima PDF"
                />
              </div>
              <div style={{ background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#B45309', marginBottom: 6, fontWeight: 500 }}>Stai vedendo la pagina {paginaAnteprima} di {totalePageAnteprima} in anteprima gratuita</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Acquista per accedere a tutte le pagine complete</p>
                <button onClick={() => { chiudiAnteprima(); gestisciAcquisto(anteprimaNote) }} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {anteprimaNote.prezzo > 0 ? `Acquista per € ${anteprimaNote.prezzo.toFixed(2)}` : 'Scarica gratis'}
                </button>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setPaginaAnteprima(Math.max(1, paginaAnteprima - 1))} disabled={paginaAnteprima === 1} style={{ background: 'white', border: '0.5px solid #e5e7eb', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: paginaAnteprima === 1 ? 'default' : 'pointer', opacity: paginaAnteprima === 1 ? 0.4 : 1 }}>← Precedente</button>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Pagina {paginaAnteprima} / {totalePageAnteprima}</span>
              <button onClick={() => setPaginaAnteprima(Math.min(totalePageAnteprima, paginaAnteprima + 1))} disabled={paginaAnteprima === totalePageAnteprima} style={{ background: 'white', border: '0.5px solid #e5e7eb', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: paginaAnteprima === totalePageAnteprima ? 'default' : 'pointer', opacity: paginaAnteprima === totalePageAnteprima ? 0.4 : 1 }}>Prossima →</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
