'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/app/components/Layout'

export default function PremiumSuccesso() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); router.push('/dashboard'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <Layout>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <i className="ti ti-crown" style={{ fontSize: 28, color: '#FAC775' }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 500, color: '#18181B', margin: '0 0 10px', letterSpacing: -0.5 }}>Benvenuto in Klass Premium!</h1>
        <p style={{ fontSize: 14, color: '#71717A', margin: '0 0 32px', lineHeight: 1.6 }}>
          Il tuo abbonamento è attivo — puoi usare tutte le funzionalità senza limiti.
        </p>

        <div style={{ background: '#18181B', borderRadius: 14, padding: 24, marginBottom: 32, textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: 'ti-folder', label: 'Appunti illimitati' },
              { icon: 'ti-brain', label: 'Quiz illimitati' },
              { icon: 'ti-cards', label: 'Flashcard illimitate' },
              { icon: 'ti-microphone', label: 'Trascrizioni illimitate' },
              { icon: 'ti-brand-youtube', label: 'YouTube illimitato' },
              { icon: 'ti-camera', label: 'Scansioni illimitate' },
              { icon: 'ti-file-text', label: 'Riassunti illimitati' },
              { icon: 'ti-crown', label: 'Badge Premium' },
            ].map(function(f) {
              return (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`ti ${f.icon}`} style={{ fontSize: 15, color: '#D85A30' }} />
                  <span style={{ fontSize: 12, color: '#D4D4D8' }}>{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 20 }}>
          Reindirizzamento in {countdown} secondi...
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'white', background: '#18181B', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 500 }}>
            Vai alla dashboard
          </Link>
          <Link href="/studia" style={{ fontSize: 13, color: '#18181B', border: '0.5px solid #E4E4E7', textDecoration: 'none', padding: '10px 20px', borderRadius: 8 }}>
            Inizia a studiare
          </Link>
        </div>
      </div>
    </Layout>
  )
}
