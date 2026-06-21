'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
            const somma = recensioniNota.reduce(function (acc, r) {
              return acc + r.voto
            }, 0)
            votoMedio = somma / numeroRecensioni
          }
          return Object.assign({}, n, { votoMedio: votoMedio, numeroRecensioni: numeroRecensioni })
        })
        setNotes(noteConVoti)
      }
      setLoading(false)
    }
    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(function (note) {
    const s = search.toLowerCase()
    const t = note.titolo.toLowerCase().includes(s)
    const m = note.materia.toLowerCase().includes(s)
    const u = note.universita.toLowerCase().includes(s)
    return t || m || u
  })

  function goToDashboard() {
    router.push('/dashboard')
  }

  function updateSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
  }

  function vaiARecensione(noteId: string) {
    router.push('/recensione-appunto/' + noteId)
  }

  function renderStelle(voto: number) {
    const stelle = []
    for (let i = 1; i <= 5; i++) {
      stelle.push(i <= Math.round(voto) ? '★' : '☆')
    }
    return stelle.join('')
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
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={goToDashboard} className="text-sm text-gray-500 hover:text-blue-600">
          Torna alla dashboard
        </button>
      </nav>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Esplora appunti</h1>
        <p className="text-gray-500 mb-6">Trova gli appunti che ti servono</p>

        <input
          type="text"
          placeholder="Cerca per titolo, materia o universita..."
          value={search}
          onChange={updateSearch}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-8 text-sm focus:outline-none focus:border-blue-500 max-w-xl"
        />

        {loading && <p className="text-gray-500">Caricamento...</p>}
        {!loading && filteredNotes.length === 0 && <p className="text-gray-500">Nessun appunto trovato</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNotes.map(function (note) {
            const prezzoLabel = note.prezzo > 0 ? ('€ ' + note.prezzo.toFixed(2)) : 'Gratis'
            const inCorso = acquistoInCorso === note.id
            return (
              <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{note.materia}</span>
                  <span className="font-bold text-gray-900">{prezzoLabel}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{note.titolo}</h3>
                <p className="text-sm text-gray-500 mb-2">{note.descrizione}</p>
                <p className="text-xs text-gray-400 mb-2">{note.universita}</p>
                <p className="text-yellow-400 text-sm mb-4">
                  {renderStelle(note.votoMedio)} <span className="text-gray-400">({note.numeroRecensioni})</span>
                </p>
                <button
                  onClick={function () { gestisciAcquisto(note) }}
                  disabled={inCorso}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mb-2"
                >
                  {inCorso ? 'Caricamento...' : (note.prezzo > 0 ? 'Acquista e scarica' : 'Scarica gratis')}
                </button>
                <button
                  onClick={function () { vaiARecensione(note.id) }}
                  className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Lascia una recensione
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
