'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Profilo = {
  id: string
  nome: string
  cognome: string
  email: string
  universita: string
  tipo_istituto: string
  anno_studio: string
  curriculum: string
  bio: string
  is_tutor: boolean
  materie_insegnate: string
  tariffa_oraria: number
}

type Nota = {
  id: string
  titolo: string
  materia: string
  prezzo: number
}

type Recensione = {
  id: string
  voto: number
  commento: string
  created_at: string
}

export default function ProfiloPubblico() {
  const [profilo, setProfilo] = useState<Profilo | null>(null)
  const [appunti, setAppunti] = useState<Nota[]>([])
  const [recensioni, setRecensioni] = useState<Recensione[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  useEffect(() => {
    async function caricaDati() {
      const profiloResult = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (profiloResult.data) {
        setProfilo(profiloResult.data)
      }

      const appuntiResult = await supabase.from('notes').select('*').eq('autore_id', userId)
      if (appuntiResult.data) {
        setAppunti(appuntiResult.data)
      }

      const recensioniResult = await supabase.from('reviews').select('*').eq('destinatario_id', userId)
      if (recensioniResult.data) {
        setRecensioni(recensioniResult.data)
      }

      setLoading(false)
    }
    caricaDati()
  }, [userId])

  function nomeVisibile() {
    if (!profilo) return ''
    if (profilo.nome && profilo.cognome) return profilo.nome + ' ' + profilo.cognome
    if (profilo.nome) return profilo.nome
    return profilo.email
  }

  function nomeIstituto() {
    if (!profilo) return ''
    return profilo.tipo_istituto === 'liceo' ? 'Scuola superiore' : 'Universita'
  }

  function votoMedio() {
    if (recensioni.length === 0) return 0
    const somma = recensioni.reduce(function (acc, r) {
      return acc + r.voto
    }, 0)
    return somma / recensioni.length
  }

  function renderStelle(voto: number) {
    const stelle = []
    for (let i = 1; i <= 5; i++) {
      stelle.push(i <= Math.round(voto) ? '★' : '☆')
    }
    return stelle.join('')
  }

  function goToDashboard() {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </main>
    )
  }

  if (!profilo) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Profilo non trovato</p>
      </main>
    )
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
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {nomeVisibile().charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{nomeVisibile()}</h1>
              {profilo.is_tutor ? (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Tutor</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Studente</span>
              )}
            </div>
          </div>

          {profilo.universita && (
            <p className="text-sm text-gray-500 mb-1">
              {nomeIstituto()}: {profilo.universita} {profilo.anno_studio ? '- ' + profilo.anno_studio : ''}
            </p>
          )}

          {profilo.curriculum && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Curriculum</p>
              <p className="text-sm text-gray-600">{profilo.curriculum}</p>
            </div>
          )}

          {recensioni.length > 0 && (
            <p className="text-yellow-400 text-sm mt-4">
              {renderStelle(votoMedio())} <span className="text-gray-400">({recensioni.length} recensioni)</span>
            </p>
          )}

          {profilo.is_tutor && (
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-blue-600 mb-1">Tutor disponibile</p>
              <p className="text-sm text-gray-700">{profilo.materie_insegnate}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">€ {profilo.tariffa_oraria.toFixed(2)} / ora</p>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appunti caricati ({appunti.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {appunti.map(function (a) {
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="font-semibold text-gray-900 mb-1">{a.titolo}</p>
                <p className="text-sm text-gray-500 mb-2">{a.materia}</p>
                <p className="text-sm font-bold text-gray-900">{a.prezzo > 0 ? '€ ' + a.prezzo.toFixed(2) : 'Gratis'}</p>
              </div>
            )
          })}
          {appunti.length === 0 && <p className="text-gray-500">Nessun appunto caricato</p>}
        </div>

        {recensioni.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recensioni</h2>
            <div className="space-y-3">
              {recensioni.map(function (r) {
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-yellow-400 text-sm mb-2">{renderStelle(r.voto)}</p>
                    {r.commento && <p className="text-sm text-gray-600">{r.commento}</p>}
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
