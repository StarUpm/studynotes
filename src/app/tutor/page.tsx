'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { materie } from '@/lib/dati-universita'

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
  const [suggerimenti, setSuggerimenti] = useState<string[]>([])
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
    if (search.length === 0) return true
    const s = search.toLowerCase()
    const m = t.materie_insegnate ? t.materie_insegnate.toLowerCase() : ''
    return m.includes(s)
  })

  const sortedTutors = filteredTutors.sort(function (a, b) {
    return a.tariffa_oraria - b.tariffa_oraria
  })

  function updateSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const valore = e.target.value
    setSearch(valore)
    if (valore.length > 0) {
      const filtrati = materie.filter(function (m) {
        return m.toLowerCase().includes(valore.toLowerCase())
      })
      setSuggerimenti(filtrati.slice(0, 6))
    } else {
      setSuggerimenti([])
    }
  }

  function selezionaSuggerimento(valore: string) {
    setSearch(valore)
    setSuggerimenti([])
  }

  function goToDashboard() {
    router.push('/dashboard')
  }

  function prenota(tutorId: string) {
    router.push('/prenota/' + tutorId)
  }

  function nomeVisibile(t: Tutor) {
    return t.nome ? t.nome : t.email
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

        <div className="relative mb-8 max-w-xl">
          <input
            type="text"
            placeholder="Scrivi la materia per cui cerchi un tutor..."
            value={search}
            onChange={updateSearch}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          {suggerimenti.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
              {suggerimenti.map(function (s, i) {
                return (
                  <button
                    key={i}
                    onClick={function () { selezionaSuggerimento(s) }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 block"
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {loading && <p className="text-gray-500">Caricamento...</p>}
        {!loading && sortedTutors.length === 0 && <p className="text-gray-500">Nessun tutor trovato per questa materia</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedTutors.map(function (t) {
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{nomeVisibile(t)}</h3>
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
