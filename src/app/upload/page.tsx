'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { universita, materie } from '@/lib/dati-universita'

export default function Upload() {
  const [titolo, setTitolo] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [materia, setMateria] = useState('')
  const [universitaSelezionata, setUniversitaSelezionata] = useState('')
  const [prezzo, setPrezzo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const [suggerimentiUniversita, setSuggerimentiUniversita] = useState<string[]>([])
  const router = useRouter()

  function updateMateria(e: React.ChangeEvent<HTMLInputElement>) {
    const valore = e.target.value
    setMateria(valore)
    if (valore.length > 0) {
      const filtrati = materie.filter(function (m) {
        return m.toLowerCase().includes(valore.toLowerCase())
      })
      setSuggerimentiMateria(filtrati.slice(0, 6))
    } else {
      setSuggerimentiMateria([])
    }
  }

  function selezionaMateria(valore: string) {
    setMateria(valore)
    setSuggerimentiMateria([])
  }

  function updateUniversita(e: React.ChangeEvent<HTMLInputElement>) {
    const valore = e.target.value
    setUniversitaSelezionata(valore)
    if (valore.length > 0) {
      const filtrati = universita.filter(function (u) {
        return u.toLowerCase().includes(valore.toLowerCase())
      })
      setSuggerimentiUniversita(filtrati.slice(0, 6))
    } else {
      setSuggerimentiUniversita([])
    }
  }

  function selezionaUniversita(valore: string) {
    setUniversitaSelezionata(valore)
    setSuggerimentiUniversita([])
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Seleziona un file PDF')
      return
    }
    setLoading(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setError('Devi accedere prima di caricare appunti')
      setLoading(false)
      return
    }

    const fileName = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('appunti')
      .upload(fileName, file)

    if (uploadError) {
      setError('Errore nel caricamento del file: ' + uploadError.message)
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('appunti')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabase.from('notes').insert({
      titolo,
      descrizione,
      materia,
      universita: universitaSelezionata,
      prezzo: parseFloat(prezzo) || 0,
      file_url: urlData.publicUrl,
      autore_id: userData.user.id
    })

    if (dbError) {
      setError('Errore nel salvataggio: ' + dbError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-blue-600">
          Torna alla dashboard
        </button>
      </nav>
      <div className="max-w-xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Carica i tuoi appunti</h1>
          <p className="text-gray-500 mb-6">Condividi e guadagna con i tuoi appunti</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">Appunti caricati con successo!</p>}

          <input
            type="text"
            placeholder="Titolo (es. Analisi Matematica 1 - Limiti)"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="Descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
            rows={3}
          />

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Materia (es. Analisi Matematica 1)"
              value={materia}
              onChange={updateMateria}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            {suggerimentiMateria.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                {suggerimentiMateria.map(function (s, i) {
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

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Universita"
              value={universitaSelezionata}
              onChange={updateUniversita}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
            {suggerimentiUniversita.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                {suggerimentiUniversita.map(function (s, i) {
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
            type="number"
            step="0.01"
            placeholder="Prezzo in euro (es. 9.75, 0 per gratis)"
            value={prezzo}
            onChange={(e) => setPrezzo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Caricamento in corso...' : 'Pubblica appunti'}
          </button>
        </div>
      </div>
    </main>
  )
}
