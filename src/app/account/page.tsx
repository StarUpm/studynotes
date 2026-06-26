'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Acquisto = {
  id: string
  note_id: string
  prezzo: number
  created_at: string
  notes: {
    titolo: string
    materia: string
  }
}

type Sessione = {
  id: string
  materia: string
  data_ora: string
  prezzo: number
  stato: string
  tutor_id: string
  studente_id: string
}

export default function Account() {
  const [profilo, setProfilo] = useState<any>(null)
  const [acquisti, setAcquisti] = useState<any[]>([])
  const [sessioniStudente, setSessioniStudente] = useState<Sessione[]>([])
  const [sessioniTutor, setSessioniTutor] = useState<Sessione[]>([])
  const [guadagniAppunti, setGuadagniAppunti] = useState(0)
  const [guadagniSessioni, setGuadagniSessioni] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tabAttivo, setTabAttivo] = useState('panoramica')
  const router = useRouter()

  useEffect(() => {
    caricaDati()
  }, [])

  async function caricaDati() {
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) {
      router.push('/login')
      return
    }

    const userId = userData.data.user.id

    const [profiloResult, acquistiResult, sessioniStudenteResult, sessioniTutorResult, notesResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('purchases').select('*, notes(titolo, materia)').eq('buyer_id', userId).order('created_at', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('studente_id', userId).order('data_ora', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('tutor_id', userId).order('data_ora', { ascending: false }),
      supabase.from('notes').select('id').eq('autore_id', userId)
    ])

    if (profiloResult.data) setProfilo(profiloResult.data)
    if (acquistiResult.data) setAcquisti(acquistiResult.data)
    if (sessioniStudenteResult.data) setSessioniStudente(sessioniStudenteResult.data)
    if (sessioniTutorResult.data) setSessioniTutor(sessioniTutorResult.data)

    if (notesResult.data && notesResult.data.length > 0) {
      const noteIds = notesResult.data.map(function(n) { return n.id })
      const purchasesResult = await supabase
        .from('purchases')
        .select('prezzo')
        .in('note_id', noteIds)

      if (purchasesResult.data) {
        const totale = purchasesResult.data.reduce(function(acc, p) {
          return acc + (p.prezzo || 0)
        }, 0)
        setGuadagniAppunti(totale * 0.8)
      }
    }

    if (sessioniTutorResult.data) {
      const completate = sessioniTutorResult.data.filter(function(s) {
        return s.stato === 'completata'
      })
      const totaleSessioni = completate.reduce(function(acc, s) {
        return acc + (s.prezzo || 0)
      }, 0)
      setGuadagniSessioni(totaleSessioni * 0.8)
    }

    setLoading(false)
  }

  function formattaData(dataString: string) {
    const d = new Date(dataString)
    return d.toLocaleDateString('it-IT') + ' alle ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function formattaDataBreve(dataString: string) {
    const d = new Date(dataString)
    return d.toLocaleDateString('it-IT')
  }

  function coloreStato(stato: string) {
    if (stato === 'confermata') return 'bg-green-50 text-green-600'
    if (stato === 'completata') return 'bg-blue-50 text-blue-600'
    if (stato === 'rifiutata') return 'bg-red-50 text-red-600'
    return 'bg-yellow-50 text-yellow-600'
  }

  function nomeVisibile() {
    if (!profilo) return ''
    if (profilo.nome && profilo.cognome) return profilo.nome + ' ' + profilo.cognome
    if (profilo.nome) return profilo.nome
    return ''
  }

  const sessioniFuture = [...sessioniStudente, ...sessioniTutor]
    .filter(function(s) { return new Date(s.data_ora) > new Date() && s.stato === 'confermata' })
    .sort(function(a, b) { return new Date(a.data_ora).getTime() - new Date(b.data_ora).getTime() })

  const saldoTotale = guadagniAppunti + guadagniSessioni

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-blue-600">
          Torna alla dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {nomeVisibile().charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nomeVisibile() || 'Il mio account'}</h1>
            {profilo?.universita && <p className="text-sm text-gray-500">{profilo.universita}</p>}
          </div>
          <button
            onClick={() => router.push('/modifica-profilo')}
            className="ml-auto text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Modifica profilo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Saldo totale guadagnato</p>
            <p className="text-3xl font-bold text-green-600">€ {saldoTotale.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Al netto della commissione 20%</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Da vendita appunti</p>
            <p className="text-3xl font-bold text-gray-900">€ {guadagniAppunti.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Da sessioni tutor</p>
            <p className="text-3xl font-bold text-gray-900">€ {guadagniSessioni.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['panoramica', 'acquisti', 'sessioni', 'calendario'].map(function(tab) {
            return (
              <button
                key={tab}
                onClick={function() { setTabAttivo(tab) }}
                className={tabAttivo === tab
                  ? 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm capitalize'
                  : 'bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm capitalize hover:bg-gray-50'
                }
              >
                {tab}
              </button>
            )
          })}
        </div>

        {tabAttivo === 'panoramica' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prossime sessioni</h3>
              {sessioniFuture.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione programmata</p>}
              {sessioniFuture.slice(0, 3).map(function(s) {
                return (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.materia}</p>
                      <p className="text-xs text-gray-500">{formattaData(s.data_ora)}</p>
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">confermata</span>
                  </div>
                )
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ultimi acquisti</h3>
              {acquisti.length === 0 && <p className="text-sm text-gray-500">Nessun acquisto effettuato</p>}
              {acquisti.slice(0, 3).map(function(a) {
                return (
                  <div key={a.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.notes?.titolo || 'Appunto'}</p>
                      <p className="text-xs text-gray-500">{formattaDataBreve(a.created_at)}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">€ {a.prezzo?.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tabAttivo === 'acquisti' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">I miei acquisti</h3>
            {acquisti.length === 0 && <p className="text-sm text-gray-500">Non hai ancora acquistato nessun appunto</p>}
            <div className="space-y-3">
              {acquisti.map(function(a) {
                return (
                  <div key={a.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{a.notes?.titolo || 'Appunto'}</p>
                      <p className="text-sm text-gray-500">{a.notes?.materia} · {formattaData(a.created_at)}</p>
                    </div>
                    <span className="font-bold text-gray-900">€ {a.prezzo?.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tabAttivo === 'sessioni' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sessioni come studente</h3>
              {sessioniStudente.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione</p>}
              <div className="space-y-3">
                {sessioniStudente.map(function(s) {
                  return (
                    <div key={s.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{s.materia}</p>
                        <p className="text-sm text-gray-500">{formattaData(s.data_ora)}</p>
                        <p className="text-sm text-gray-500">€ {s.prezzo?.toFixed(2)}</p>
                      </div>
                      <span className={'text-xs px-3 py-1 rounded-full ' + coloreStato(s.stato)}>{s.stato}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sessioni come tutor</h3>
              {sessioniTutor.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione</p>}
              <div className="space-y-3">
                {sessioniTutor.map(function(s) {
                  return (
                    <div key={s.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{s.materia}</p>
                        <p className="text-sm text-gray-500">{formattaData(s.data_ora)}</p>
                        <p className="text-sm text-gray-500">€ {s.prezzo?.toFixed(2)}</p>
                      </div>
                      <span className={'text-xs px-3 py-1 rounded-full ' + coloreStato(s.stato)}>{s.stato}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {tabAttivo === 'calendario' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Sessioni programmate</h3>
            {sessioniFuture.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione futura programmata</p>}
            <div className="space-y-4">
              {sessioniFuture.map(function(s) {
                const d = new Date(s.data_ora)
                return (
                  <div key={s.id} className="flex gap-4 items-start">
                    <div className="bg-blue-50 rounded-xl p-3 text-center min-w-16">
                      <p className="text-xs text-blue-600 font-medium">{d.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase()}</p>
                      <p className="text-2xl font-bold text-blue-600">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <p className="font-semibold text-gray-900">{s.materia}</p>
                      <p className="text-sm text-gray-500">
                        {d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} · € {s.prezzo?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {s.tutor_id === s.studente_id ? '' : 'Sessione confermata'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
