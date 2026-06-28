'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visibile, setVisibile] = useState(false)

  useEffect(() => {
    const consenso = localStorage.getItem('klass_cookie_consenso')
    if (!consenso) setVisibile(true)
  }, [])

  function accetta() {
    localStorage.setItem('klass_cookie_consenso', 'accettato')
    setVisibile(false)
  }

  function rifiuta() {
    localStorage.setItem('klass_cookie_consenso', 'rifiutato')
    setVisibile(false)
  }

  if (!visibile) return null

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, padding: '16px 24px', background: 'white', borderTop: '0.5px solid #e5e7eb', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>🍪 Utilizziamo i cookie</p>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
            Usiamo cookie tecnici necessari al funzionamento del sito e cookie analitici per migliorare la tua esperienza.
            Leggi la nostra{' '}
            <Link href="/privacy" style={{ color: '#185FA5', textDecoration: 'none' }}>Privacy Policy</Link>
            {' '}e la{' '}
            <Link href="/termini" style={{ color: '#185FA5', textDecoration: 'none' }}>Cookie Policy</Link>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={rifiuta}
            style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'white', color: '#6B7280', border: '0.5px solid #e5e7eb' }}
          >
            Solo necessari
          </button>
          <button
            onClick={accetta}
            style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', border: 'none' }}
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  )
}
