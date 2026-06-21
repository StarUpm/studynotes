'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { universita } from '@/lib/dati-universita'

export default function ModificaProfilo() {
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [universitaInput, setUniversitaInput] = useState('')
  const [tipoIstituto, setTipoIstituto] = useState('universita')
  const [annoStudio, setAnnoStudio] = useState('')
  const [curriculum, setCurriculum] = useState('')
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
          setCognome(result.data.cognome || '')
          setUniversitaInput(result.data.universita || '')
          setTipoIstituto(result.data.tipo_istituto || 'universita')
          setAnnoStudio(result.data.anno_studio || '')
          setCurriculum(result.data.curriculum || '')
        }
      }
    }
    caricaProfilo()
  }, [])

  function updateUniversita(e: React.ChangeEvent<HTMLInputElement>) {
    const valore = e.target.value
    setUniversitaInput(valore)
    if (valore.length > 0) {
      const filtrati = universita.filter(function (u) {
        return u.toLowerCase().includes(valore.toLowerCase())
      })
      setSuggerimenti(filtrati.slice(0, 6))
    } else {
      setSuggerimenti([])
    }
  }

  function selezionaUniversita(valore: string) {
    setUniversitaInput(valore)
    setSuggerimenti([])
  }

  async function salvaProfilo() {
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
      cognome: cognome,
      universita: universitaInput,
      tipo_istituto: tipoIstituto,
      anno_studio: annoStudio,
      curriculum: curriculum
    }).eq('id', userData.data.user.id)

    if (result.error) {
      setError('Errore nel salvataggio: ' + result.error.message)
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Il tuo profilo</h1>
          <p className="text-gray-500 mb-6">Completa il tuo profilo per farti conoscere meglio</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">Profilo salvato!</p>}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={function (e) { setNome(e.target.value) }}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Cognome"
              value={cognome}
              onChange={function (e) { setCognome(e.target.value) }}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={tipoIstituto === 'universita'}
                onChange={function () { setTipoIstituto('universita') }}
              />
              Universita
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={tipoIstituto === 'liceo'}
                onChange={function () { setTipoIstituto('liceo') }}
              />
              Scuola superiore
            </label>
          </div>

          <div className="relative mb-3">
            <input
              type="text"
              placeholder={tipoIstituto === 'universita' ? 'Universita che frequenti' : 'Nome della scuola'}
              value={universitaInput}
              onChange={updateUniversita}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            {suggerimenti.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                {suggerimenti.map(function (s, i) {
                  return (
                    <button
                      key={i}
                      onClick={function () { selezionaUniversita(s) }}
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
            type="text"
            placeholder={tipoIstituto === 'universita' ? 'Anno di corso (es. 2 anno - Triennale)' : 'Anno (es. 4 anno)'}
            value={annoStudio}
            onChange={function (e) { setAnnoStudio(e.target.value) }}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Breve curriculum: i tuoi studi, esperienze, competenze..."
            value={curriculum}
            onChange={function (e) { setCurriculum(e.target.value) }}
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={salvaProfilo}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Salva profilo'}
          </button>
        </div>
      </div>
    </main>
  )
}
