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
  font_grande: false, font_dislessia: false, interlinea: false, testo_semplificato: false,
  alto_contrasto: false, sfondo_crema: false, evidenzia_parole: false, dark_mode: false,
  modalita_focus: false, timer_pomodoro: false, istruzioni_passo: false, quiz_brevi: false,
  text_to_speech: false, righello: false, mappe_mentali: false
}

const SEZIONI = [
  {
    titolo: 'Testo e leggibilità',
    voci: [
      { chiave: 'font_grande', label: 'Font più grande', desc: 'Testo 18px invece di 14px' },
      { chiave: 'font_dislessia', label: 'Font per dislessia', desc: 'OpenDyslexic per leggere meglio' },
      { chiave: 'interlinea', label: 'Interlinea aumentata', desc: 'Più spazio tra le righe' },
      { chiave: 'testo_semplificato', label: 'Testo semplificato', desc: "L'AI usa parole più semplici" },
    ]
  },
  {
    titolo: 'Colori e contrasto',
    voci: [
      { chiave: 'alto_contrasto', label: 'Alto contrasto', desc: 'Testo più scuro su sfondo chiaro' },
      { chiave: 'sfondo_crema', label: 'Sfondo crema', desc: 'Meno affaticamento visivo' },
      { chiave: 'evidenzia_parole', label: 'Evidenzia parole chiave', desc: 'Sottolinea i concetti importanti' },
      { chiave: 'dark_mode', label: 'Modalità scura', desc: 'Sfondo scuro per ridurre luce' },
    ]
  },
  {
    titolo: 'Concentrazione',
    voci: [
      { chiave: 'modalita_focus', label: 'Modalità focus', desc: 'Nascondi distrazioni visive' },
      { chiave: 'timer_pomodoro', label: 'Timer Pomodoro', desc: '25 min studio, 5 min pausa' },
      { chiave: 'istruzioni_passo', label: 'Istruzioni passo passo', desc: 'Una cosa alla volta' },
      { chiave: 'quiz_brevi', label: 'Quiz più brevi', desc: 'Max 10 domande per sessione' },
    ]
  },
  {
    titolo: 'Audio e lettura',
    voci: [
      { chiave: 'text_to_speech', label: 'Leggi il testo ad alta voce', desc: 'Text-to-speech integrato' },
      { chiave: 'righello', label: 'Righello di lettura', desc: 'Evidenzia la riga corrente' },
      { chiave: 'mappe_mentali', label: 'Mappe mentali sempre', desc: 'Preferisci schemi visivi' },
    ]
  },
]

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
      if (profilo.data?.accessibilita) setImpostazioni({ ...DEFAULT, ...profilo.data.accessibilita })
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
    setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    setSalvando(false)
  }

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/profilo-utente')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: 13, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Torna al profilo
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Modalità di studio personalizzata</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 28px' }}>Personalizza l&apos;esperienza in base alle tue esigenze</p>

        {success && <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}><p style={{ fontSize: 13, color: '#15803D', margin: 0 }}>Impostazioni salvate</p></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {SEZIONI.map(function(sezione) {
            return (
              <div key={sezione.titolo} style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 22 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 14px' }}>{sezione.titolo}</p>
                <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
                  {sezione.voci.map(function(v) {
                    const attivo = impostazioni[v.chiave as keyof Impostazioni]
                    return (
                      <div key={v.chiave} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                        <div>
                          <p style={{ fontSize: 13, color: '#18181B', margin: '0 0 1px' }}>{v.label}</p>
                          <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{v.desc}</p>
                        </div>
                        <div onClick={() => toggle(v.chiave as keyof Impostazioni)} style={{ width: 40, height: 22, background: attivo ? '#18181B' : '#E4E4E7', borderRadius: 11, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
                          <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: attivo ? 20 : 2, transition: 'left 0.2s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#185FA5', margin: 0, lineHeight: 1.6 }}>
            Queste impostazioni vengono applicate automaticamente a tutta la piattaforma — quiz, flashcard e strumenti AI si adatteranno alle tue preferenze.
          </p>
        </div>

        <button onClick={salva} disabled={salvando} style={{ background: '#18181B', color: 'white', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}>
          {salvando ? 'Salvataggio...' : 'Salva impostazioni'}
        </button>
      </div>
    </Layout>
  )
}
