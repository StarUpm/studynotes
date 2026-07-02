'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [tipoIstituto, setTipoIstituto] = useState('universita')
  const [universitaInput, setUniversitaInput] = useState('')
  const [annoStudio, setAnnoStudio] = useState('')
  const [vuoleDiventareTutor, setVuoleDiventareTutor] = useState(false)
  const [materiaInsegna, setMateriaInsegna] = useState('')
  const [tariffaOraria, setTariffaOraria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggerimentiUniversita, setSuggerimentiUniversita] = useState<string[]>([])
  const [suggerimentiMateria, setSuggerimentiMateria] = useState<string[]>([])
  const timerU = useRef<any>(null)
  const timerM = useRef<any>(null)
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

  async function cercaUniversita(v: string) {
    setUniversitaInput(v)
    if (v.length < 2) { setSuggerimentiUniversita([]); return }
    if (timerU.current) clearTimeout(timerU.current)
    timerU.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'universita' }) })
      const data = await res.json()
      setSuggerimentiUniversita(data.risultati || [])
    }, 400)
  }

  async function cercaMateria(v: string) {
    setMateriaInsegna(v)
    if (v.length < 2) { setSuggerimentiMateria([]); return }
    if (timerM.current) clearTimeout(timerM.current)
    timerM.current = setTimeout(async () => {
      const res = await fetch('/api/cerca-universita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: v, tipo: 'materia' }) })
      const data = await res.json()
      setSuggerimentiMateria(data.risultati || [])
    }, 400)
  }

  async function completa() {
    setLoading(true); setError('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) return
    const uid = userData.data.user.id
    const { error: err } = await supabase.from('profiles').update({
      nome, cognome, tipo_istituto: tipoIstituto, universita: universitaInput,
      anno_studio: annoStudio, is_tutor: vuoleDiventareTutor,
      materie_insegnate: vuoleDiventareTutor ? materiaInsegna : null,
      tariffa_oraria: vuoleDiventareTutor ? parseFloat(tariffaOraria) || 0 : null,
      onboarding_completato: true
    }).eq('id', uid)
    if (err) { setError('Errore: ' + err.message); setLoading(false); return }
    await fetch('/api/punti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: uid, azione: 'primo_accesso' }) })
    await fetch('/api/notifica', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: uid, tipo: 'acquisto', titolo: 'Benvenuto su Klass!', messaggio: 'Hai guadagnato 25 punti di benvenuto.', link: '/punti' }) })
    router.push('/dashboard')
    setLoading(false)
  }

  const progressoPercentuale = Math.round((step / TOTALE_STEP) * 100)
  const inputStyle = { width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'white' } as React.CSSProperties

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'var(--font-geist-sans, system-ui)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.6, color: '#18181B' }}>klass<span style={{ color: '#D85A30' }}>.</span></span>
          <p style={{ fontSize: 13, color: '#A1A1AA', margin: '8px 0 0' }}>Passo {step} di {TOTALE_STEP}</p>
        </div>

        <div style={{ background: '#F4F4F5', borderRadius: 20, height: 4, marginBottom: 32 }}>
          <div style={{ height: 4, borderRadius: 20, background: '#18181B', width: progressoPercentuale + '%', transition: 'width 0.4s' }} />
        </div>

        {error && <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#D85A30', margin: 0 }}>{error}</p></div>}

        {step === 1 && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.3 }}>Benvenuto su klass.</h2>
            <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 24px' }}>Iniziamo con qualche informazione su di te</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Nome</label>
                <input type="text" placeholder="Marco" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && nome && setStep(2)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Cognome</label>
                <input type="text" placeholder="Rossi" value={cognome} onChange={e => setCognome(e.target.value)} onKeyDown={e => e.key === 'Enter' && nome && setStep(2)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[{ id: 'universita', label: 'Università' }, { id: 'liceo', label: 'Scuola superiore' }].map(function(t) {
                return (
                  <button key={t.id} onClick={() => setTipoIstituto(t.id)} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: tipoIstituto === t.id ? '#18181B' : 'white', color: tipoIstituto === t.id ? 'white' : '#71717A', border: tipoIstituto === t.id ? 'none' : '0.5px solid #E4E4E7', fontWeight: tipoIstituto === t.id ? 500 : 400 }}>
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>{tipoIstituto === 'universita' ? 'Università' : 'Nome della scuola'}</label>
              <input type="text" placeholder={tipoIstituto === 'universita' ? 'Es. Università di Bologna' : 'Es. Liceo Scientifico Volta'} value={universitaInput} onChange={e => cercaUniversita(e.target.value)} style={inputStyle} />
              {suggerimentiUniversita.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  {suggerimentiUniversita.map(s => <button key={s} onClick={() => { setUniversitaInput(s); setSuggerimentiUniversita([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 13, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid #F4F4F5', cursor: 'pointer', color: '#18181B' }}>{s}</button>)}
                </div>
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Anno di corso</label>
              <input type="text" placeholder="Es. 2° anno Triennale" value={annoStudio} onChange={e => setAnnoStudio(e.target.value)} onKeyDown={e => e.key === 'Enter' && nome && setStep(2)} style={inputStyle} />
            </div>
            <button onClick={() => { if (!nome) { setError('Inserisci il tuo nome'); return }; setError(''); setStep(2) }} style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '13px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Continua
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.3 }}>Vuoi guadagnare?</h2>
            <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 24px' }}>Puoi guadagnare vendendo appunti o diventando tutor</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <button onClick={() => setVuoleDiventareTutor(false)} style={{ padding: '16px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer', border: !vuoleDiventareTutor ? '1.5px solid #18181B' : '0.5px solid #E4E4E7', background: !vuoleDiventareTutor ? '#FAFAFA' : 'white', textAlign: 'left' }}>
                <p style={{ fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>Solo studente</p>
                <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Compro appunti e prenoto ripetizioni. Posso diventare tutor dopo.</p>
              </button>
              <button onClick={() => setVuoleDiventareTutor(true)} style={{ padding: '16px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer', border: vuoleDiventareTutor ? '1.5px solid #18181B' : '0.5px solid #E4E4E7', background: vuoleDiventareTutor ? '#FAFAFA' : 'white', textAlign: 'left' }}>
                <p style={{ fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>Voglio anche fare il tutor</p>
                <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Offro ripetizioni online e guadagno aiutando altri studenti.</p>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: 'white', color: '#71717A', border: '0.5px solid #E4E4E7', padding: '12px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Indietro</button>
              <button onClick={() => vuoleDiventareTutor ? setStep(3) : completa()} disabled={loading} style={{ flex: 2, background: '#18181B', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Salvataggio...' : vuoleDiventareTutor ? 'Continua' : 'Inizia a usare klass.'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.3 }}>Setup profilo tutor</h2>
            <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 24px' }}>Dicci cosa insegni e quanto vuoi guadagnare</p>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Materia che insegni</label>
              <input type="text" placeholder="Es. Analisi Matematica" value={materiaInsegna} onChange={e => cercaMateria(e.target.value)} style={inputStyle} />
              {suggerimentiMateria.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  {suggerimentiMateria.map(s => <button key={s} onClick={() => { setMateriaInsegna(s); setSuggerimentiMateria([]) }} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 13, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid #F4F4F5', cursor: 'pointer', color: '#18181B' }}>{s}</button>)}
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Tariffa oraria (€)</label>
              <input type="number" step="0.50" placeholder="Es. 15.00" value={tariffaOraria} onChange={e => setTariffaOraria(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>La piattaforma trattiene il 20% — il restante 80% è tuo</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: 'white', color: '#71717A', border: '0.5px solid #E4E4E7', padding: '12px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Indietro</button>
              <button onClick={completa} disabled={loading} style={{ flex: 2, background: '#18181B', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Salvataggio...' : 'Inizia a usare klass.'}
              </button>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#A1A1AA', textAlign: 'center', marginTop: 20 }}>
          Puoi modificare tutto questo dal tuo profilo
        </p>
      </div>
    </div>
  )
}
