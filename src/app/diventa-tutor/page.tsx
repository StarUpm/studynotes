'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function DiventaTutor() {
  const [materia, setMateria] = useState('')
  const [tariffa, setTariffa] = useState('')
  const [bio, setBio] = useState('')
  const [isTutor, setIsTutor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [success, setSuccess] = useState(false)
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const timerM = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const profilo = await supabase.from('profiles').select('is_tutor, materie_insegnate, tariffa_oraria, bio').eq('id', userData.data.user.id).single()
      if (profilo.data) {
        setIsTutor(profilo.data.is_tutor || false)
        setMateria(profilo.data.materie_insegnate || '')
        setTariffa(profilo.data.tariffa_oraria?.toString() || '')
        setBio(profilo.data.bio || '')
      }
      setLoading(false)
    }
    init()
  }, [router])

  async function cercaMateria(v: string) {
    setMateria(v)
    if (v.length < 2) { setSuggerimentiMateria([]); return }
    if (timerM.current) clearTimeout(timerM.current)
    timerM.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'materia' }) })
      const data = await res.json()
      setSuggerimentiMateria(data.risultati || [])
    }, 400)
  }

  async function salva() {
    setSalvando(true)
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    await supabase.from('profiles').update({ is_tutor: true, materie_insegnate: materia, tariffa_oraria: parseFloat(tariffa) || 0, bio }).eq('id', userData.data.user.id)
    setIsTutor(true)
    setSuccess(true)
    setTimeout(() => router.push('/profilo-utente'), 2000)
    setSalvando(false)
  }

  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>
          {isTutor ? 'Modifica profilo tutor' : 'Diventa tutor'}
        </h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 32px' }}>
          {isTutor ? 'Aggiorna le tue informazioni' : 'Offri ripetizioni online e guadagna aiutando altri studenti'}
        </p>

        {success && (
          <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#15803D', margin: 0 }}>Profilo tutor attivato! Reindirizzamento...</p>
          </div>
        )}

        {!isTutor && (
          <div style={{ background: '#18181B', borderRadius: 14, padding: 24, marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '0 0 14px' }}>Come funziona</p>
            <div style={{ borderTop: '0.5px solid #3F3F46' }}>
              {[
                { icon: 'ti-user', label: 'Crea il tuo profilo tutor', desc: 'Scegli la materia e la tariffa oraria' },
                { icon: 'ti-calendar', label: 'Imposta la disponibilità', desc: 'Indica quando sei disponibile' },
                { icon: 'ti-video', label: 'Tieni le sessioni online', desc: 'Videochiamate integrate nella piattaforma' },
                { icon: 'ti-coin', label: 'Guadagna l\'80%', desc: 'Klass trattiene solo il 20% di commissione' },
              ].map(function(item) {
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '0.5px solid #3F3F46' }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: '#D85A30', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, color: 'white', margin: '0 0 1px' }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Materia che insegni</label>
            <input type="text" placeholder="Es. Analisi Matematica" value={materia} onChange={e => cercaMateria(e.target.value)} style={inputStyle} />
            {suggerimentiMateria.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                {suggerimentiMateria.map(s => (
                  <button key={s} onClick={() => { setMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid #F4F4F5', cursor: 'pointer', color: '#18181B' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Tariffa oraria (€)</label>
            <input type="number" step="0.50" placeholder="Es. 15.00" value={tariffa} onChange={e => setTariffa(e.target.value)} style={inputStyle} />
            <p style={{ fontSize: 11, color: '#A1A1AA', margin: '4px 0 0' }}>Guadagnerai l&apos;80% — Klass trattiene il 20%</p>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Descrizione (opzionale)</label>
            <textarea placeholder="Descriviti brevemente — studi, esperienze, approccio didattico..." value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <button onClick={salva} disabled={salvando || !materia || !tariffa} style={{ background: '#18181B', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (salvando || !materia || !tariffa) ? 0.6 : 1 }}>
            {salvando ? 'Salvataggio...' : isTutor ? 'Salva modifiche' : 'Attiva profilo tutor'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
