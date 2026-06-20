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
}

export default function Esplora() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setNotes(data)
      }
      setLoading(false)
    }
    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(note =>
    note.titolo.toLowerCase().includes(search.toLowerCase()) ||
    note.materia.toLowerCase().includes(search.toLowerCase()) ||
    note.universita.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-blue-600">
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
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-8 text-sm focus:outline-none focus:border-blue-500 max-w-xl"
        />

        {loading && <p className="text-gray-500">Caricamento...</p>}

        {!loading && filteredNotes.length === 0 && (
          <p className="text-gray-500">Nessun appunto trovato</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                  {note.materia}
                </span>
                <span className="font-bold text-gray-900">
                  {note.prezzo > 0 ? `€${note.prezzo}` : 'Gratis'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{note.titolo}</h3>
              <p className="text-sm text-gray-500 mb-3">{note.descrizione}</p>
              <p className="text-xs text-gray-400 mb-4">{note.universita}</p>
              
                href={note.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 block text-center"
              >
                Scarica PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
