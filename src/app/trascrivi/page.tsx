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
  const [cercandoMateria, setCercandoMateria] = useState(false)
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
    const result = await supabase
      .from('trascrizioni')
      .select('*')
      .eq('utente_id', uid)
      .order('created_at', { ascending: false })
    if (result.data) setTrascrizioni(result.data)
  }

  async function cercaMateria(v: string) {
    setMateria(v)
    if (v.length < 2) { setSuggerimentiMateria([]); return }
    setCercandoMateria(true)
    if (timerM.current) clearTimeout(timerM.current)
    timerM.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/cerca-universita', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: v, tipo: 'materia' })
        })
        const data = await res.json()
        setSuggerimentiMateria(data.risultati || [])
      } catch (e) { setSuggerimentiMateria([]) }
      setCercandoMateria(false)
    }, 400)
  }

  async function trascrivi() {
    if (!file) { setError('Seleziona un file audio'); return }
    if (!titolo) { setError('Inserisci un titolo'); return }
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('utente_id', userId)
      formData.append('titolo', titolo)
      formData.append('materia', materia)

      const response = await fetch('/api/trascrivi', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.ok) {
        await caricaTrascrizioni(userId)
        setFile(null)
        setTitolo('')
        setMateria('')
        const nuova = trascrizioni.find(t => t.id === data.id)
        if (nuova) setTrscrizioneAttiva(nuova)
        await fetch('/api/punti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utente_id: userId, azione: 'schema_generato' })
        })
      } else {
        setError(data.error || 'Errore nella trascrizione')
      }
    } catch (e) {
      setError('Errore di connessione')
    }
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

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🎙️ Trascrivi lezioni</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Carica la registrazione di una lezione — l&apos;AI la trascrive automaticamente</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Nuova trascrizione</h2>

              {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Titolo</p>
              <input
                type="text"
                placeholder="Es. Lezione di Analisi — Integrali"
                value={titolo}
                onChange={e => setTitolo(e.target.value)}
                style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 14, background: 'white' }}
              />

              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Materia (opzionale)</p>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  type="text"
                  placeholder="Es. Analisi Matematica"
                  value={materia}
                  onChange={e => cercaMateria(e.target.value)}
                  style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }}
                />
                {cercandoMateria && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Ricerca in corso...</p>}
                {suggerimentiMateria.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    {suggerimentiMateria.map(s => (
                      <button key={s} onClick={() => { setMateria(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>File audio</p>
              <div style={{ border: '1px dashed #e5e7eb', borderRadius: 12, padding: 20, background: '#f9fafb', textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>MP3, WAV, M4A, OGG</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Massimo 25MB</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  style={{ fontSize: 13 }}
                />
                {file && <p style={{ fontSize: 12, color: '#059669', marginTop: 8 }}>✓ {file.name}</p>}
              </div>

              <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#185FA5', lineHeight: 1.6 }}>
                  💡 L&apos;AI trascriverà automaticamente la tua lezione. Potrai poi usare il testo per generare quiz, flashcard e schemi!
                </p>
              </div>

              <button
                onClick={trascrivi}
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Trascrizione in corso...' : '🎙️ Trascrivi lezione'}
              </button>
            </div>

            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Le mie trascrizioni</h3>
              {trascrizioni.length === 0 && (
                <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Nessuna trascrizione ancora</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trascrizioni.map(function(t) {
                  const attiva = trascrizioneAttiva?.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTrscrizioneAttiva(t)}
                      style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: attiva ? '1.5px solid #185FA5' : '0.5px solid #e5e7eb', background: attiva ? '#EFF6FF' : 'white', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: attiva ? '#185FA5' : '#111827', marginBottom: 2 }}>{t.titolo}</p>
                          {t.materia && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{t.materia}</p>}
                          <p style={{ fontSize: 11, color: '#9CA3AF' }}>{tempoFa(t.created_at)}</p>
                        </div>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: t.stato === 'completata' ? '#ECFDF5' : t.stato === 'errore' ? '#FEF2F2' : '#FFFBEB',
                          color: t.stato === 'completata' ? '#059669' : t.stato === 'errore' ? '#DC2626' : '#B45309'
                        }}>
                          {t.stato === 'completata' ? '✓ Completata' : t.stato === 'errore' ? '✗ Errore' : '⏳ In corso'}
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
              <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24, position: 'sticky', top: 80 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{trascrizioneAttiva.titolo}</h3>
                    {trascrizioneAttiva.materia && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{trascrizioneAttiva.materia}</p>}
                  </div>
                  <button
                    onClick={() => setTrscrizioneAttiva(null)}
                    style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    ✕
                  </button>
                </div>

                {trascrizioneAttiva.stato === 'completata' && trascrizioneAttiva.testo_trascritto ? (
                  <>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {trascrizioneAttiva.testo_trascritto}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        onClick={() => usaPerStudiare(trascrizioneAttiva.testo_trascritto)}
                        style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        🤖 Usa per studiare con AI
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(trascrizioneAttiva.testo_trascritto)}
                        style={{ width: '100%', background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                      >
                        📋 Copia testo
                      </button>
                    </div>
                  </>
                ) : trascrizioneAttiva.stato === 'errore' ? (
                  <div style={{ background: '#FEF2F2', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#DC2626' }}>Errore nella trascrizione. Riprova con un altro file.</p>
                  </div>
                ) : (
                  <div style={{ background: '#FFFBEB', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#B45309' }}>⏳ Trascrizione in corso...</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 40, textAlign: 'center', position: 'sticky', top: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Trascrivi le tue lezioni</h3>
                <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 20 }}>
                  Carica una registrazione audio e l&apos;AI la convertirà in testo che potrai usare per studiare
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
