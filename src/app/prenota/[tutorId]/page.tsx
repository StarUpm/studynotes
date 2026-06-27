'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function Prenota() {
  const [tutor, setTutor] = useState<any>(null)
  const [data, setData] = useState('')
  const [ora, setOra] = useState('')
  const [materia, setMateria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const tutorId = params.tutorId as string

  useEffect(() => {
    async function caricaTutor() {
      const result = await supabase.from('profiles').select('*').eq('id', tutorId).single()
      if (result.data) setTutor(result.data)
    }
    caricaTutor()
  }, [tutorId])

  async function confermaPrenotazione() {
    if (!data || !ora || !materia) { setError('Compila tutti i campi'); return }
    setLoading(true)
    setError('')
    const userData = await supabase.auth.getUser()
    if (!userData.data.user) { setError('Devi accedere prima'); setLoading(false); return }
    const uid = userData.data.user.id

    const result = await supabase.from('tutoring_sessions').insert({
      tutor_id: tutorId,
      studente_id: uid,
      materia,
      data_ora: data + 'T' + ora + ':00',
      durata_minuti: 60,
      prezzo: tutor ? tutor.tariffa_oraria : 0,
      stato: 'pending'
    })

    if (result.error) {
      setError('Errore: ' + result.error.message)
    } else {
      await fetch('/api/notifica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utente_id: tutorId,
          tipo: 'prenotazione',
          titolo: 'Nuova richiesta di sessione',
          messaggio: 'Hai una nuova richiesta per ' + materia + ' il ' + new Date(data).toLocaleDateString('it-IT'),
          link: '/sessioni'
        })
      })
      setSuccess(true)
      setTimeout(() => router.push('/sessioni'), 1500)
    }
    setLoading(false)
  }

  function nomeVisibile() {
    if (!tutor) return ''
    if (tutor.nome && tutor.cognome) return tutor.nome + ' ' + tutor.cognome
    if (tutor.nome) return tutor.nome
    return tutor.email
  }

  const inputStyle = { width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', marginBottom: 12, background: 'white' } as React.CSSProperties

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={() => router.push('/tutor')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>← Torna ai tutor</button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>📅 Prenota ripetizione</h1>
        {tutor && <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Con {nomeVisibile()} · € {tutor.tariffa_oraria?.toFixed(2)}/ora</p>}

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: 13, marginBottom: 16, background: '#ECFDF5', padding: '10px 14px', borderRadius: 8 }}>✓ Prenotazione inviata! Aspetta la conferma del tutor.</p>}

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Materia</p>
          <input type="text" placeholder="Es. Analisi Matematica" value={materia} onChange={e => setMateria(e.target.value)} style={inputStyle} />

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Data</p>
          <input type="date" value={data} onChange={e => setData(e.target.value)} style={inputStyle} />

          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Ora</p>
          <input type="time" value={ora} onChange={e => setOra(e.target.value)} style={inputStyle} />

          {tutor && (
            <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: '#185FA5' }}>💡 La sessione durerà 1 ora · Costo: € {tutor.tariffa_oraria?.toFixed(2)}</p>
            </div>
          )}

          <button
            onClick={confermaPrenotazione}
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Prenotazione in corso...' : 'Prenota sessione'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
