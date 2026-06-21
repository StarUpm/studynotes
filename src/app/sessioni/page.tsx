'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Sessione = {
  id: string
  tutor_id: string
  studente_id: string
  materia: string
  data_ora: string
  durata_minuti: number
  prezzo: number
  stato: string
  link_videochiamata: string
}

export default function Sessioni() {
  const [sessioniComeStudente, setSessioniComeStudente] = useState<Sessione[]>([])
  const [sessioniComeTutor, setSessioniComeTutor] = useState<Sessione[]>([])
  const [loading, setLoading] = useState(true)
  const [azioneInCorso, setAzioneInCorso] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchSessioni()
  }, [])

  async function fetchSessioni() {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) {
      setLoading(false)
      return
    }

    const comeStudente = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('studente_id', userData.data.user.id)
      .order('data_ora', { ascending: true })

    const comeTutor = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('tutor_id', userData.data.user.id)
      .order('data_ora', { ascending: true })

    if (comeStudente.data) setSessioniComeStudente(comeStudente.data)
    if (comeTutor.data) setSessioniComeTutor(comeTutor.data)
    setLoading(false)

    const tutteLeSessioni = [...(comeStudente.data || []), ...(comeTutor.data || [])]
    const daControllare = tutteLeSessioni.filter(function (s) {
      return s.stato === 'confermata' && s.link_videochiamata
    })

    for (const sessione of daControllare) {
      verificaInBackground(sessione.id)
    }
  }

  async function verificaInBackground(sessioneId: string) {
    try {
      const response = await fetch('/api/verifica-sessione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessioneId: sessioneId })
      })
      const data = await response.json()
      if (data.completata) {
        fetchSessioni()
      }
    } catch (e) {
      console.log('Verifica automatica non riuscita')
    }
  }

  function monitoraFinestra(finestra: Window | null, sessioneId: string) {
    if (!finestra) return
    const controllo = setInterval(function () {
      if (finestra.closed) {
        clearInterval(controllo)
        verificaInBackground(sessioneId)
      }
    }, 1000)
  }

  async function confermaSessione(sessioneId: string) {
    await supabase.from('tutoring_sessions').update({ stato: 'confermata' }).eq('id', sessioneId)
    fetchSessioni()
  }

  async function rifiutaSessione(sessioneId: string) {
    await supabase.from('tutoring_sessions').update({ stato: 'rifiutata' }).eq('id', sessioneId)
    fetchSessioni()
  }

  async function entraInVideochiamata(sessione: Sessione) {
    if (sessione.link_videochiamata) {
      const finestra = window.open(sessione.link_videochiamata, '_blank')
      monitoraFinestra(finestra, sessione.id)
      return
    }

    setAzioneInCorso(sessione.id)

    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessioneId: sessione.id })
      })
      const data = await response.json()

      if (data.url) {
        await supabase.from('tutoring_sessions').update({ link_videochiamata: data.url }).eq('id', sessione.id)
        const finestra = window.open(data.url, '_blank')
        monitoraFinestra(finestra, sessione.id)
        fetchSessioni()
      } else {
        alert('Errore nella creazione della videochiamata')
      }
    } catch (e) {
      alert('Errore di connessione')
    }
    setAzioneInCorso('')
  }

  function goToDashboard() {
    router.push('/dashboard')
  }

  function formattaData(dataString: string) {
    const d = new Date(dataString)
    return d.toLocaleDateString('it-IT') + ' alle ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function coloreStato(stato: string) {
    if (stato === 'confermata') return 'bg-green-50 text-green-600'
    if (stato === 'completata') return 'bg-blue-50 text-blue-600'
    if (stato === 'rifiutata') return 'bg-red-50 text-red-600'
    return 'bg-yellow-50 text-yellow-600'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={goToDashboard} className="text-sm text-gray-500 hover:text-blue-600">
          Torna alla dashboard
        </button>
      </nav>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Le mie sessioni</h1>

        {loading && <p className="text-gray-500">Caricamento...</p>}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessioni come studente</h2>
        {sessioniComeStudente.length === 0 && <p className="text-gray-500 mb-8">Nessuna sessione prenotata</p>}
        <div className="space-y-3 mb-10">
          {sessioniComeStudente.map(function (s) {
            const inCorso = azioneInCorso === s.id
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{s.materia}</p>
                  <p className="text-sm text-gray-500">{formattaData(s.data_ora)}</p>
                  <p className="text-sm text-gray-500">€ {s.prezzo.toFixed(2)}</p>
                </div>
                {s.stato === 'confermata' ? (
                  <button
                    onClick={function () { entraInVideochiamata(s) }}
                    disabled={inCorso}
                    className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {inCorso ? 'Attendere...' : 'Entra in videochiamata'}
                  </button>
                ) : (
                  <span className={'text-xs px-3 py-1 rounded-full ' + coloreStato(s.stato)}>{s.stato}</span>
                )}
              </div>
            )
          })}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessioni come tutor</h2>
        {sessioniComeTutor.length === 0 && <p className="text-gray-500">Nessuna richiesta ricevuta</p>}
        <div className="space-y-3">
          {sessioniComeTutor.map(function (s) {
            const inCorso = azioneInCorso === s.id
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{s.materia}</p>
                  <p className="text-sm text-gray-500">{formattaData(s.data_ora)}</p>
                  <p className="text-sm text-gray-500">€ {s.prezzo.toFixed(2)}</p>
                </div>
                {s.stato === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={function () { confermaSessione(s.id) }} className="bg-green-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-700">
                      Conferma
                    </button>
                    <button onClick={function () { rifiutaSessione(s.id) }} className="bg-red-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-red-700">
                      Rifiuta
                    </button>
                  </div>
                ) : s.stato === 'confermata' ? (
                  <button
                    onClick={function () { entraInVideochiamata(s) }}
                    disabled={inCorso}
                    className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {inCorso ? 'Attendere...' : 'Entra in videochiamata'}
                  </button>
                ) : (
                  <span className={'text-xs px-3 py-1 rounded-full ' + coloreStato(s.stato)}>{s.stato}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
