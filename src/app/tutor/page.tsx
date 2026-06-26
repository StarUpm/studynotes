'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { materie } from '@/lib/dati-universita'
import Layout from '@/app/components/Layout'

type Tutor = {
  id: string
  nome: string
  cognome: string
  email: string
  materie_insegnate: string
  tariffa_oraria: number
  votoMedio: number
  numeroRecensioni: number
}

export default function Tutor() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [suggerimenti, setSuggerimenti] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchTutors() {
      const result = await supabase.from('profiles').select('*').eq('is_tutor', true)
      const recensioniResult = await supabase.from('reviews').select('*')

      if (result.data) {
        const tutorsConVoti = result.data.map(function (t) {
          const recensioniTutor = recensioniResult.data ? recensioniResult.data.filter(r => r.destinatario_id === t.id) : []
          const numeroRecensioni = recensioniTutor.length
          const votoMedio = numeroRecensioni > 0
            ? recensioniTutor.reduce((acc, r) => acc + r.voto, 0) / numeroRecensioni
            : 0
          return { ...t, votoMedio, numeroRecensioni }
        })
        setTutors(tutorsConVoti)
      }
      setLoading(false)
    }
    fetchTutors()
  }, [])

  const filteredTutors = tutors
    .filter(t => {
      if (search.length === 0) return true
      return (t.materie_insegnate || '').toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => b.votoMedio - a.votoMedio)
    .slice(0, 10)

  function updateSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setSearch(v)
    setSuggerimenti(v.length > 0 ? materie.filter(m => m.toLowerCase().includes(v.toLowerCase())).slice(0, 6) : [])
  }

  function nomeVisibile(t: Tutor) {
    if (t.nome && t.cognome) return t.nome + ' ' + t.cognome
    if (t.nome) return t.nome
    return t.email
  }

  function renderStelle(voto: number) {
    return [1,2,3,4,5].map(i => i <= Math.round(voto) ? '★' : '☆').join('')
  }

  function iniziali(t: Tutor) {
    if (t.nome && t.cognome) return t.nome[0] + t.cognome[0]
    if (t.nome) return t.nome[0]
    return t.email[0].toUpperCase()
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Trova un tutor</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>I migliori tutor per la materia che cerchi</p>

        <div style={{ position: 'relative', marginBottom: 32, maxWidth: 480 }}>
          <input
            type="text"
            placeholder="Cerca per materia..."
            value={search}
            onChange={updateSearch}
            style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }}
          />
          {suggerimenti.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {suggerimenti.map(s => (
                <button key={s} onClick={() => { setSearch(s); setSuggerimenti([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {loading && <p style={{ color: '#9CA3AF' }}>Caricamento...</p>}
        {!loading && filteredTutors.length === 0 && <p style={{ color: '#9CA3AF' }}>Nessun tutor trovato per questa materia</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filteredTutors.map(function (t) {
            return (
              <div key={t.id} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', padding: '2px 8px', borderRadius: 20 }}>Top tutor</span>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', margin: '0 auto 10px' }}>
                  {iniziali(t)}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{nomeVisibile(t)}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{t.materie_insegnate}</div>
                <div style={{ color: '#B45309', fontSize: 14, marginBottom: 4 }}>{renderStelle(t.votoMedio)}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>
                  {t.votoMedio > 0 ? t.votoMedio.toFixed(1) : '—'}/5 · {t.numeroRecensioni} recensioni
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#185FA5', marginBottom: 14 }}>
                  € {t.tariffa_oraria?.toFixed(2)}/ora
                </div>
                <button
                  onClick={() => router.push('/prenota/' + t.id)}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 8 }}
                >
                  Prenota
                </button>
                <button
                  onClick={() => router.push('/recensione-tutor/' + t.id)}
                  style={{ width: '100%', background: 'white', color: '#6B7280', border: '0.5px solid #e5e7eb', padding: '8px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                >
                  Lascia una recensione
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
