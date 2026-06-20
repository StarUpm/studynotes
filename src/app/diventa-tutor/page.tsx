'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DiventaTutor() {
  const [materieInsegnate, setMaterieInsegnate] = useState('')
  const [tariffa, setTariffa] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function caricaProfilo() {
      const userData = await supabase.auth.getUser()
      if (userData.data.user) {
        const result = await supabase.from('profiles').select('*').eq('id', userData.data.user.id).single()
        if (result.data) {
          setMaterieInsegnate(result.data.materie_insegnate || '')
          setTariffa(result.data.tariffa_oraria ? result.data.tariffa_oraria.toString() : '')
        }
      }
    }
    caricaProfilo()
  }, [])

  async function salvaProfiloTutor() {
    setLoading(true)
    setError('')

    const userData = await supabase.auth.getUser()
    if (!userData.data.user) {
      setError('Devi accedere prima')
      setLoading(false)
      return
    }

    const result = await supabase.from('profiles').update({
      is_tutor: true,
      materie_insegnate: materieInsegnate,
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

  function updateMaterie(e: React.ChangeEvent<HTMLInputElement>) {
    setMaterieInsegnate(e.target.value)
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
            placeholder="Materia"
            value={materieInsegnate}
            onChange={updateMaterie}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Tariffa oraria"
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
