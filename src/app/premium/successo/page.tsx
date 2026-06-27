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
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>👑</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          Benvenuto in Klass Premium!
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>
          Il tuo abbonamento è attivo — puoi ora usare tutte le funzionalità senza limiti!
        </p>

        <div style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[
              { icon: '📚', label: 'Appunti illimitati' },
              { icon: '🧠', label: 'Quiz illimitati' },
              { icon: '🃏', label: 'Flashcard illimitate' },
              { icon: '🎙️', label: 'Trascrizioni illimitate' },
              { icon: '▶️', label: 'YouTube illimitato' },
              { icon: '📷', label: 'Scansioni illimitate' },
              { icon: '📝', label: 'Riassunti illimitati' },
              { icon: '👑', label: 'Badge Premium' },
            ].map(function(f) {
              return (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: 'white' }}>{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
          Reindirizzamento alla dashboard tra {countdown} secondi...
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Vai alla dashboard →
          </Link>
          <Link href="/studia" style={{ background: 'white', color: '#185FA5', border: '0.5px solid #185FA5', padding: '12px 24px', borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
            Inizia a studiare
          </Link>
        </div>
      </div>
    </Layout>
  )
}
