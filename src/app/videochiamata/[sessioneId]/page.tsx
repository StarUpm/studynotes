'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export default function Videochiamata() {
  const [ruolo, setRuolo] = useState('')
  const [caricato, setCaricato] = useState(false)
  const [messaggioStato, setMessaggioStato] = useState('Connessione in corso...')
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const router = useRouter()
  const params = useParams()
  const sessioneId = params.sessioneId as string

  useEffect(() => {
    async function determinaRuolo() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) {
        router.push('/login')
        return
      }

      const sessioneResult = await supabase.from('tutoring_sessions').select('*').eq('id', sessioneId).single()
      if (!sessioneResult.data) {
        setMessaggioStato('Sessione non trovata')
        return
      }

      const sessione = sessioneResult.data
      if (sessione.tutor_id === userData.data.user.id) {
        setRuolo('tutor')
      } else if (sessione.studente_id === userData.data.user.id) {
        setRuolo('studente')
      } else {
        setMessaggioStato('Non sei autorizzato a questa sessione')
        return
      }

      caricaScriptJitsi()
    }

    determinaRuolo()

    return function () {
      if (apiRef.current) {
        apiRef.current.dispose()
      }
    }
  }, [sessioneId])

  function caricaScriptJitsi() {
    if (window.JitsiMeetExternalAPI) {
      inizializzaChiamata()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://meet.jit.si/external_api.js'
    script.onload = inizializzaChiamata
    document.body.appendChild(script)
  }

  function inizializzaChiamata() {
    if (!containerRef.current) return

    const roomName = 'studynotes-sessione-' + sessioneId

    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: containerRef.current,
      userInfo: {
        displayName: ruolo === 'tutor' ? 'Tutor' : 'Studente'
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        requireDisplayName: false
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'hangup', 'fullscreen']
      }
    }

    const api = new window.JitsiMeetExternalAPI('meet.jit.si', options)
    apiRef.current = api
    setCaricato(true)
    setMessaggioStato('')

    api.addEventListener('videoConferenceJoined', function () {
      registraEvento('entrato')
    })

    api.addEventListener('videoConferenceLeft', function () {
      registraEvento('uscito')
    })

    api.addEventListener('readyToClose', function () {
      router.push('/sessioni')
    })
  }

  async function registraEvento(evento: string) {
    try {
      const response = await fetch('/api/evento-chiamata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessioneId: sessioneId, ruolo: ruolo, evento: evento })
      })
      const data = await response.json()
      if (evento === 'uscito' && data.completata) {
        setMessaggioStato('Sessione completata con successo! Pagamento confermato.')
      }
    } catch (e) {
      console.log('Errore registrazione evento')
    }
  }

  function tornaSessioni() {
    if (apiRef.current) {
      apiRef.current.dispose()
    }
    router.push('/sessioni')
  }

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col">
      <nav className="bg-gray-800 px-6 py-3 flex justify-between items-center">
        <span className="text-white font-semibold">StudyNotes - Videochiamata</span>
        <button onClick={tornaSessioni} className="text-gray-300 text-sm hover:text-white">
          Esci e torna alle sessioni
        </button>
      </nav>
      {messaggioStato && (
        <div className="text-center text-white py-4">
          {messaggioStato}
        </div>
      )}
      <div ref={containerRef} className="flex-1 w-full"></div>
    </main>
  )
}
