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
      const res = await fetch('/api/create-subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ piano, userId, email }) })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { alert('Errore: ' + (data.error || 'sconosciuto')) }
    } catch (e) { alert('Errore di connessione') }
    setAcquisto('')
  }

  const piani = [
    { id: 'mensile', nome: 'Mensile', prezzo: '€ 9,99', periodo: '/mese', risparmio: null, popolare: false },
    { id: 'trimestrale', nome: 'Trimestrale', prezzo: '€ 19,99', periodo: '/3 mesi', risparmio: 'Risparmi il 33%', popolare: true },
    { id: 'annuale', nome: 'Annuale', prezzo: '€ 49,99', periodo: '/anno', risparmio: 'Risparmi il 58%', popolare: false },
  ]

  const featuresGratis = [
    '5 appunti al mese da caricare',
    '8 download al mese',
    'Quiz fino a 20 domande',
    '1 trascrizione audio al mese',
    '1 import YouTube al mese',
    '2 scansioni foto al mese',
    'Chat e forum illimitati',
    'Ripetizioni con tutor illimitate',
  ]

  const featuresPremium = [
    'Appunti illimitati da caricare e scaricare',
    'Quiz e flashcard illimitati (40 domande)',
    'Trascrizioni audio illimitate',
    'Import YouTube illimitato',
    'Scansioni foto illimitate',
    'Riassunti AI illimitati',
    'Badge Premium sul profilo',
    'Priorità nelle ricerche tutor',
    'Modalità studio personalizzata avanzata',
  ]

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 32px' }}>

        {premiumAttivo ? (
          <div style={{ background: '#18181B', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 32 }}>
            <i className="ti ti-crown" style={{ fontSize: 36, color: '#FAC775', display: 'block', marginBottom: 12 }} />
            <h1 style={{ fontSize: 22, fontWeight: 500, color: 'white', margin: '0 0 6px' }}>Sei già Premium</h1>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: '0 0 4px' }}>Piano: <span style={{ color: 'white' }}>{pianoPremium}</span></p>
            {scadenza && <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Scadenza: {new Date(scadenza).toLocaleDateString('it-IT')}</p>}
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <i className="ti ti-crown" style={{ fontSize: 32, color: '#FAC775', display: 'block', marginBottom: 12 }} />
              <h1 style={{ fontSize: 28, fontWeight: 500, color: '#18181B', margin: '0 0 8px', letterSpacing: -0.5 }}>Klass Premium</h1>
              <p style={{ fontSize: 14, color: '#71717A', margin: 0 }}>Studia senza limiti</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 40 }}>
              {piani.map(function(p) {
                return (
                  <div key={p.id} style={{ background: 'white', border: p.popolare ? '1.5px solid #18181B' : '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, position: 'relative', textAlign: 'center' }}>
                    {p.popolare && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#18181B', color: 'white', fontSize: 10, fontWeight: 500, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        Più scelto
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 8px' }}>{p.nome}</p>
                    <p style={{ fontSize: 32, fontWeight: 500, color: '#18181B', margin: '0 0 2px', letterSpacing: -0.5 }}>{p.prezzo}</p>
                    <p style={{ fontSize: 12, color: '#A1A1AA', margin: '0 0 8px' }}>{p.periodo}</p>
                    {p.risparmio && <span style={{ fontSize: 11, background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 16 }}>{p.risparmio}</span>}
                    {!p.risparmio && <div style={{ height: 24, marginBottom: 16 }} />}
                    <button
                      onClick={() => acquistaPiano(p.id)}
                      disabled={acquisto === p.id}
                      style={{ width: '100%', background: p.popolare ? '#18181B' : 'white', color: p.popolare ? 'white' : '#18181B', border: '1px solid #18181B', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: acquisto === p.id ? 0.7 : 1 }}
                    >
                      {acquisto === p.id ? 'Reindirizzamento...' : 'Scegli ' + p.nome}
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 14, padding: 22 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#18181B', margin: '0 0 16px' }}>Piano Gratuito</p>
                <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
                  {featuresGratis.map(function(f) {
                    return (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                        <i className="ti ti-circle" style={{ fontSize: 12, color: '#D4D4D8' }} />
                        <span style={{ fontSize: 12, color: '#71717A' }}>{f}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={{ background: '#18181B', borderRadius: 14, padding: 22 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '0 0 16px' }}>Piano Premium</p>
                <div style={{ borderTop: '0.5px solid #3F3F46' }}>
                  {featuresPremium.map(function(f) {
                    return (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '0.5px solid #3F3F46' }}>
                        <i className="ti ti-check" style={{ fontSize: 12, color: '#D85A30' }} />
                        <span style={{ fontSize: 12, color: '#D4D4D8' }}>{f}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>Cancella quando vuoi · Nessun costo nascosto · Pagamento sicuro con Stripe</p>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
