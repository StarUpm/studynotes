'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Trascrizione = {
  id: string
  titolo: string
  materia: string
  testo_trascritto: string
  stato: string
  created_at: string
}

export default function Trascrivi() {
  const [file, setFile] = useState<File | null>(null)
  const [titolo, setTitolo] = useState('')
  const [materia, setMateria] = useState('')
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trascrizioni, setTrascrizioni] = useState<Trascrizione[]>([])
  const [trascrizioneAttiva, setTrscrizioneAttiva] = useState<Trascrizione | null>(null)
  const [userId, setUserId] = useState('')
  const timerM = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      await caricaTrascrizioni(userData.data.user.id)
    }
    init()
  }, [router])

  async function caricaTrascrizioni(uid: string) {
    const result = await supabase.from('trascrizioni').select('*').eq('utente_id', uid).order('created_at', { ascending: false })
    if (result.data) setTrascrizioni(result.data)
  }

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

  async function trascrivi() {
    if (!file) { setError('Seleziona un file audio'); return }
    if (!titolo) { setError('Inserisci un titolo'); return }
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('utente_id', userId)
      formData.append('titolo', titolo)
      formData.append('materia', materia)
      const response = await fetch('/api/trascrivi', { method: 'POST', body: formData })
      const data = await response.json()
      if (data.ok) {
        await caricaTrascrizioni(userId)
        setFile(null); setTitolo(''); setMateria('')
      } else { setError(data.error || 'Errore nella trascrizione') }
    } catch (e) { setError('Errore di connessione') }
    setLoading(false)
  }

  function usaPerStudiare(testo: string) {
    sessionStorage.setItem('klass_testo_importato', testo)
    router.push('/studia')
  }

  function tempoFa(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const ore = Math.floor(diff / 3600000)
    if (ore < 1) return 'Poco fa'
    if (ore < 24) return ore + ' ore fa'
    return Math.floor(ore / 24) + ' giorni fa'
  }

  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Trascrivi lezioni</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 32px' }}>Carica una registrazione audio — l&apos;AI la trascrive automaticamente</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 18px' }}>Nuova trascrizione</h2>
              {error && <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}><p style={{ fontSize: 12, color: '#D85A30', margin: 0 }}>{error}</p></div>}

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Titolo</label>
                <input type="text" placeholder="Es. Lezione di Analisi — Integrali" value={titolo} onChange={e => setTitolo(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ position: 'relative', marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Materia (opzionale)</label>
                <input type="text" placeholder="Es. Analisi Matematica" value={materia} onChange={e => cercaMateria(e.target.value)} style={inputStyle} />
                {suggerimentiMateria.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    {suggerimentiMateria.map(s => <button key={s} onClick={() => { setMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#18181B', borderBottom: '0.5px solid #F4F4F5' }}>{s}</button>)}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>File audio</label>
                <div style={{ border: '0.5px dashed #E4E4E7', borderRadius: 10, padding: '20px', textAlign: 'center', background: '#FAFAFA' }}>
                  <i className="ti ti-microphone" style={{ fontSize: 28, color: '#D4D4D8', display: 'block', marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 8px' }}>MP3, WAV, M4A, OGG · max 25MB</p>
                  <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 12 }} />
                  {file && <p style={{ fontSize: 12, color: '#15803D', marginTop: 8 }}>✓ {file.name}</p>}
                </div>
              </div>

              <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#185FA5', margin: 0, lineHeight: 1.5 }}>
                  L&apos;AI trascriverà la lezione — poi potrai usarla per generare quiz e flashcard
                </p>
              </div>

              <button onClick={trascrivi} disabled={loading} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Trascrizione in corso...' : 'Trascrivi lezione'}
              </button>
            </div>

            <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 14px' }}>Le mie trascrizioni</h3>
              {trascrizioni.length === 0 && <p style={{ fontSize: 13, color: '#A1A1AA' }}>Nessuna trascrizione ancora</p>}
              <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
                {trascrizioni.map(function(t) {
                  const attiva = trascrizioneAttiva?.id === t.id
                  return (
                    <button key={t.id} onClick={() => setTrscrizioneAttiva(t)} style={{ width: '100%', textAlign: 'left', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid #F4F4F5', background: 'none', cursor: 'pointer' }}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: attiva ? 500 : 400, color: attiva ? '#D85A30' : '#18181B', margin: '0 0 2px' }}>{t.titolo}</p>
                          {t.materia && <p style={{ fontSize: 11, color: '#A1A1AA', margin: '0 0 2px' }}>{t.materia}</p>}
                          <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{tempoFa(t.created_at)}</p>
                        </div>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: t.stato === 'completata' ? '#F0FDF4' : t.stato === 'errore' ? '#FEF2F2' : '#FFFBEB', color: t.stato === 'completata' ? '#15803D' : t.stato === 'errore' ? '#DC2626' : '#B45309' }}>
                          {t.stato === 'completata' ? 'Completata' : t.stato === 'errore' ? 'Errore' : 'In corso'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            {trascrizioneAttiva ? (
              <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, position: 'sticky', top: 72 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>{trascrizioneAttiva.titolo}</h3>
                    {trascrizioneAttiva.materia && <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>{trascrizioneAttiva.materia}</p>}
                  </div>
                  <button onClick={() => setTrscrizioneAttiva(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <i className="ti ti-x" style={{ fontSize: 16, color: '#A1A1AA' }} />
                  </button>
                </div>
                {trascrizioneAttiva.stato === 'completata' && trascrizioneAttiva.testo_trascritto ? (
                  <>
                    <div style={{ background: '#FAFAFA', borderRadius: 8, padding: 14, maxHeight: 380, overflowY: 'auto', marginBottom: 14 }}>
                      <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{trascrizioneAttiva.testo_trascritto}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={() => usaPerStudiare(trascrizioneAttiva.testo_trascritto)} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                        Usa per studiare con AI
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(trascrizioneAttiva.testo_trascritto)} style={{ width: '100%', background: 'white', color: '#18181B', border: '0.5px solid #E4E4E7', padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                        Copia testo
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ background: '#FAFAFA', borderRadius: 8, padding: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>{trascrizioneAttiva.stato === 'errore' ? 'Errore nella trascrizione' : 'Trascrizione in corso...'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 14, padding: 40, textAlign: 'center', position: 'sticky', top: 72 }}>
                <i className="ti ti-microphone" style={{ fontSize: 36, color: '#D4D4D8', display: 'block', marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 6px' }}>Trascrivi le tue lezioni</p>
                <p style={{ fontSize: 12, color: '#A1A1AA', lineHeight: 1.6, margin: 0 }}>Carica un file audio e l&apos;AI lo convertirà in testo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
