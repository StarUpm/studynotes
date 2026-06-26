'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { universita } from '@/lib/dati-universita'

export default function ProfiloUtente() {
  const [tab, setTab] = useState('profilo')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [universitaInput, setUniversitaInput] = useState('')
  const [tipoIstituto, setTipoIstituto] = useState('universita')
  const [annoStudio, setAnnoStudio] = useState('')
  const [curriculum, setCurriculum] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [successoProfilo, setSuccessoProfilo] = useState(false)
  const [erroreProfilo, setErroreProfilo] = useState('')
  const [suggerimenti, setSuggerimenti] = useState<string[]>([])
  const [acquisti, setAcquisti] = useState<any[]>([])
  const [sessioniStudente, setSessioniStudente] = useState<any[]>([])
  const [sessioniTutor, setSessioniTutor] = useState<any[]>([])
  const [guadagniAppunti, setGuadagniAppunti] = useState(0)
  const [guadagniSessioni, setGuadagniSessioni] = useState(0)
  const [loading, setLoading] = useState(true)
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

    const [profiloResult, acquistiResult, sessioniSResult, sessioniTResult, notesResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('purchases').select('*, notes(titolo, materia)').eq('buyer_id', userId).order('created_at', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('studente_id', userId).order('data_ora', { ascending: false }),
      supabase.from('tutoring_sessions').select('*').eq('tutor_id', userId).order('data_ora', { ascending: false }),
      supabase.from('notes').select('id').eq('autore_id', userId)
    ])

    if (profiloResult.data) {
      const p = profiloResult.data
      setNome(p.nome || '')
      setCognome(p.cognome || '')
      setUniversitaInput(p.universita || '')
      setTipoIstituto(p.tipo_istituto || 'universita')
      setAnnoStudio(p.anno_studio || '')
      setCurriculum(p.curriculum || '')
    }
    if (acquistiResult.data) setAcquisti(acquistiResult.data)
    if (sessioniSResult.data) setSessioniStudente(sessioniSResult.data)
    if (sessioniTResult.data) setSessioniTutor(sessioniTResult.data)

    if (notesResult.data && notesResult.data.length > 0) {
      const noteIds = notesResult.data.map(function (n) { return n.id })
      const purchasesResult = await supabase.from('purchases').select('prezzo').in('note_id', noteIds)
      if (purchasesResult.data) {
        const totale = purchasesResult.data.reduce(function (acc, p) { return acc + (p.prezzo || 0) }, 0)
        setGuadagniAppunti(totale * 0.8)
      }
    }

    if (sessioniTResult.data) {
      const completate = sessioniTResult.data.filter(function (s) { return s.stato === 'completata' })
      const totale = completate.reduce(function (acc, s) { return acc + (s.prezzo || 0) }, 0)
      setGuadagniSessioni(totale * 0.8)
    }

    setLoading(false)
  }

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

  async function salvaProfilo() {
    setSalvando(true)
    setErroreProfilo('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    const result = await supabase.from('profiles').update({
      nome, cognome,
      universita: universitaInput,
      tipo_istituto: tipoIstituto,
      anno_studio: annoStudio,
      curriculum
    }).eq('id', userData.data.user.id)
    if (result.error) {
      setErroreProfilo('Errore nel salvataggio')
    } else {
      setSuccessoProfilo(true)
      setTimeout(() => setSuccessoProfilo(false), 3000)
    }
    setSalvando(false)
  }

  function formattaData(d: string) {
    const data = new Date(d)
    return data.toLocaleDateString('it-IT') + ' alle ' + data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  function coloreStato(stato: string) {
    if (stato === 'confermata') return 'bg-green-50 text-green-600'
    if (stato === 'completata') return 'bg-blue-50 text-blue-600'
    if (stato === 'rifiutata') return 'bg-red-50 text-red-600'
    return 'bg-yellow-50 text-yellow-600'
  }

  const sessioniFuture = [...sessioniStudente, ...sessioniTutor]
    .filter(function (s) { return new Date(s.data_ora) > new Date() && s.stato === 'confermata' })
    .sort(function (a, b) { return new Date(a.data_ora).getTime() - new Date(b.data_ora).getTime() })

  const saldoTotale = guadagniAppunti + guadagniSessioni
  const nomeVisibile = nome && cognome ? nome + ' ' + cognome : nome || 'Il mio profilo'

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
            {nomeVisibile.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nomeVisibile}</h1>
            {universitaInput && <p className="text-sm text-gray-500">{universitaInput}</p>}
          </div>
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

        <div className="flex gap-2 mb-6 flex-wrap">
          {['profilo', 'acquisti', 'sessioni', 'calendario'].map(function (t) {
            return (
              <button
                key={t}
                onClick={function () { setTab(t) }}
                className={tab === t
                  ? 'bg-blue-600 text-white px-4 py-2 rounded-lg text-sm capitalize'
                  : 'bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm capitalize hover:bg-gray-50'
                }
              >
                {t}
              </button>
            )
          })}
        </div>

        {tab === 'profilo' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Modifica profilo</h2>
            {erroreProfilo && <p className="text-red-500 text-sm mb-4">{erroreProfilo}</p>}
            {successoProfilo && <p className="text-green-500 text-sm mb-4">Profilo salvato!</p>}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="text" placeholder="Nome" value={nome}
                onChange={function (e) { setNome(e.target.value) }}
                className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Cognome" value={cognome}
                onChange={function (e) { setCognome(e.target.value) }}
                className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div className="flex gap-3 mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" checked={tipoIstituto === 'universita'} onChange={function () { setTipoIstituto('universita') }} />
                Universita
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" checked={tipoIstituto === 'liceo'} onChange={function () { setTipoIstituto('liceo') }} />
                Scuola superiore
              </label>
            </div>

            <div className="relative mb-3">
              <input type="text"
                placeholder={tipoIstituto === 'universita' ? 'Universita che frequenti' : 'Nome della scuola'}
                value={universitaInput} onChange={updateUniversita}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              {suggerimenti.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                  {suggerimenti.map(function (s, i) {
                    return (
                      <button key={i} onClick={function () { setUniversitaInput(s); setSuggerimenti([]) }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 block">
                        {s}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <input type="text"
              placeholder={tipoIstituto === 'universita' ? 'Anno di corso (es. 2 anno - Triennale)' : 'Anno (es. 4 anno)'}
              value={annoStudio} onChange={function (e) { setAnnoStudio(e.target.value) }}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:border-blue-500" />

            <textarea placeholder="Breve curriculum: studi, esperienze, competenze..."
              value={curriculum} onChange={function (e) { setCurriculum(e.target.value) }}
              rows={5} className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-blue-500" />

            <button onClick={salvaProfilo} disabled={salvando}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {salvando ? 'Salvataggio...' : 'Salva profilo'}
            </button>
          </div>
        )}

        {tab === 'acquisti' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">I miei acquisti</h3>
            {acquisti.length === 0 && <p className="text-sm text-gray-500">Non hai ancora acquistato nessun appunto</p>}
            <div className="space-y-3">
              {acquisti.map(function (a) {
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

        {tab === 'sessioni' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sessioni come studente</h3>
              {sessioniStudente.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione</p>}
              <div className="space-y-3">
                {sessioniStudente.map(function (s) {
                  return (
                    <div key={s.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{s.materia}</p>
                        <p className="text-sm text-gray-500">{formattaData(s.data_ora)} · € {s.prezzo?.toFixed(2)}</p>
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
                {sessioniTutor.map(function (s) {
                  return (
                    <div key={s.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{s.materia}</p>
                        <p className="text-sm text-gray-500">{formattaData(s.data_ora)} · € {s.prezzo?.toFixed(2)}</p>
                      </div>
                      <span className={'text-xs px-3 py-1 rounded-full ' + coloreStato(s.stato)}>{s.stato}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'calendario' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Sessioni programmate</h3>
            {sessioniFuture.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione futura programmata</p>}
            <div className="space-y-4">
              {sessioniFuture.map(function (s) {
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
