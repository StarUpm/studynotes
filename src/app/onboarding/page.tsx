'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { universita, materie } from '@/lib/dati-universita'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [tipoIstituto, setTipoIstituto] = useState('universita')
  const [universitaInput, setUniversitaInput] = useState('')
  const [annoStudio, setAnnoStudio] = useState('')
  const [materieInteresse, setMaterieInteresse] = useState<string[]>([])
  const [vuoleDiventareTutor, setVuoleDiventareTutor] = useState(false)
  const [materiaInsegna, setMateriaInsegna] = useState('')
  const [tariffaOraria, setTariffaOraria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggerimentiUniversita, setSuggerimentiUniversita] = useState<string[]>([])
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const router = useRouter()

  const TOTALE_STEP = vuoleDiventareTutor ? 4 : 3

  useEffect(() => {
    async function checkAuth() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      const profilo = await supabase.from('profiles').select('nome, onboarding_completato').eq('id', userData.data.user.id).single()
      if (profilo.data?.onboarding_completato) { router.push('/dashboard'); return }
      if (profilo.data?.nome) setNome(profilo.data.nome)
    }
    checkAuth()
  }, [router])

  function updateUniversita(v: string) {
    setUniversitaInput(v)
    setSuggerimentiUniversita(v.length > 0 ? universita.filter(u => u.toLowerCase().includes(v.toLowerCase())).slice(0, 5) : [])
  }

  function updateMateriaInsegna(v: string) {
    setMateriaInsegna(v)
    setSuggerimentiMateria(v.length > 0 ? materie.filter(m => m.toLowerCase().includes(v.toLowerCase())).slice(0, 5) : [])
  }

  function toggleMateria(m: string) {
    setMaterieInteresse(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function completa() {
    setLoading(true)
    setError('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    const uid = userData.data.user.id

    const { error: err } = await supabase.from('profiles').update({
      nome, cognome,
      tipo_istituto: tipoIstituto,
      universita: universitaInput,
      anno_studio: annoStudio,
      is_tutor: vuoleDiventareTutor,
      materie_insegnate: vuoleDiventareTutor ? materiaInsegna : null,
      tariffa_oraria: vuoleDiventareTutor ? parseFloat(tariffaOraria) || 0 : null,
      onboarding_completato: true
    }).eq('id', uid)

    if (err) { setError('Errore: ' + err.message); setLoading(false); return }

    await fetch('/api/punti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utente_id: uid, azione: 'primo_accesso' })
    })

    await fetch('/api/notifica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utente_id: uid,
        tipo: 'acquisto',
        titolo: 'Benvenuto su Klass! 🎉',
        messaggio: 'Hai guadagnato 25 punti di benvenuto. Inizia a caricare appunti per guadagnarne altri!',
        link: '/punti'
      })
    })

    router.push('/dashboard')
    setLoading(false)
  }

  const progressoPercentuale = Math.round((step / TOTALE_STEP) * 100)

  const materiePopolar = ['Analisi Matematica', 'Diritto Privato', 'Economia Aziendale', 'Fisica', 'Chimica', 'Storia', 'Letteratura Italiana', 'Diritto Pubblico', 'Statistica', 'Informatica', 'Biologia', 'Filosofia']

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{ width: '100%', maxWidth: 560 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>Klass</div>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Passo {step} di {TOTALE_STEP}</p>
        </div>

        <div style={{ background: '#e5e7eb', borderRadius: 20, height: 6, marginBottom: 32 }}>
          <div style={{ height: 6, borderRadius: 20, background: 'linear-gradient(90deg,#185FA5,#7F77DD)', width: progressoPercentuale + '%', transition: 'width 0.4s' }} />
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}

        {/* STEP 1 — Chi sei */}
        {step === 1 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>👋</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>Benvenuto su Klass!</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>Iniziamo con qualche informazione su di te</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nome</p>
                <input type="text" placeholder="Marco" value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Cognome</p>
                <input type="text" placeholder="Rossi" value={cognome} onChange={e => setCognome(e.target.value)} style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }} />
              </div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Tipo di istituto</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'universita', label: '🎓 Università' },
                { id: 'liceo', label: '🏫 Scuola superiore' },
              ].map(function(t) {
                return (
                  <button key={t.id} onClick={() => setTipoIstituto(t.id)} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, cursor: 'pointer', border: tipoIstituto === t.id ? 'none' : '0.5px solid #e5e7eb', background: tipoIstituto === t.id ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: tipoIstituto === t.id ? 'white' : '#374151', fontWeight: tipoIstituto === t.id ? 600 : 400 }}>
                    {t.label}
                  </button>
                )
              })}
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {tipoIstituto === 'universita' ? 'Università' : 'Nome della scuola'}
            </p>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input type="text" placeholder={tipoIstituto === 'universita' ? 'Es. Università di Bologna' : 'Es. Liceo Scientifico Volta'} value={universitaInput} onChange={e => updateUniversita(e.target.value)} style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }} />
              {suggerimentiUniversita.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {suggerimentiUniversita.map(s => (
                    <button key={s} onClick={() => { setUniversitaInput(s); setSuggerimentiUniversita([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                  ))}
                </div>
              )}
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Anno di corso</p>
            <input type="text" placeholder="Es. 2° anno Triennale" value={annoStudio} onChange={e => setAnnoStudio(e.target.value)} style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white', marginBottom: 24 }} />

            <button onClick={() => { if (!nome) { setError('Inserisci il tuo nome'); return }; setError(''); setStep(2) }} style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Continua →
            </button>
          </div>
        )}

        {/* STEP 2 — Materie interesse */}
        {step === 2 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>📚</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>Le tue materie</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>Seleziona le materie che studi — ti mostreremo appunti e tutor pertinenti</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {materiePopolar.map(function(m) {
                const sel = materieInteresse.includes(m)
                return (
                  <button key={m} onClick={() => toggleMateria(m)} style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: sel ? 'none' : '0.5px solid #e5e7eb', background: sel ? 'linear-gradient(135deg,#185FA5,#7F77DD)' : 'white', color: sel ? 'white' : '#374151', fontWeight: sel ? 600 : 400 }}>
                    {m}
                  </button>
                )
              })}
            </div>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 24, textAlign: 'center' }}>
              {materieInteresse.length === 0 ? 'Seleziona almeno una materia' : materieInteresse.length + ' materie selezionate'}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: 14, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                ← Indietro
              </button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Continua →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Vuoi diventare tutor? */}
        {step === 3 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>💰</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>Vuoi guadagnare?</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>Puoi guadagnare vendendo appunti o diventando tutor</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              <button onClick={() => setVuoleDiventareTutor(false)} style={{ padding: '16px 20px', borderRadius: 12, fontSize: 14, cursor: 'pointer', border: !vuoleDiventareTutor ? '2px solid #185FA5' : '0.5px solid #e5e7eb', background: !vuoleDiventareTutor ? '#EFF6FF' : 'white', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: !vuoleDiventareTutor ? '#185FA5' : '#111827', marginBottom: 4 }}>📝 Solo studente</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Compro appunti e prenoto ripetizioni. Posso sempre diventare tutor dopo.</div>
              </button>
              <button onClick={() => setVuoleDiventareTutor(true)} style={{ padding: '16px 20px', borderRadius: 12, fontSize: 14, cursor: 'pointer', border: vuoleDiventareTutor ? '2px solid #185FA5' : '0.5px solid #e5e7eb', background: vuoleDiventareTutor ? '#EFF6FF' : 'white', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: vuoleDiventareTutor ? '#185FA5' : '#111827', marginBottom: 4 }}>👨‍🏫 Voglio anche fare il tutor</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Offro ripetizioni online e guadagno aiutando altri studenti.</div>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: 14, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                ← Indietro
              </button>
              <button onClick={() => vuoleDiventareTutor ? setStep(4) : completa()} disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Salvataggio...' : vuoleDiventareTutor ? 'Continua →' : 'Inizia a usare Klass! 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Setup tutor */}
        {step === 4 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>👨‍🏫</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>Setup profilo tutor</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>Dicci cosa insegni e quanto vuoi guadagnare</p>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Materia che insegni</p>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input type="text" placeholder="Es. Analisi Matematica" value={materiaInsegna} onChange={e => updateMateriaInsegna(e.target.value)} style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }} />
              {suggerimentiMateria.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {suggerimentiMateria.map(s => (
                    <button key={s} onClick={() => { setMateriaInsegna(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>{s}</button>
                  ))}
                </div>
              )}
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tariffa oraria (€)</p>
            <input type="number" step="0.50" placeholder="Es. 15.00" value={tariffaOraria} onChange={e => setTariffaOraria(e.target.value)} style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white', marginBottom: 16 }} />

            <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#059669' }}>💡 La piattaforma trattiene il 20% — il restante 80% è tuo!</p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: 14, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                ← Indietro
              </button>
              <button onClick={completa} disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Salvataggio...' : 'Inizia a usare Klass! 🚀'}
              </button>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 20 }}>
          Puoi modificare tutto questo in qualsiasi momento dal tuo profilo
        </p>
      </div>
    </div>
  )
}
