'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [emailFooter, setEmailFooter] = useState('')
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    setMenuOpen(false)
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui)', background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,30,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 300, padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', marginBottom: 32 }}>✕</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              {[
                ['Esplora appunti', '/esplora'],
                ['Trova un tutor', '/tutor'],
                ['Studia con AI', '/studia'],
                ['Diventa tutor', '/diventa-tutor'],
                ['Le mie sessioni', '/sessioni'],
                ['Il mio profilo', '/profilo-utente'],
              ].map(function([label, href]) {
                return (
                  <Link key={label} href={href} onClick={() => setMenuOpen(false)} style={{ color: 'white', fontSize: 20, fontWeight: 500, textDecoration: 'none', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)', display: 'block' }}>
                    {label}
                  </Link>
                )
              })}
              <button onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 400, background: 'none', border: 'none', padding: '10px 0', textAlign: 'left', cursor: 'pointer', marginTop: 8 }}>
                Esci
              </button>
            </div>
            <div style={{ marginTop: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8 }}>Resta aggiornato</p>
              <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.4)', paddingBottom: 8 }}>
                <input
                  type="email"
                  placeholder="La tua email"
                  value={emailFooter}
                  onChange={e => setEmailFooter(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: 13, flex: 1, outline: 'none' }}
                />
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer' }}>Iscriviti</button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 20 }}>© 2026 Klass</p>
            </div>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '0.5px solid #e5e7eb', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #185FA5, #7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', letterSpacing: -0.5 }}>Klass</Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/esplora" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Esplora</Link>
          <Link href="/tutor" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Tutor</Link>
          <Link href="/studia" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Studia con AI</Link>
          <Link href="/profilo-utente" style={{ background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Il mio profilo</Link>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: '0.5px solid #d1d5db', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
          </button>
        </div>
      </nav>

      <div style={{ flex: 1 }}>
        {children}
      </div>

      <footer style={{ background: '#042C53', padding: '48px 40px 0', marginTop: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.6fr', gap: 32, paddingBottom: 40, borderBottom: '0.5px solid rgba(255,255,255,0.12)' }}>
          {[
            { title: 'Piattaforma', links: [['Esplora appunti', '/esplora'], ['Trova un tutor', '/tutor'], ['Studia con AI', '/studia'], ['Diventa tutor', '/diventa-tutor'], ['Carica appunti', '/upload']] },
            { title: 'Account', links: [['Registrati', '/register'], ['Accedi', '/login'], ['Il mio profilo', '/profilo-utente'], ['Le mie sessioni', '/sessioni']] },
            { title: 'Social', links: [['Instagram', '#'], ['TikTok', '#'], ['YouTube', '#'], ['LinkedIn', '#']] },
            { title: 'Link utili', links: [['Privacy Policy', '#'], ['Termini e condizioni', '#'], ['Cookie Policy', '#'], ['FAQ', '#'], ['Contattaci', '#']] },
          ].map(function(col) {
            return (
              <div key={col.title}>
                <h4 style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{col.title}</h4>
                {col.links.map(function([label, href]) {
                  return <Link key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 10, textDecoration: 'none' }}>{label}</Link>
                })}
              </div>
            )
          })}
          <div>
            <h4 style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Iscriviti alla newsletter</h4>
            <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.4)', paddingBottom: 8, marginBottom: 24 }}>
              <input
                type="email"
                placeholder="La tua email"
                value={emailFooter}
                onChange={e => setEmailFooter(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: 13, flex: 1, outline: 'none' }}
              />
              <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer' }}>Iscriviti</button>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: -1, marginBottom: 16 }}>Klass</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['📸', '🎵', '▶️', '💼'].map(function(icon, i) {
                return <div key={i} style={{ width: 32, height: 32, borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>{icon}</div>
              })}
            </div>
          </div>
        </div>
        <div style={{ padding: '18px 0', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>© 2026 Klass — Tutti i diritti riservati</p>
        </div>
      </footer>

    </div>
  )
}
