'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Prenota() {
  const [tutor, setTutor] = useState<{ email: string; tariffa_oraria: number } | null>(null)
  const [data, setData] = useState('')
  const [ora, setOra] = useState('')
  const [materia, setMateria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const tutorId = params.tutorId as string

  useEffect(() => {
    async function caricaTutor() {
      const result = await supabase.from('profiles').select('email, tariffa_oraria').eq('id', tutorId).single()
      if (result.data) {
        setTutor(result.data)
      }
    }
    caricaTutor()
  }, [tutorId])

  async function confermaPrenotazione() {
    if (!data || !ora || !materia) {
      setError('Compila tutti i campi')
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

    const dataOraCompleta = data + 'T' + ora + ':00'

    const result = await supabase.from('tutoring_sessions').insert({
      tutor_id: tutorId,
      studente_id: userData.data.user.id,
      materia: materia,
      data_ora: dataOraCompleta,
      durata_minuti: 60,
      prezzo: tutor ? tutor.tariffa_oraria : 0,
      stato: 'pending'
    })

    if (result.error) {
      setError('Errore nella prenotazione: ' + result.error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prenota ripetizione</h1>
          {tutor && <p className="text-gray-500 mb-6">Con {tutor.email} - € {tutor.tariffa_oraria.toFixed(2)}/ora</p>}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">Prenotazione inviata! Aspetta la conferma del tutor.</p>}

          <input
            type="text"
            placeholder="Materia da studiare"
            value={materia}
            onChange={function (e) { setMateria(e.target.value) }}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={data}
            onChange={function (e) { setData(e.target.value) }}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="time"
            value={ora}
            onChange={function (e) { setOra(e.target.value) }}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={confermaPrenotazione}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Prenotazione in corso...' : 'Prenota sessione'}
          </button>
        </div>
      </div>
    </main>
  )
}
