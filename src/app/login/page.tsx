'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mostraPassword, setMostraPassword] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o password errati') }
    else { router.push('/dashboard') }
    setLoading(false)
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://studynotes-xi-fawn.vercel.app/dashboard' }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist-sans, system-ui)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 36px', height: 56, borderBottom: '0.5px solid #F4F4F5' }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.6, color: '#18181B', textDecoration: 'none' }}>
          klass<span style={{ color: '#D85A30' }}>.</span>
        </Link>
        <Link href="/register" style={{ fontSize: 13, color: '#71717A', textDecoration: 'none' }}>
          Non hai un account? <span style={{ color: '#18181B', fontWeight: 500 }}>Registrati</span>
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Bentornato</h1>
          <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 28px' }}>Accedi al tuo account klass.</p>

          {error && (
            <div style={{ background: '#FFF8F6', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#D85A30', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={loginGoogle}
            style={{ width: '100%', background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, color: '#18181B' }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continua con Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: '0.5px', background: '#F4F4F5' }} />
            <span style={{ fontSize: 12, color: '#A1A1AA' }}>oppure</span>
            <div style={{ flex: 1, height: '0.5px', background: '#F4F4F5' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="la-tua@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none', background: 'white' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostraPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 40px 10px 14px', fontSize: 13, outline: 'none', background: 'white' }}
              />
              <button
                onClick={() => setMostraPassword(!mostraPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <i className={`ti ${mostraPassword ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 16, color: '#A1A1AA' }} />
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: '#18181B', color: 'white', border: 'none', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </div>
      </div>
    </div>
  )
}
