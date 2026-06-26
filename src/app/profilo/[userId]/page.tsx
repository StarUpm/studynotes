'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/app/components/Layout'

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
      const [profiloResult, appuntiResult, recensioniResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('notes').select('*').eq('autore_id', userId),
        supabase.from('reviews').select('*').eq('destinatario_id', userId)
      ])
      if (profiloResult.data) setProfilo(profiloResult.data)
      if (appuntiResult.data) setAppunti(appuntiResult.data)
      if (recensioniResult.data) setRecensioni(recensioniResult.data)
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

  function votoMedio() {
    if (recensioni.length === 0) return 0
    return recensioni.reduce(function(acc, r) { return acc + r.voto }, 0) / recensioni.length
  }

  function renderStelle(voto: number) {
    return [1,2,3,4,5].map(function(i) { return i <= Math.round(voto) ? '★' : '☆' }).join('')
  }

  function iniziali() {
    const n = nomeVisibile()
    return n.charAt(0).toUpperCase()
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento profilo...</p>
      </div>
    </Layout>
  )

  if (!profilo) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Profilo non trovato</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>

        {/* HEADER PROFILO */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {iniziali()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{nomeVisibile()}</h1>
                {profilo.is_tutor ? (
                  <span style={{ fontSize: 11, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', padding: '3px 10px', borderRadius: 20 }}>Tutor</span>
                ) : (
                  <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6B7280', padding: '3px 10px', borderRadius: 20 }}>Studente</span>
                )}
              </div>
              {recensioni.length > 0 && (
                <p style={{ fontSize: 14, color: '#B45309', marginBottom: 6 }}>
                  {renderStelle(votoMedio())} <span style={{ color: '#9CA3AF', fontSize: 12 }}>({recensioni.length} recensioni)</span>
                </p>
              )}
              {profilo.universita && (
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>
                  {profilo.tipo_istituto === 'liceo' ? '🏫 Scuola superiore' : '🎓 Università'}: <strong style={{ color: '#374151' }}>{profilo.universita}</strong>
                  {profilo.anno_studio && <span style={{ color: '#9CA3AF' }}> · {profilo.anno_studio}</span>}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={function() { router.push('/chat?userId=' + userId) }}
                style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                💬 Scrivi
              </button>
              {profilo.is_tutor && (
                <button
                  onClick={function() { router.push('/prenota/' + userId) }}
                  style={{ background: 'white', color: '#185FA5', border: '0.5px solid #185FA5', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  📅 Prenota
                </button>
              )}
            </div>
          </div>

          {profilo.curriculum && (
            <div style={{ borderTop: '0.5px solid #e5e7eb', paddingTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Curriculum</p>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{profilo.curriculum}</p>
            </div>
          )}

          {profilo.is_tutor && profilo.materie_insegnate && (
            <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '14px 16px', marginTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#185FA5', marginBottom: 6 }}>Disponibile per ripetizioni</p>
              <p style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{profilo.materie_insegnate}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#185FA5' }}>€ {profilo.tariffa_oraria?.toFixed(2)}/ora</p>
            </div>
          )}
        </div>

        {/* APPUNTI */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Appunti caricati ({appunti.length})</h2>
          {appunti.length === 0 && (
            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessun appunto caricato</p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {appunti.map(function(a) {
              return (
                <div key={a.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{a.titolo}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{a.materia}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#185FA5' }}>{a.prezzo > 0 ? '€ ' + a.prezzo.toFixed(2) : 'Gratis'}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* RECENSIONI */}
        {recensioni.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Recensioni ({recensioni.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recensioni.map(function(r) {
                return (
                  <div key={r.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ fontSize: 14, color: '#B45309', marginBottom: 6 }}>{renderStelle(r.voto)}</p>
                    {r.commento && <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{r.commento}</p>}
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
