'use client'

import Link from 'next/link'
import Layout from '@/app/components/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 32 }}>Benvenuto! 👋</h1>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Appunti caricati', value: '0' },
            { label: 'Guadagni totali', value: '€ 0' },
            { label: 'Quiz completati', value: '0' },
            { label: 'Ripetizioni', value: '0' },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{s.value}</p>
              </div>
            )
          })}
        </div>

        {/* AZIONI PRINCIPALI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          {[
            { emoji: '📝', title: 'Carica appunti', desc: 'Vendi i tuoi appunti e guadagna', href: '/upload' },
            { emoji: '🔍', title: 'Esplora appunti', desc: 'Trova appunti di altri studenti', href: '/esplora' },
            { emoji: '🤖', title: 'Studia con AI', desc: 'Quiz, flashcard e schemi dai tuoi appunti', href: '/quiz' },
          ].map(function(item) {
            return (
              <Link key={item.title} href={item.href} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, textDecoration: 'none', display: 'block', transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.emoji}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{item.desc}</p>
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { emoji: '🎓', title: 'Trova un tutor', desc: 'Prenota ripetizioni online', href: '/tutor' },
            { emoji: '👨‍🏫', title: 'Diventa tutor', desc: 'Offri ripetizioni e guadagna', href: '/diventa-tutor' },
            { emoji: '📅', title: 'Le mie sessioni', desc: 'Gestisci le tue prenotazioni', href: '/sessioni' },
            { emoji: '👤', title: 'Il mio profilo', desc: 'Saldo, acquisti e dati personali', href: '/profilo-utente' },
          ].map(function(item) {
            return (
              <Link key={item.title} href={item.href} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.emoji}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{item.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
