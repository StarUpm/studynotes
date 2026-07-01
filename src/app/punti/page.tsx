'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type PuntiUtente = {
  punti_totali: number
  livello: number
  appunti_caricati: number
  appunti_acquistati: number
  sessioni_completate: number
  quiz_completati: number
}

type StoricoPunti = {
  id: string
  punti: number
  motivo: string
  created_at: string
}

const LIVELLI = [
  { livello: 1, nome: 'Matricola', min: 0, max: 100 },
  { livello: 2, nome: 'Studente', min: 100, max: 300 },
  { livello: 3, nome: 'Secchione', min: 300, max: 600 },
  { livello: 4, nome: 'Esperto', min: 600, max: 1000 },
  { livello: 5, nome: 'Genio', min: 1000, max: 1500 },
  { livello: 6, nome: 'Maestro', min: 1500, max: 2500 },
  { livello: 7, nome: 'Professore', min: 2500, max: 4000 },
  { livello: 8, nome: 'Ricercatore', min: 4000, max: 6000 },
  { livello: 9, nome: 'Accademico', min: 6000, max: 9000 },
  { livello: 10, nome: 'Leggenda', min: 9000, max: 9999 },
]

const AZIONI = [
  { azione: 'appunto_caricato', label: 'Carica un appunto', punti: 50 },
  { azione: 'appunto_acquistato', label: 'Acquista un appunto', punti: 10 },
  { azione: 'sessione_completata', label: 'Completa una sessione', punti: 100 },
  { azione: 'quiz_completato', label: 'Completa un quiz AI', punti: 20 },
  { azione: 'flashcard_completata', label: 'Studia con flashcard', punti: 15 },
  { azione: 'schema_generato', label: 'Genera uno schema', punti: 15 },
  { azione: 'recensione_lasciata', label: 'Lascia una recensione', punti: 10 },
]

function labelMotivo(motivo: string) {
  return AZIONI.find(a => a.azione === motivo)?.label || motivo
}

function tempoFa(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Adesso'
  if (min < 60) return min + ' min fa'
  const ore = Math.floor(min / 60)
  if (ore < 24) return ore + ' ore fa'
  return Math.floor(ore / 24) + ' giorni fa'
}

export default function Punti() {
  const [dati, setDati] = useState<PuntiUtente | null>(null)
  const [storico, setStorico] = useState<StoricoPunti[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const uid = userData.data.user.id
      const [puntiResult, storicoResult] = await Promise.all([
        fetch('/api/punti?utente_id=' + uid).then(r => r.json()),
        supabase.from('storico_punti').select('*').eq('utente_id', uid).order('created_at', { ascending: false }).limit(20)
      ])
      setDati(puntiResult)
      if (storicoResult.data) setStorico(storicoResult.data)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  const livelloAttuale = LIVELLI.find(l => l.livello === (dati?.livello || 1)) || LIVELLI[0]
  const livelloSuccessivo = LIVELLI.find(l => l.livello === (dati?.livello || 1) + 1)
  const puntiAttuali = dati?.punti_totali || 0
  const progressoPercentuale = livelloSuccessivo
    ? Math.round(((puntiAttuali - livelloAttuale.min) / (livelloSuccessivo.min - livelloAttuale.min)) * 100)
    : 100

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>I miei punti</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 32px' }}>Guadagna punti studiando e condividendo</p>

        <div style={{ background: '#18181B', borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: '#2A2A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-trophy" style={{ fontSize: 26, color: '#FAC775' }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 2px' }}>Livello {livelloAttuale.livello}</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: 'white', margin: '0 0 2px' }}>{livelloAttuale.nome}</p>
              <p style={{ fontSize: 28, fontWeight: 500, color: 'white', margin: 0 }}>{puntiAttuali} <span style={{ fontSize: 13, color: '#71717A', fontWeight: 400 }}>punti</span></p>
            </div>
          </div>
          {livelloSuccessivo && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#71717A' }}>Verso {livelloSuccessivo.nome}</span>
                <span style={{ fontSize: 11, color: '#A1A1AA' }}>{progressoPercentuale}%</span>
              </div>
              <div style={{ background: '#2A2A2E', borderRadius: 20, height: 6 }}>
                <div style={{ height: 6, borderRadius: 20, background: '#D85A30', width: progressoPercentuale + '%', transition: 'width 0.5s' }} />
              </div>
              <p style={{ fontSize: 11, color: '#71717A', marginTop: 6 }}>Ancora {livelloSuccessivo.min - puntiAttuali} punti</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Appunti caricati', value: dati?.appunti_caricati || 0 },
            { label: 'Appunti acquistati', value: dati?.appunti_acquistati || 0 },
            { label: 'Sessioni', value: dati?.sessioni_completate || 0 },
            { label: 'Quiz completati', value: dati?.quiz_completati || 0 },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{s.label}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Come guadagnare punti</p>
            <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
              {AZIONI.map(function(a) {
                return (
                  <div key={a.azione} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                    <span style={{ fontSize: 12, color: '#71717A' }}>{a.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#D85A30' }}>+{a.punti}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Tutti i livelli</p>
            <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
              {LIVELLI.map(function(l) {
                const attivo = l.livello === (dati?.livello || 1)
                const raggiunto = puntiAttuali >= l.min
                return (
                  <div key={l.livello} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '0.5px solid #F4F4F5', background: attivo ? '#FFF8F6' : 'transparent', borderRadius: attivo ? 6 : 0, paddingLeft: attivo ? 8 : 0, paddingRight: attivo ? 8 : 0 }}>
                    <span style={{ fontSize: 12, fontWeight: attivo ? 500 : 400, color: attivo ? '#D85A30' : raggiunto ? '#18181B' : '#A1A1AA' }}>
                      {l.livello}. {l.nome}
                    </span>
                    <span style={{ fontSize: 11, color: '#A1A1AA' }}>{l.min}+ pt</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {storico.length > 0 && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Storico punti</p>
            <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
              {storico.map(function(s) {
                return (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                    <div>
                      <p style={{ fontSize: 13, color: '#18181B', margin: '0 0 2px' }}>{labelMotivo(s.motivo)}</p>
                      <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{tempoFa(s.created_at)}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#15803D' }}>+{s.punti} pt</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
