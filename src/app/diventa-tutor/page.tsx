'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { materie } from '@/lib/dati-universita'

export default function DiventaTutor() {
  const [nome, setNome] = useState('')
  const [materiaInput, setMateriaInput] = useState('')
  const [tariffa, setTariffa] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [suggerimenti, setSuggerimenti] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    async function caricaProfilo() {
      const userData = await supabase.auth.getUser()
      if (userData.data.user) {
        const result = await supabase.from('profiles').select('*').eq('id', userData.data.user.id).single()
        if (result.data) {
          setNome(result.data.nome || '')
          setMateriaInput(result.data.materie_insegnate || '')
          setTariffa(result.data.tariffa_oraria ? result.data.tariffa_oraria.toString() : '')
        }
      }
    }
    caricaProfilo()
  }, [])

  function updateMateria(e: React.ChangeEvent<HTMLInputElement>) {
    const valore = e.target.value
    setMateriaInput(valore)
    if (valore.length > 0) {
      const filtrati = materie.filter(function (m) {
        return m.toLowerCase().includes(valore.toLowerCase())
      })
      setSuggerimenti(filtrati.slice(0, 6))
    } else {
      setSuggerimenti([])
    }
  }

  function selezionaMateria(valore: string) {
    setMateriaInput(valore)
    setSuggerimenti([])
  }

  async function salvaProfiloTutor() {
    if (!nome) {
      setError('Inserisci il tuo nome')
      return
    }
    setLoading(true)
    setError('')

    const userData = await supabase.auth.getUser()
    if (!userData.data.user) {
      setError('Devi accedere prima')
      setLoading(false)
      return
    }

    const result = await supabase.from('profiles').update({
      nome: nome,
      is_tutor: true,
      materie_insegnate: materiaInput,
      tariffa_oraria: parseFloat(tariffa) || 0
    }).eq('id', userData.data.user.id)

    if (result.error) {
      setError('Errore nel salvataggio: ' + result.error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setLoading(false)
  }

  function updateNome(e: React.ChangeEvent<HTMLInputElement>) {
    setNome(e.target.value)
  }

  function updateTariffa(e: React.ChangeEvent<HTMLInputElement>) {
    setTariffa(e.target.value)
  }

  function goToDashboard() {
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={goToDashboard} className="text-sm text-gray-500 hover:text-blue-600">
          Torna alla dashboard
        </button>
      </nav>
      <div className="max-w-xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Diventa tutor</h1>
          <p className="text-gray-500 mb-6">Offri ripetizioni online e guadagna</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">Profilo tutor attivato!</p>}

          <input
            type="text"
            placeholder="Il tuo nome utente"
            value={nome}
            onChange={updateNome}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Materia che insegni (es. Matematica)"
              value={materiaInput}
              onChange={updateMateria}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            {suggerimenti.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                {suggerimenti.map(function (s, i) {
                  return (
                    <button
                      key={i}
                      onClick={function () { selezionaMateria(s) }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 block"
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Tariffa oraria in euro (es. 15.50)"
            value={tariffa}
            onChange={updateTariffa}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={salvaProfiloTutor}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Attiva profilo tutor'}
          </button>
        </div>
      </div>
    </main>
  )
}
