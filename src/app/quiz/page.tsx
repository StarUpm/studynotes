'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Domanda = {
  domanda: string
  opzioni: string[]
  risposta_corretta: number
  spiegazione: string
}

type Flashcard = {
  fronte: string
  retro: string
}

type Schema = {
  titolo: string
  sezioni: { sottotema: string; punti: string[] }[]
}

export default function Quiz() {
  const [testoManuale, setTestoManuale] = useState('')
  const [tabAttivo, setTabAttivo] = useState('quiz')
  const [quiz, setQuiz] = useState<Domanda[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [schema, setSchema] = useState<Schema | null>(null)
  const [flashcardGirate, setFlashcardGirate] = useState<number[]>([])
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

  async function generaContenuto() {
    if (testoManuale.length < 50) {
      setError('Inserisci almeno 50 caratteri di testo')
      return
    }
    setLoading(true)
    setError('')
    setQuiz([])
    setFlashcards([])
    setSchema(null)
    setRispostePresenti([])
    setFlashcardGirate([])

    try {
      let endpoint = '/api/generate-quiz'
      if (tabAttivo === 'flashcard') endpoint = '/api/generate-flashcard'
      if (tabAttivo === 'schema') endpoint = '/api/generate-schema'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testo: testoManuale })
      })
      const data = await response.json()

      if (tabAttivo === 'quiz' && data.quiz) {
        setQuiz(data.quiz)
        setRispostePresenti(new Array(data.quiz.length).fill(-1))
      } else if (tabAttivo === 'flashcard' && data.flashcard) {
        setFlashcards(data.flashcard)
      } else if (tabAttivo === 'schema' && data.schema) {
        setSchema(data.schema)
      } else {
        setError(data.error || 'Errore nella generazione')
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

  function giraFlashcard(indice: number) {
    if (flashcardGirate.includes(indice)) {
      setFlashcardGirate(flashcardGirate.filter(function (i) { return i !== indice }))
    } else {
      setFlashcardGirate([...flashcardGirate, indice])
    }
  }

  function cambiaTab(tab: string) {
    setTabAttivo(tab)
    setQuiz([])
    setFlashcards([])
    setSchema(null)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Studia con AI</h1>
        <p className="text-gray-500 mb-6">Genera quiz, flashcard o schemi dai tuoi appunti</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={function () { cambiaTab('quiz') }}
            className={tabAttivo === 'quiz' ? 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm' : 'bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm'}
          >
            Quiz
          </button>
          <button
            onClick={function () { cambiaTab('flashcard') }}
            className={tabAttivo === 'flashcard' ? 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm' : 'bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm'}
          >
            Flashcard
          </button>
          <button
            onClick={function () { cambiaTab('schema') }}
            className={tabAttivo === 'schema' ? 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm' : 'bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm'}
          >
            Schema
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <textarea
            placeholder="Incolla qui il testo dei tuoi appunti..."
            value={testoManuale}
            onChange={updateTesto}
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={generaContenuto}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mb-8"
        >
          {loading ? 'Generazione in corso...' : 'Genera ' + tabAttivo}
        </button>

        {tabAttivo === 'quiz' && quiz.map(function (domanda, indiceDomanda) {
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

        {tabAttivo === 'flashcard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map(function (fc, indice) {
              const girata = flashcardGirate.includes(indice)
              return (
                <div
                  key={indice}
                  onClick={function () { giraFlashcard(indice) }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer min-h-32 flex items-center justify-center text-center hover:border-blue-300"
                >
                  <p className={girata ? 'text-sm text-gray-600' : 'font-semibold text-gray-900'}>
                    {girata ? fc.retro : fc.fronte}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {tabAttivo === 'schema' && schema && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{schema.titolo}</h2>
            {schema.sezioni.map(function (sezione, i) {
              return (
                <div key={i} className="mb-4">
                  <p className="font-semibold text-blue-600 mb-2">{sezione.sottotema}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {sezione.punti.map(function (punto, j) {
                      return <li key={j} className="text-sm text-gray-600">{punto}</li>
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
