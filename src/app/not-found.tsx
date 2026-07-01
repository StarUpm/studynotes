import Link from 'next/link'
import Layout from '@/app/components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '100px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 72, fontWeight: 500, color: '#F4F4F5', margin: '0 0 0', letterSpacing: -2 }}>404</p>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#18181B', margin: '0 0 8px', letterSpacing: -0.5 }}>Pagina non trovata</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 32px', lineHeight: 1.6 }}>
          Questa pagina non esiste o è stata spostata.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'white', background: '#18181B', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 500 }}>
            Torna alla dashboard
          </Link>
          <Link href="/esplora" style={{ fontSize: 13, color: '#18181B', border: '0.5px solid #E4E4E7', textDecoration: 'none', padding: '10px 20px', borderRadius: 8 }}>
            Esplora appunti
          </Link>
        </div>
      </div>
    </Layout>
  )
}
