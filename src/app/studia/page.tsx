'use client'

import Link from 'next/link'
import Layout from '@/app/components/Layout'

export default function Studia() {
  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', borderRadius: 16, padding: '36px 40px', marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>Studia con AI 🤖</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', maxWidth: 480, lineHeight: 1.6 }}>
            Carica i tuoi appunti e lascia che l&apos;AI crei quiz interattivi, flashcard e mappe concettuali per te — in pochi secondi.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
          {[
            {
              href: '/studia/quiz',
              icon: '🧠',
              title: 'Quiz',
              desc: 'Metti alla prova le tue conoscenze con domande generate dall\'AI.',
              features: ['10, 20, 30 o 40 domande', 'Risposta multipla, V/F, risposta breve', 'Punteggio finale e spiegazioni', 'Riprova le domande sbagliate'],
              btnLabel: 'Inizia quiz →',
              accent: 'linear-gradient(90deg,#185FA5,#378ADD)',
              btn: 'linear-gradient(135deg,#185FA5,#7F77DD)',
            },
            {
              href: '/studia/flashcard',
              icon: '🃏',
              title: 'Flashcard',
              desc: 'Ripassa con flashcard generate automaticamente dall\'AI.',
              features: ['Generazione automatica dal testo', 'Gira le carte per vedere la risposta', 'Segna quelle che sai / non sai', 'Ripeti solo quelle difficili'],
              btnLabel: 'Inizia flashcard →',
              accent: 'linear-gradient(90deg,#534AB7,#7F77DD)',
              btn: 'linear-gradient(135deg,#534AB7,#7F77DD)',
            },
            {
              href: '/studia/schema',
              icon: '🗺️',
              title: 'Schema',
              desc: 'Crea mappe concettuali e schemi strutturati dai tuoi appunti.',
              features: ['Mappa concettuale visiva', 'Schema discorsivo o a punti', 'Anteprima e download PDF', 'Stampabile direttamente'],
              btnLabel: 'Genera schema →',
              accent: 'linear-gradient(90deg,#0F6E56,#1D9E75)',
              btn: 'linear-gradient(135deg,#0F6E56,#1D9E75)',
            },
          ].map(function(m) {
            return (
              <div key={m.title} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: m.accent, borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 36, marginBottom: 16 }}>{m.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>{m.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {m.features.map(f => (
                    <div key={f} style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Link href={m.href} style={{ display: 'block', width: '100%', background: m.btn, color: 'white', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                  {m.btnLabel}
                </Link>
              </div>
            )
          })}
        </div>

        <div style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Report risultati</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>Le tue statistiche di studio</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { num: '0', label: 'Sessioni totali', color: '#185FA5' },
            { num: '0%', label: 'Media punteggi', color: '#059669' },
            { num: '0', label: 'Da ripassare', color: '#B45309' },
            { num: '0', label: 'Flashcard studiate', color: '#534AB7' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.num}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Progressi per materia</h3>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna sessione ancora — inizia a studiare per vedere i tuoi progressi!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 14 }}>❌ Errori frequenti</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessun errore registrato ancora</p>
          </div>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#B45309', marginBottom: 14 }}>🔁 Da ripassare</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessun ripasso necessario ancora</p>
          </div>
        </div>

      </div>
    </Layout>
  )
}
