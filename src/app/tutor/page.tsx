'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Tutor = {
  id: string
  nome: string
  email: string
  materie_insegnate: string
  tariffa_oraria: number
}

export default function Tutor() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchTutors() {
      const result = await supabase.from('profiles').select('*').eq('is_tutor', true)
      if (result.data) {
        setTutors(result.data)
      }
      setLoading(false)
    }
    fetchTutors()
  }, [])

  const filteredTutors = tutors.filter(function (t) {
    const s = search.toLowerCase()
    const materie = t.materie_insegnate ? t.materie_insegnate.toLowerCase() : ''
    return materie.includes(s)
  })

  function updateSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
  }

  function goToDashboard() {
    router.push('/dashboard')
  }

  function prenota(tutorId: string) {
    router.push('/prenota/' + tutorId)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trova un tutor</h1>
        <p className="text-gray-500 mb-6">Prenota ripetizioni online con altri studenti</p>

        <input
          type="text"
          placeholder="Cerca per materia..."
          value={search}
          onChange={updateSearch}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-8 text-sm focus:outline-none focus:border-blue-500 max-w-xl"
        />

        {loading && <p className="text-gray-500">Caricamento...</p>}
        {!loading && filteredTutors.length === 0 && <p className="text-gray-500">Nessun tutor trovato</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTutors.map(function (t) {
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t.email}</h3>
                <p className="text-sm text-gray-500 mb-3">{t.materie_insegnate}</p>
                <p className="font-bold text-gray-900 mb-4">€ {t.tariffa_oraria.toFixed(2)} / ora</p>
                <button
                  onClick={function () { prenota(t.id) }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Prenota
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
