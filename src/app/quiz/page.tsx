'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Domanda = {
  domanda: string
  opzioni: string[]
  risposta_corretta: number
  spiegazione: string
}

export default function Quiz() {
  const [file, setFile] = useState<File | null>(null)
  const [testoManuale, setTestoManuale] = useState('')
  const [quiz, setQuiz] = useState<Domanda[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rispostePresenti, setRispostePresenti] = useState<number[]>([])
  const router = useRouter()

  function goToDashboard() {
    router.push('/dashboard')
  }

  function updateTesto(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTestoManuale(e.target.value)
  }

  function updateFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files ? e.target.files[0] : null)
  }

  async function generaQuiz() {
    if (!file && testoManuale.length < 50) {
      setError('Carica un PDF oppure inserisci almeno 50 caratteri di testo')
      return
    }
    setLoading(true)
    setError('')
    setQuiz([])
    setRispostePresenti([])

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      } else {
        formData.append('testo', testoManuale)
      }

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.quiz) {
        setQuiz(data.quiz)
        setRispostePresenti(new Array(data.quiz.length).fill(-1))
      } else {
        setError(data.error || 'Errore nella generazione del quiz')
      }
    } catch (e) {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  function selezionaRisposta(indiceDomanda: number, indiceRisposta: number) {
    const nuove = [...rispostePresenti]
    nuove[indiceDomanda] = indiceRisposta
    setRispostePresenti(nuove)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={goToDashboard} className="text-sm text-gray-500 hover:text-blue-600">
          Torna alla dashboard
        </button>
      </nav>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Genera quiz con AI</h1>
        <p className="text-gray-500 mb-6">Carica un PDF oppure incolla il testo per generare un quiz</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Opzione 1: Carica un PDF</p>
          <input
            type="file"
            accept=".pdf"
            onChange={updateFile}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Opzione 2: Incolla il testo</p>
          <textarea
            placeholder="Incolla qui il testo dei tuoi appunti..."
            value={testoManuale}
            onChange={updateTesto}
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={generaQuiz}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mb-8"
        >
          {loading ? 'Generazione in corso...' : 'Genera quiz'}
        </button>

        {quiz.map(function (domanda, indiceDomanda) {
          return (
            <div key={indiceDomanda} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <p className="font-semibold text-gray-900 mb-4">{indiceDomanda + 1}. {domanda.domanda}</p>
              {domanda.opzioni.map(function (opzione, indiceOpzione) {
                const selezionata = rispostePresenti[indiceDomanda] === indiceOpzione
                const corretta = domanda.risposta_corretta === indiceOpzione
                const haRisposto = rispostePresenti[indiceDomanda] !== -1

                let stile = 'w-full text-left border rounded-lg px-4 py-3 mb-2 text-sm '
                if (haRisposto && corretta) {
                  stile += 'border-green-500 bg-green-50 text-green-700'
                } else if (haRisposto && selezionata && !corretta) {
                  stile += 'border-red-500 bg-red-50 text-red-700'
                } else {
                  stile += 'border-gray-200 hover:border-blue-300'
                }

                return (
                  <button
                    key={indiceOpzione}
                    onClick={function () { selezionaRisposta(indiceDomanda, indiceOpzione) }}
                    className={stile}
                  >
                    {opzione}
                  </button>
                )
              })}
              {rispostePresenti[indiceDomanda] !== -1 && (
                <p className="text-sm text-gray-500 mt-3 italic">{domanda.spiegazione}</p>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
