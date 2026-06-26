'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailFooter, setEmailFooter] = useState('')

  return (
    <main style={{ fontFamily: 'var(--font-sans, system-ui)', background: '#f8f9fa' }}>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,30,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 300, padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', marginBottom: 32 }}>✕</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              {['Esplora appunti', 'Trova un tutor', 'Studia con AI', 'Diventa tutor', 'Accedi', 'Registrati gratis'].map(function(item, i) {
                const href = ['/esplora', '/tutor', '/quiz', '/diventa-tutor', '/login', '/register'][i]
                return (
                  <Link key={item} href={href} onClick={() => setMenuOpen(false)} style={{ color: 'white', fontSize: 20, fontWeight: 500, textDecoration: 'none', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)', display: 'block' }}>
                    {item}
                  </Link>
                )
              })}
            </div>
            <div style={{ marginTop: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8 }}>Resta aggiornato</p>
              <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.4)', paddingBottom: 8 }}>
                <input
                  type="email"
                  placeholder="La tua email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: 13, flex: 1, outline: 'none' }}
                />
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer' }}>Iscriviti</button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 20 }}>© 2026 Klass</p>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '0.5px solid #e5e7eb', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: 22, fontWeight: 600, background: 'linear-gradient(135deg, #185FA5, #7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', letterSpacing: -0.5 }}>Klass</Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/register" style={{ background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Inizia gratis</Link>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: '0.5px solid #d1d5db', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '72px 32px 56px', textAlign: 'center', background: 'white' }}>
        <div style={{ display: 'inline-block', background: '#EFF6FF', color: '#185FA5', fontSize: 12, padding: '4px 14px', borderRadius: 20, marginBottom: 20, border: '0.5px solid #BFDBFE' }}>
          La piattaforma degli studenti italiani
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, color: '#111827', maxWidth: 580, margin: '0 auto 16px', letterSpacing: -1 }}>
          Studia meglio,{' '}
          <span style={{ background: 'linear-gradient(135deg, #185FA5, #7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            insieme agli altri
          </span>
        </h1>
        <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Condividi appunti, prenota ripetizioni online e studia con l&apos;AI. Tutto in un&apos;unica piattaforma.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '13px 28px', borderRadius: 10, fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>Inizia gratis</Link>
          <Link href="/esplora" style={{ background: 'white', color: '#111827', border: '0.5px solid #d1d5db', padding: '13px 28px', borderRadius: 10, fontSize: 15, textDecoration: 'none' }}>Esplora gli appunti</Link>
        </div>
      </section>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', margin: '0 32px', borderRadius: 12, overflow: 'hidden', border: '0.5px solid #e5e7eb' }}>
        {[['10k+', 'Studenti attivi'], ['50k+', 'Appunti condivisi'], ['500+', 'Tutor disponibili']].map(function([num, label]) {
          return (
            <div key={label} style={{ background: '#f9fafb', padding: '20px', textAlign: 'center', borderRight: '0.5px solid #e5e7eb' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#185FA5' }}>{num}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
            </div>
          )
        })}
      </div>

      {/* FEATURES */}
      <section style={{ padding: '56px 32px', background: '#f9fafb' }}>
        <div style={{ fontSize: 12, color: '#185FA5', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Funzionalità</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: -0.5 }}>Tutto quello che ti serve</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Una sola piattaforma per appunti, AI e ripetizioni</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: '📝', title: 'Appunti', desc: 'Carica, vendi e scarica appunti da studenti di tutta Italia.', bg: '#EFF6FF' },
            { icon: '🤖', title: 'AI per studiare', desc: 'Quiz, flashcard e schemi generati dai tuoi appunti in secondi.', bg: '#EEEDFE' },
            { icon: '🎥', title: 'Ripetizioni live', desc: 'Videochiamate con tutor esperti nella tua materia, quando vuoi.', bg: '#ECFDF5' },
            { icon: '💰', title: 'Guadagna', desc: 'Vendi appunti e dai ripetizioni. Trasforma lo studio in reddito.', bg: '#FFFBEB' },
          ].map(function(f) {
            return (
              <div key={f.title} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* APPUNTI PIU SCARICATI */}
      <section style={{ padding: '56px 32px', background: 'white' }}>
        <div style={{ fontSize: 12, color: '#185FA5', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Appunti in evidenza</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: -0.5 }}>I più scaricati questa settimana</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Materiale di qualità condiviso da studenti come te</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { tag: 'Matematica', title: 'Analisi 1 — Limiti e derivate', uni: 'Politecnico di Milano · 45 pag.', price: '€ 4,99', downloads: '1.2k' },
            { tag: 'Diritto', title: 'Diritto privato — Contratti', uni: 'La Sapienza Roma · 38 pag.', price: 'Gratis', downloads: '980' },
            { tag: 'Economia', title: 'Microeconomia — Mercati', uni: 'Bocconi · 52 pag.', price: '€ 6,99', downloads: '876' },
            { tag: 'Informatica', title: 'Algoritmi e strutture dati', uni: 'Università di Bologna · 60 pag.', price: '€ 3,99', downloads: '754' },
            { tag: 'Fisica', title: 'Fisica 2 — Elettromagnetismo', uni: 'Politecnico di Torino · 48 pag.', price: '€ 5,99', downloads: '691' },
            { tag: 'Medicina', title: 'Anatomia umana — Apparati', uni: 'Università di Bologna · 72 pag.', price: '€ 7,99', downloads: '612' },
          ].map(function(n) {
            return (
              <div key={n.title} style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <span style={{ fontSize: 11, background: '#EFF6FF', color: '#185FA5', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>{n.tag}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>{n.uni}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{n.price}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>⬇ {n.downloads}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/esplora" style={{ fontSize: 14, color: '#185FA5', textDecoration: 'none', border: '0.5px solid #185FA5', padding: '10px 24px', borderRadius: 8, display: 'inline-block' }}>Vedi tutti gli appunti →</Link>
        </div>
      </section>

      {/* TOP TUTOR */}
      <section style={{ padding: '56px 32px', background: '#f9fafb' }}>
        <div style={{ fontSize: 12, color: '#185FA5', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>I migliori tutor</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: -0.5 }}>Scelti dalla community</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Laureati con lode, esperienza reale e centinaia di recensioni</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {[
            { initials: 'MR', name: 'Marco R.', uni: 'Politecnico di Milano · 110L', subject: 'Analisi, Fisica, Algebra', rating: '4.9', sessions: '127', price: '€ 18/ora', color: '#185FA5' },
            { initials: 'SF', name: 'Sara F.', uni: 'Bocconi · 110L', subject: 'Microeconomia, Diritto', rating: '4.8', sessions: '98', price: '€ 20/ora', color: '#534AB7' },
            { initials: 'LB', name: 'Luca B.', uni: 'La Sapienza · 110L', subject: 'Diritto privato, Penale', rating: '4.9', sessions: '83', price: '€ 15/ora', color: '#3B6D11' },
          ].map(function(t) {
            return (
              <div key={t.name} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', padding: '2px 8px', borderRadius: 20 }}>Top tutor</span>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: 'white', margin: '0 auto 10px' }}>{t.initials}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{t.uni}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{t.subject}</div>
                <div style={{ color: '#B45309', fontSize: 13, marginBottom: 4 }}>★★★★★</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{t.rating}/5 · {t.sessions} sessioni</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#185FA5', marginBottom: 12 }}>{t.price}</div>
                <Link href="/tutor" style={{ display: 'block', background: '#EFF6FF', color: '#185FA5', border: '0.5px solid #BFDBFE', padding: '8px', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>Prenota</Link>
              </div>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/tutor" style={{ fontSize: 14, color: '#185FA5', textDecoration: 'none', border: '0.5px solid #185FA5', padding: '10px 24px', borderRadius: 8, display: 'inline-block' }}>Vedi tutti i tutor →</Link>
        </div>
      </section>

      {/* RECENSIONI */}
      <section style={{ padding: '56px 32px', background: 'white' }}>
        <div style={{ fontSize: 12, color: '#185FA5', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Recensioni</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: -0.5 }}>Cosa dicono gli studenti</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Migliaia di studenti già usano Klass ogni giorno</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { text: '"Ho passato Analisi 2 grazie agli appunti di Marco. Chiari, completi e a un prezzo onesto."', name: 'Giulia V.', role: 'Ingegneria · Polimi', initials: 'GV' },
            { text: '"Le flashcard generate dall\'AI mi hanno salvato la sessione. In 20 minuti avevo tutto in testa."', name: 'Andrea T.', role: 'Medicina · Bologna', initials: 'AT' },
            { text: '"Ho guadagnato €200 vendendo appunti che avevo già. Non ci speravo ma funziona davvero."', name: 'Chiara M.', role: 'Economia · Bocconi', initials: 'CM' },
          ].map(function(r) {
            return (
              <div key={r.name} style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <div style={{ color: '#B45309', fontSize: 13, marginBottom: 10 }}>★★★★★</div>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>{r.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#185FA5' }}>{r.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{r.role}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ margin: '0 32px 56px', background: 'linear-gradient(135deg, #185FA5, #7F77DD)', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 8 }}>Pronto a studiare meglio?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>Unisciti a migliaia di studenti. Nessuna carta richiesta.</p>
        <Link href="/register" style={{ background: 'white', color: '#185FA5', border: 'none', padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Inizia gratis</Link>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 11, padding: '3px 12px', borderRadius: 20, marginTop: 16 }}>Gratis per sempre per gli studenti</div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#042C53', padding: '48px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.6fr', gap: 32, paddingBottom: 40, borderBottom: '0.5px solid rgba(255,255,255,0.12)' }}>
          {[
            { title: 'Piattaforma', links: [['Esplora appunti', '/esplora'], ['Trova un tutor', '/tutor'], ['Studia con AI', '/quiz'], ['Diventa tutor', '/diventa-tutor'], ['Carica appunti', '/upload']] },
            { title: 'Account', links: [['Registrati', '/register'], ['Accedi', '/login'], ['Il mio profilo', '/profilo-utente'], ['Le mie sessioni', '/sessioni'], ['I miei acquisti', '/profilo-utente']] },
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

    </main>
  )
}
