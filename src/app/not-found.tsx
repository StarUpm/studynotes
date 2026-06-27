'use client'

import Link from 'next/link'
import Layout from '@/app/components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>📚</div>
        <h1 style={{ fontSize: 48, fontWeight: 700, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Pagina non trovata</h2>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>
          Sembra che questa pagina non esista — forse è stata spostata o l&apos;URL è sbagliato.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Torna alla dashboard
          </Link>
          <Link href="/esplora" style={{ background: 'white', color: '#185FA5', border: '0.5px solid #185FA5', padding: '12px 24px', borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
            Esplora appunti
          </Link>
        </div>
      </div>
    </Layout>
  )
}
