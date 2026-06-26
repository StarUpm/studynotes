'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Videochiamata() {
  const [roomUrl, setRoomUrl] = useState('')
  const [ruolo, setRuolo] = useState('')
  const [messaggioStato, setMessaggioStato] = useState('Connessione in corso...')
  const [errore, setErrore] = useState('')
  const router = useRouter()
  const params = useParams()
  const sessioneId = params.sessioneId as string

  useEffect(() => {
    async function inizializza() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) {
        router.push('/login')
        return
      }

      const [sessioneResult, profiloResult] = await Promise.all([
        supabase.from('tutoring_sessions').select('*').eq('id', sessioneId).single(),
        supabase.from('profiles').select('nome, cognome').eq('id', userData.data.user.id).single()
      ])

      if (!sessioneResult.data) {
        setErrore('Sessione non trovata')
        return
      }

      const sessione = sessioneResult.data
      const profilo = profiloResult.data
      let ruoloLocale = ''

      if (sessione.tutor_id === userData.data.user.id) {
        ruoloLocale = 'tutor'
        setRuolo('tutor')
      } else if (sessione.studente_id === userData.data.user.id) {
        ruoloLocale = 'studente'
        setRuolo('studente')
      } else {
        setErrore('Non sei autorizzato a questa sessione')
        return
      }

      let nomeUtente = 'Utente'
      if (profilo) {
        if (profilo.nome && profilo.cognome) {
          nomeUtente = profilo.nome + ' ' + profilo.cognome
        } else if (profilo.nome) {
          nomeUtente = profilo.nome
        } else {
          nomeUtente = userData.data.user.email || 'Utente'
        }
      }

      let urlBase = sessione.link_videochiamata

      if (!urlBase) {
        try {
          const response = await fetch('/api/create-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessioneId: sessioneId })
          })
          const data = await response.json()

          if (data.url) {
            await supabase
              .from('tutoring_sessions')
              .update({ link_videochiamata: data.url })
              .eq('id', sessioneId)
            urlBase = data.url
          } else {
            setErrore('Errore nella creazione della stanza video')
            return
          }
        } catch (e) {
          setErrore('Errore di connessione')
          return
        }
      }

      const urlConNome = urlBase + '?displayName=' + encodeURIComponent(nomeUtente)
      setRoomUrl(urlConNome)
      setMessaggioStato('')
      registraEvento('entrato', ruoloLocale, sessioneId)
    }

    inizializza()
  }, [sessioneId])

  async function registraEvento(evento: string, ruoloLocale: string, sid: string) {
    try {
      const response = await fetch('/api/evento-chiamata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessioneId: sid, ruolo: ruoloLocale, evento: evento })
      })
      const data = await response.json()
      if (evento === 'uscito' && data.completata) {
        setMessaggioStato('Sessione completata! Pagamento confermato.')
      }
    } catch (e) {
      console.log('Errore registrazione evento')
    }
  }

  function tornaSessioni() {
    registraEvento('uscito', ruolo, sessioneId)
    router.push('/sessioni')
  }

  if (errore) {
    return (
      <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
        <p className="text-white text-lg">{errore}</p>
        <button onClick={() => router.push('/sessioni')} className="mt-4 text-gray-300 text-sm hover:text-white underline">
          Torna alle sessioni
        </button>
      </main>
    )
  }

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a' }}>
      <nav className="bg-gray-800 px-6 py-3 flex items-center">
        <button onClick={tornaSessioni} className="text-gray-300 text-sm hover:text-white">
          ← Esci e torna alle sessioni
        </button>
        <span className="text-white font-semibold text-sm ml-auto">StudyNotes</span>
      </nav>

      {messaggioStato && !errore && (
        <div className="text-center text-white py-8">
          <p>{messaggioStato}</p>
        </div>
      )}

      {roomUrl && (
        <iframe
          src={roomUrl + '&skipMediaPermissionPrompt'}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          style={{ flex: 1, width: '100%', border: 'none' }}
          onLoad={function(e) {
            const iframe = e.target as HTMLIFrameElement
            window.addEventListener('message', function(event) {
              if (event.origin.includes('whereby.com') && event.data && event.data.type === 'whereby.on_meeting_end') {
                registraEvento('uscito', ruolo, sessioneId)
                router.push('/sessioni')
              }
            })
          }}
        />
      )}
    </main>
  )
}
