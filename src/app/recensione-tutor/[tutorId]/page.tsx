'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function RecensioneTutor() {
  const [voto, setVoto] = useState(5)
  const [commento, setCommento] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const tutorId = params.tutorId as string

  function selezionaVoto(v: number) {
    setVoto(v)
  }

  function updateCommento(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCommento(e.target.value)
  }

  async function inviaRecensione() {
    setLoading(true)
    setError('')

    const userData = await supabase.auth.getUser()
    if (!userData.data.user) {
      setError('Devi accedere prima')
      setLoading(false)
      return
    }

    const result = await supabase.from('reviews').insert({
      destinatario_id: tutorId,
      studente_id: userData.data.user.id,
      voto: voto,
      commento: commento
    })

    if (result.error) {
      setError('Errore: ' + result.error.message)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Lascia una recensione</h1>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">Recensione inviata, grazie!</p>}

          <p className="text-sm font-medium text-gray-700 mb-2">Voto</p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(function (v) {
              const attivo = v <= voto
              return (
                <button
                  key={v}
                  onClick={function () { selezionaVoto(v) }}
                  className={attivo ? 'text-3xl text-yellow-400' : 'text-3xl text-gray-300'}
                >
                  ★
                </button>
              )
            })}
          </div>

          <textarea
            placeholder="Scrivi un commento (opzionale)"
            value={commento}
            onChange={updateCommento}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={inviaRecensione}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Invio in corso...' : 'Invia recensione'}
          </button>
        </div>
      </div>
    </main>
  )
}
