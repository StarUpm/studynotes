'use client'

import Link from 'next/link'
import Layout from '@/app/components/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <div style={{ background: '#f9fafb', padding: '32px', maxWidth: 1100, margin: '0 auto' }}>

        {/* STUDIA */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Studia</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Strumenti AI e materiali</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '🤖', title: 'Studia con AI', desc: 'Quiz, flashcard e schemi dai tuoi appunti', href: '/studia', bg: '#EEEDFE' },
              { icon: '🔍', title: 'Esplora appunti', desc: 'Trova materiale di altri studenti', href: '/esplora', bg: '#EFF6FF' },
              { icon: '📝', title: 'Carica appunti', desc: 'Condividi e guadagna dai tuoi materiali', href: '/upload', bg: '#ECFDF5' },
            ].map(function(item) {
              return (
                <Link key={item.title} href={item.href} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{item.icon}</div>
                  <span style={{ float: 'right', color: '#d1d5db', fontSize: 16, marginTop: -40 }}>›</span>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* RIPETIZIONI E CHAT */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Ripetizioni e comunicazione</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Tutor, sessioni e chat</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: '🎓', title: 'Trova un tutor', desc: 'Prenota ripetizioni online', href: '/tutor', bg: '#FFFBEB' },
              { icon: '👨‍🏫', title: 'Diventa tutor', desc: 'Offri ripetizioni e guadagna', href: '/diventa-tutor', bg: '#F0FDFA' },
              { icon: '📅', title: 'Le mie sessioni', desc: 'Gestisci prenotazioni', href: '/sessioni', bg: '#EEF2FF' },
              { icon: '💬', title: 'Messaggi', desc: 'Chatta con studenti e tutor', href: '/chat', bg: '#FDF2F8' },
            ].map(function(item) {
              return (
                <Link key={item.title} href={item.href} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{item.icon}</div>
                  <span style={{ float: 'right', color: '#d1d5db', fontSize: 16, marginTop: -40 }}>›</span>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CALENDARIO */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Calendario</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Prossime sessioni programmate</span>
          </div>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '12px 0' }}>
              Nessuna sessione programmata — <Link href="/tutor" style={{ color: '#185FA5', textDecoration: 'none' }}>trova un tutor</Link> per prenotarne una!
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/sessioni" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'none' }}>Vedi tutte le sessioni →</Link>
            </div>
          </div>
        </div>

        {/* SALDO */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Il mio saldo</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Guadagni e spese</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { label: 'Guadagni totali', value: '€ 0,00', color: '#185FA5', sub: 'Al netto del 20%' },
              { label: 'Da vendita appunti', value: '€ 0,00', color: '#111827', sub: '0 vendite' },
              { label: 'Da sessioni tutor', value: '€ 0,00', color: '#111827', sub: '0 sessioni completate' },
              { label: 'Acquisti effettuati', value: '€ 0,00', color: '#DC2626', sub: '0 appunti acquistati' },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{s.sub}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AZIONI RAPIDE */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Azioni rapide</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: '📤', title: 'Carica PDF', desc: 'Nuovo appunto', href: '/upload', bg: '#EFF6FF' },
              { icon: '⚡', title: 'Genera quiz', desc: "Con l'AI", href: '/studia/quiz', bg: '#EEEDFE' },
              { icon: '💬', title: 'Nuova chat', desc: 'Scrivi un messaggio', href: '/chat', bg: '#FDF2F8' },
              { icon: '👤', title: 'Il mio profilo', desc: 'Modifica dati', href: '/profilo-utente', bg: '#FFFBEB' },
            ].map(function(item) {
              return (
                <Link key={item.title} href={item.href} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#d1d5db', fontSize: 14 }}>›</span>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </Layout>
  )
}
