'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Tutor = {
  id: string
  nome: string
  cognome: string
  universita: string
  materie_insegnate: string
  tariffa_oraria: number
  curriculum: string
  avatar_url: string
  recensioni?: number
  votoMedio?: number
}

export default function Tutor() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroMateria, setFiltroMateria] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const result = await supabase.from('profiles').select('*').eq('is_tutor', true).order('created_at', { ascending: false })
      if (result.data) {
        const tutorsConRecensioni = await Promise.all(result.data.map(async function(t) {
          const recensioni = await supabase.from('reviews').select('voto').eq('destinatario_id', t.id)
          const voti = recensioni.data?.map(r => r.voto) || []
          return { ...t, recensioni: voti.length, votoMedio: voti.length > 0 ? voti.reduce((a, b) => a + b, 0) / voti.length : 0 }
        }))
        setTutors(tutorsConRecensioni)
      }
      setLoading(false)
    }
    init()
  }, [router])

  const tutorsFiltrati = tutors.filter(function(t) {
    const s = search.toLowerCase()
    return (!s || t.nome?.toLowerCase().includes(s) || t.cognome?.toLowerCase().includes(s) || t.materie_insegnate?.toLowerCase().includes(s)) &&
      (!filtroMateria || t.materie_insegnate?.toLowerCase().includes(filtroMateria.toLowerCase()))
  })

  const inputStyle = { border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Trova un tutor</h1>
          <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Prenota ripetizioni online con studenti esperti</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input type="text" placeholder="Cerca per nome o materia..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <input type="text" placeholder="Filtra per materia" value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} style={{ ...inputStyle, width: 180 }} />
        </div>

        {loading && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Caricamento...</p>}

        {!loading && tutorsFiltrati.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="ti ti-user-off" style={{ fontSize: 36, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: '0 0 4px' }}>Nessun tutor trovato</p>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Prova a modificare i filtri</p>
          </div>
        )}

        <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
          {tutorsFiltrati.map(function(t) {
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt="Avatar" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #E4E4E7' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F4B860', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: '#412402' }}>
                      {t.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>{t.nome} {t.cognome}</p>
                    <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 4px' }}>{t.materie_insegnate}{t.universita ? ' · ' + t.universita : ''}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {(t.votoMedio || 0) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <i className="ti ti-star-filled" style={{ fontSize: 11, color: '#FAC775' }} />
                          <span style={{ fontSize: 11, color: '#71717A' }}>{t.votoMedio?.toFixed(1)} ({t.recensioni})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: 0 }}>€ {t.tariffa_oraria}/h</p>
                  </div>
                  <button onClick={() => router.push('/prenota/' + t.id)} style={{ fontSize: 13, background: '#18181B', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
                    Prenota
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
