'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mostraPassword, setMostraPassword] = useState(false)
  const router = useRouter()

  async function handleRegister() {
    if (!nome) { setError('Inserisci il tuo nome'); return }
    if (password.length < 6) { setError('La password deve essere di almeno 6 caratteri'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nome } }
    })
    if (error) { setError('Errore durante la registrazione: ' + error.message) }
    else { setSuccess(true); setTimeout(() => router.push('/onboarding'), 1500) }
    setLoading(false)
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://studynotes-xi-fawn.vercel.app/onboarding' }
    })
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column', cursor: 'default' }}>
      <nav style={{ padding: '16px 32px', background: 'white', borderBottom: '0.5px solid #e5e7eb' }}>
        <Link href="/" style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>Klass</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>Crea il tuo account</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, textAlign: 'center' }}>Unisciti a migliaia di studenti su Klass</p>

          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#DC2626' }}>{error}</p>
              </div>
            )}
            {success && (
              <div style={{ background: '#ECFDF5', border: '0.5px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#059669' }}>✓ Account creato! Benvenuto su Klass 🎉</p>
              </div>
            )}

            <button
              onClick={loginGoogle}
              style={{ width: '100%', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, color: '#374151' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Registrati con Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>oppure</span>
              <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Il tuo nome</label>
              <input
                type="text"
                placeholder="Marco"
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white', cursor: 'text' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                placeholder="la-tua@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white', cursor: 'text' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostraPassword ? 'text' : 'password'}
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 44px 12px 16px', fontSize: 14, outline: 'none', background: 'white', cursor: 'text' }}
                />
                <button
                  onClick={() => setMostraPassword(!mostraPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF', padding: 4 }}
                >
                  {mostraPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none', padding: 13, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Registrazione in corso...' : 'Registrati gratis'}
            </button>

            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 20 }}>
              Hai già un account?{' '}
              <Link href="/login" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 600 }}>Accedi</Link>
            </p>
          </div>

          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
            Registrandoti accetti i nostri <Link href="/privacy" style={{ color: '#185FA5', textDecoration: 'none' }}>Termini e condizioni</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
