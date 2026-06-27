'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

export default function Premium() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [premiumAttivo, setPremiumAttivo] = useState(false)
  const [pianoPremium, setPianoPremium] = useState('')
  const [scadenza, setScadenza] = useState('')
  const [loading, setLoading] = useState(true)
  const [acquisto, setAcquisto] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) { router.push('/login'); return }
      setUserId(userData.data.user.id)
      setEmail(userData.data.user.email || '')

      const profilo = await supabase.from('profiles').select('piano_premium, premium_attivo, premium_scadenza').eq('id', userData.data.user.id).single()
      if (profilo.data) {
        setPremiumAttivo(profilo.data.premium_attivo || false)
        setPianoPremium(profilo.data.piano_premium || '')
        setScadenza(profilo.data.premium_scadenza || '')
      }
      setLoading(false)
    }
    init()
  }, [router])

  async function acquistaPiano(piano: string) {
    setAcquisto(piano)
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piano, userId, email })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Errore: ' + (data.error || 'sconosciuto'))
      }
    } catch (e) {
      alert('Errore di connessione')
    }
    setAcquisto('')
  }

  const piani = [
    {
      id: 'mensile',
      nome: 'Mensile',
      prezzo: '€ 9,99',
      periodo: '/mese',
      risparmio: null,
      colore: '#185FA5',
      popolare: false,
    },
    {
      id: 'trimestrale',
      nome: 'Trimestrale',
      prezzo: '€ 19,99',
      periodo: '/3 mesi',
      risparmio: 'Risparmia il 33%',
      colore: '#534AB7',
      popolare: true,
    },
    {
      id: 'annuale',
      nome: 'Annuale',
      prezzo: '€ 49,99',
      periodo: '/anno',
      risparmio: 'Risparmia il 58%',
      colore: '#0F6E56',
      popolare: false,
    },
  ]

  const featuresGratis = [
    'Carica fino a 5 appunti al mese',
    'Scarica fino a 8 appunti al mese',
    'Quiz e flashcard fino a 20 domande',
    '1 trascrizione audio al mese',
    '1 import YouTube al mese',
    '2 scansioni foto al mese',
    'Chat e forum illimitati',
    'Ripetizioni con tutor illimitate',
    'Sistema punti e livelli',
  ]

  const featuresPremium = [
    'Appunti illimitati da caricare e scaricare',
    'Quiz e flashcard illimitati (fino a 40 domande)',
    'Trascrizioni audio illimitate',
    'Import YouTube illimitato',
    'Scansioni foto illimitate',
    'Riassunti AI illimitati',
    'Badge Premium 👑 sul profilo',
    'Priorità nelle ricerche tutor',
    'Supporto DSA/ADHD avanzato',
    'Statistiche studio avanzate',
  ]

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: '#9CA3AF' }}>Caricamento...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

        {premiumAttivo ? (
          <div style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>Sei già Premium!</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
              Piano: <strong style={{ color: 'white' }}>{pianoPremium}</strong>
            </p>
            {scadenza && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Scadenza: {new Date(scadenza).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Klass Premium</h1>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
              Studia senza limiti — quiz, flashcard, trascrizioni e molto altro illimitati
            </p>
          </div>
        )}

        {!premiumAttivo && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
              {piani.map(function(p) {
                return (
                  <div key={p.id} style={{ background: 'white', border: p.popolare ? `2px solid ${p.colore}` : '0.5px solid #e5e7eb', borderRadius: 16, padding: 28, position: 'relative', textAlign: 'center' }}>
                    {p.popolare && (
                      <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: p.colore, color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        Più scelto
                      </div>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>{p.nome}</p>
                    <div style={{ fontSize: 36, fontWeight: 700, color: p.colore, marginBottom: 4 }}>{p.prezzo}</div>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>{p.periodo}</p>
                    {p.risparmio && (
                      <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 20 }}>{p.risparmio}</span>
                    )}
                    {!p.risparmio && <div style={{ height: 27, marginBottom: 20 }} />}
                    <button
                      onClick={() => acquistaPiano(p.id)}
                      disabled={acquisto === p.id}
                      style={{ width: '100%', background: p.popolare ? `linear-gradient(135deg,${p.colore},#7F77DD)` : 'white', color: p.popolare ? 'white' : p.colore, border: `1.5px solid ${p.colore}`, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: acquisto === p.id ? 0.7 : 1 }}
                    >
                      {acquisto === p.id ? 'Reindirizzamento...' : 'Scegli ' + p.nome}
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
              <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>🆓 Piano Gratuito</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {featuresGratis.map(function(f) {
                    return (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                        <span style={{ color: '#9CA3AF', fontSize: 16 }}>○</span>
                        {f}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', borderRadius: 16, padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 20 }}>👑 Piano Premium</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {featuresPremium.map(function(f) {
                    return (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'white' }}>
                        <span style={{ color: '#A7F3D0', fontSize: 16 }}>✓</span>
                        {f}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>✓ Cancella quando vuoi · ✓ Nessun costo nascosto · ✓ Pagamento sicuro con Stripe</p>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>Accettando l&apos;abbonamento accetti i nostri Termini e Condizioni</p>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
