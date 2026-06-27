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

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
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

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Il tuo nome</label>
              <input
                type="text"
                placeholder="Marco"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                placeholder="la-tua@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                placeholder="Minimo 6 caratteri"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', background: 'white' }}
              />
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
            Registrandoti accetti i nostri <Link href="#" style={{ color: '#185FA5', textDecoration: 'none' }}>Termini e condizioni</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
