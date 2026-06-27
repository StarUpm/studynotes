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
  { livello: 1, nome: 'Matricola', emoji: '🌱', min: 0, max: 100 },
  { livello: 2, nome: 'Studente', emoji: '📚', min: 100, max: 300 },
  { livello: 3, nome: 'Secchione', emoji: '🤓', min: 300, max: 600 },
  { livello: 4, nome: 'Esperto', emoji: '⭐', min: 600, max: 1000 },
  { livello: 5, nome: 'Genio', emoji: '🧠', min: 1000, max: 1500 },
  { livello: 6, nome: 'Maestro', emoji: '🎓', min: 1500, max: 2500 },
  { livello: 7, nome: 'Professore', emoji: '👨‍🏫', min: 2500, max: 4000 },
  { livello: 8, nome: 'Ricercatore', emoji: '🔬', min: 4000, max: 6000 },
  { livello: 9, nome: 'Accademico', emoji: '🏛️', min: 6000, max: 9000 },
  { livello: 10, nome: 'Leggenda', emoji: '🏆', min: 9000, max: 9999 },
]

const AZIONI = [
  { azione: 'appunto_caricato', label: 'Carica un appunto', punti: 50, emoji: '📤', colore: '#EFF6FF' },
  { azione: 'appunto_acquistato', label: 'Acquista un appunto', punti: 10, emoji: '🛒', colore: '#ECFDF5' },
  { azione: 'sessione_completata', label: 'Completa una sessione', punti: 100, emoji: '🎥', colore: '#EEEDFE' },
  { azione: 'quiz_completato', label: 'Completa un quiz AI', punti: 20, emoji: '🧠', colore: '#FFFBEB' },
  { azione: 'flashcard_completata', label: 'Studia con flashcard', punti: 15, emoji: '🃏', colore: '#FDF2F8' },
  { azione: 'schema_generato', label: 'Genera uno schema', punti: 15, emoji: '🗺️', colore: '#F0FDFA' },
  { azione: 'recensione_lasciata', label: 'Lascia una recensione', punti: 10, emoji: '⭐', colore: '#FFFBEB' },
]

function labelMotivo(motivo: string) {
  const a = AZIONI.find(function(a) { return a.azione === motivo })
  return a ? a.label : motivo
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

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  const livelloAttuale = LIVELLI.find(function(l) { return l.livello === (dati?.livello || 1) }) || LIVELLI[0]
  const livelloSuccessivo = LIVELLI.find(function(l) { return l.livello === (dati?.livello || 1) + 1 })
  const puntiAttuali = dati?.punti_totali || 0
  const progressoPercentuale = livelloSuccessivo
    ? Math.round(((puntiAttuali - livelloAttuale.min) / (livelloSuccessivo.min - livelloAttuale.min)) * 100)
    : 100

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🏆 I miei punti</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Guadagna punti studiando e condividendo</p>

        <div style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', borderRadius: 16, padding: 28, marginBottom: 20, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 52 }}>{livelloAttuale.emoji}</div>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Livello {livelloAttuale.livello}</p>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 2 }}>{livelloAttuale.nome}</h2>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{puntiAttuali} <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>punti</span></p>
            </div>
          </div>

          {livelloSuccessivo && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Progresso verso {livelloSuccessivo.nome} {livelloSuccessivo.emoji}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{progressoPercentuale}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, height: 8 }}>
                <div style={{ height: 8, borderRadius: 20, background: 'white', width: progressoPercentuale + '%', transition: 'width 0.5s' }} />
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
                Ancora {livelloSuccessivo.min - puntiAttuali} punti per raggiungere il livello {livelloSuccessivo.livello}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Appunti caricati', value: dati?.appunti_caricati || 0, emoji: '📤' },
            { label: 'Appunti acquistati', value: dati?.appunti_acquistati || 0, emoji: '🛒' },
            { label: 'Sessioni', value: dati?.sessioni_completate || 0, emoji: '🎥' },
            { label: 'Quiz completati', value: dati?.quiz_completati || 0, emoji: '🧠' },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Come guadagnare punti</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AZIONI.map(function(a) {
                return (
                  <div key={a.azione} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: a.colore, borderRadius: 10 }}>
                    <span style={{ fontSize: 20 }}>{a.emoji}</span>
                    <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{a.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#185FA5' }}>+{a.punti}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Tutti i livelli</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LIVELLI.map(function(l) {
                const attivo = l.livello === (dati?.livello || 1)
                const raggiunto = (dati?.punti_totali || 0) >= l.min
                return (
                  <div key={l.livello} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: attivo ? '#EFF6FF' : 'transparent', borderRadius: 8, border: attivo ? '0.5px solid #BFDBFE' : 'none' }}>
                    <span style={{ fontSize: 18 }}>{l.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: attivo ? 600 : 400, color: attivo ? '#185FA5' : raggiunto ? '#374151' : '#9CA3AF' }}>
                        Liv. {l.livello} — {l.nome}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{l.min}+ pt</span>
                    {raggiunto && <span style={{ fontSize: 12 }}>✅</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {storico.length > 0 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Storico punti</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {storico.map(function(s) {
                return (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #f3f4f6' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>{labelMotivo(s.motivo)}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>{tempoFa(s.created_at)}</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>+{s.punti} pt</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {storico.length === 0 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Inizia a guadagnare punti!</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Carica un appunto, studia con l&apos;AI o prenota una sessione per iniziare</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => router.push('/upload')} style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Carica appunti
              </button>
              <button onClick={() => router.push('/studia')} style={{ background: 'white', color: '#185FA5', border: '0.5px solid #185FA5', padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Studia con AI
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
