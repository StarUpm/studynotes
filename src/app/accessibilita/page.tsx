'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Impostazioni = {
  font_grande: boolean
  font_dislessia: boolean
  interlinea: boolean
  testo_semplificato: boolean
  alto_contrasto: boolean
  sfondo_crema: boolean
  evidenzia_parole: boolean
  dark_mode: boolean
  modalita_focus: boolean
  timer_pomodoro: boolean
  istruzioni_passo: boolean
  quiz_brevi: boolean
  text_to_speech: boolean
  righello: boolean
  mappe_mentali: boolean
}

const DEFAULT: Impostazioni = {
  font_grande: false, font_dislessia: false, interlinea: false,
  testo_semplificato: false, alto_contrasto: false, sfondo_crema: false,
  evidenzia_parole: false, dark_mode: false, modalita_focus: false,
  timer_pomodoro: false, istruzioni_passo: false, quiz_brevi: false,
  text_to_speech: false, righello: false, mappe_mentali: false
}

export default function Accessibilita() {
  const [impostazioni, setImpostazioni] = useState<Impostazioni>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const profilo = await supabase.from('profiles').select('accessibilita').eq('id', userData.data.user.id).single()
      if (profilo.data?.accessibilita) {
        setImpostazioni({ ...DEFAULT, ...profilo.data.accessibilita })
      }
      setLoading(false)
    }
    init()
  }, [router])

  function toggle(chiave: keyof Impostazioni) {
    setImpostazioni(prev => ({ ...prev, [chiave]: !prev[chiave] }))
  }

  async function salva() {
    setSalvando(true)
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    await supabase.from('profiles').update({ accessibilita: impostazioni }).eq('id', userData.data.user.id)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    setSalvando(false)
  }

  function Toggle({ chiave }: { chiave: keyof Impostazioni }) {
    const attivo = impostazioni[chiave]
    return (
      <div
        onClick={() => toggle(chiave)}
        style={{ width: 44, height: 24, background: attivo ? '#185FA5' : '#e5e7eb', borderRadius: 12, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
      >
        <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: attivo ? 22 : 2, transition: 'left 0.2s' }} />
      </div>
    )
  }

  function Riga({ chiave, label, desc }: { chiave: keyof Impostazioni, label: string, desc: string }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 13, color: '#111827', marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: 11, color: '#9CA3AF' }}>{desc}</p>
        </div>
        <Toggle chiave={chiave} />
      </div>
    )
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/profilo-utente')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna al profilo</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>⚙️ Modalità di studio personalizzata</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Personalizza l&apos;esperienza di studio in base alle tue esigenze</p>

        {success && (
          <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#059669' }}>✓ Impostazioni salvate!</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Testo e leggibilità</h2>
            <Riga chiave="font_grande" label="Font più grande" desc="Testo 18px invece di 14px" />
            <Riga chiave="font_dislessia" label="Font per dislessia" desc="OpenDyslexic per leggere meglio" />
            <Riga chiave="interlinea" label="Interlinea aumentata" desc="Più spazio tra le righe" />
            <Riga chiave="testo_semplificato" label="Testo semplificato" desc="L'AI usa parole più semplici" />
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Colori e contrasto</h2>
            <Riga chiave="alto_contrasto" label="Alto contrasto" desc="Testo più scuro su sfondo chiaro" />
            <Riga chiave="sfondo_crema" label="Sfondo crema" desc="Meno affaticamento visivo" />
            <Riga chiave="evidenzia_parole" label="Evidenzia parole chiave" desc="Sottolinea i concetti importanti" />
            <Riga chiave="dark_mode" label="Modalità scura" desc="Sfondo scuro per ridurre luce" />
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Concentrazione</h2>
            <Riga chiave="modalita_focus" label="Modalità focus" desc="Nascondi distrazioni visive" />
            <Riga chiave="timer_pomodoro" label="Timer Pomodoro" desc="25 min studio, 5 min pausa" />
            <Riga chiave="istruzioni_passo" label="Istruzioni passo passo" desc="Una cosa alla volta" />
            <Riga chiave="quiz_brevi" label="Quiz più brevi" desc="Max 10 domande per sessione" />
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Audio e lettura</h2>
            <Riga chiave="text_to_speech" label="Leggi il testo ad alta voce" desc="Text-to-speech integrato" />
            <Riga chiave="righello" label="Righello di lettura" desc="Evidenzia la riga corrente" />
            <Riga chiave="mappe_mentali" label="Mappe mentali sempre" desc="Preferisci schemi visivi" />
          </div>
        </div>

        <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#185FA5', lineHeight: 1.6 }}>
            💡 Queste impostazioni vengono applicate automaticamente a tutta la piattaforma — quiz, flashcard, schemi e tutti gli strumenti AI si adatteranno alle tue preferenze.
          </p>
        </div>

        <button
          onClick={salva}
          disabled={salvando}
          style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}
        >
          {salvando ? 'Salvataggio...' : 'Salva impostazioni'}
        </button>
      </div>
    </Layout>
  )
}
