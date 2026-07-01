import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ fontFamily: 'var(--font-geist-sans, system-ui)', background: '#ffffff', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 36px', height: 56, borderBottom: '0.5px solid #F4F4F5', position: 'sticky', top: 0, background: 'white', zIndex: 50 }}>
        <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.6, color: '#18181B' }}>
          klass<span style={{ color: '#D85A30' }}>.</span>
        </span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 13, color: '#71717A' }}>
          <Link href="/esplora" style={{ color: '#71717A', textDecoration: 'none' }}>Esplora</Link>
          <Link href="/tutor" style={{ color: '#71717A', textDecoration: 'none' }}>Tutor</Link>
          <Link href="/studia" style={{ color: '#71717A', textDecoration: 'none' }}>Studia AI</Link>
          <Link href="/premium" style={{ color: '#71717A', textDecoration: 'none' }}>Premium</Link>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 13, color: '#18181B', textDecoration: 'none', padding: '7px 14px' }}>Accedi</Link>
          <Link href="/register" style={{ fontSize: 13, color: 'white', background: '#18181B', textDecoration: 'none', padding: '7px 16px', borderRadius: 8, fontWeight: 500 }}>Registrati</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '80px 36px 64px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
          <i className="ti ti-users" style={{ fontSize: 12, color: '#D85A30' }} />
          <span style={{ fontSize: 12, color: '#71717A' }}>Più di 1000 studenti già iscritti</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 500, color: '#18181B', margin: '0 0 16px', letterSpacing: -1.5, lineHeight: 1.1 }}>
          Studia meglio,<br />insieme.
        </h1>
        <p style={{ fontSize: 16, color: '#71717A', margin: '0 auto 36px', maxWidth: 440, lineHeight: 1.6 }}>
          Appunti, ripetizioni e strumenti AI in un&apos;unica piattaforma pensata per studenti italiani.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/register" style={{ fontSize: 14, color: 'white', background: '#18181B', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 500 }}>
            Inizia gratis
          </Link>
          <Link href="/esplora" style={{ fontSize: 14, color: '#18181B', border: '0.5px solid #E4E4E7', textDecoration: 'none', padding: '12px 24px', borderRadius: 10 }}>
            Esplora appunti
          </Link>
        </div>
      </div>

      {/* CARD PRINCIPALI */}
      <div style={{ padding: '0 36px 64px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { icon: 'ti-sparkles', label: 'Studia con AI', desc: 'Genera quiz, flashcard e schemi a partire dai tuoi appunti in pochi secondi', bg: '#F4B860', color: '#412402', href: '/studia' },
            { icon: 'ti-folder', label: 'Condividi appunti', desc: 'Carica i tuoi materiali e guadagna ogni volta che vengono scaricati', bg: '#7BC67A', color: '#173404', href: '/upload' },
            { icon: 'ti-school', label: 'Trova un tutor', desc: 'Prenota videolezioni con studenti esperti quando e dove vuoi', bg: '#7FB3E8', color: '#042C53', href: '/tutor' },
          ].map(function(item) {
            return (
              <Link key={item.href} href={item.href} style={{ background: item.bg, borderRadius: 18, padding: '28px', textDecoration: 'none', display: 'block' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 26, color: item.color }} />
                <p style={{ fontSize: 16, fontWeight: 500, color: '#18181B', margin: '16px 0 6px' }}>{item.label}</p>
                <p style={{ fontSize: 13, color: item.color, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </Link>
            )
          })}
        </div>

        {/* LISTA FEATURE SECONDARIE */}
        <p style={{ fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 16px', textAlign: 'center' }}>Tutto quello che ti serve</p>
        <div style={{ maxWidth: 560, margin: '0 auto', borderTop: '0.5px solid #F4F4F5' }}>
          {[
            { icon: 'ti-message-circle', label: 'Chat e forum tra studenti', desc: 'Confrontati e fai domande alla community', color: '#993556' },
            { icon: 'ti-microphone', label: 'Trascrizione lezioni audio', desc: 'Registra e converti automaticamente in testo', color: '#534AB7' },
            { icon: 'ti-brand-youtube', label: 'Importa da YouTube', desc: 'Estrai e studia il contenuto di qualsiasi video', color: '#D85A30' },
            { icon: 'ti-trophy', label: 'Punti e livelli', desc: 'Guadagna punti studiando e sali di livello', color: '#854F0B' },
            { icon: 'ti-camera', label: 'Scansiona appunti scritti a mano', desc: 'Fotografa e digitalizza i tuoi appunti cartacei', color: '#1D9E75' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: item.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, color: '#18181B', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA FINALE */}
      <div style={{ background: '#18181B', margin: '0 36px 64px', borderRadius: 20, padding: '52px 36px', textAlign: 'center', maxWidth: 928, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 500, color: 'white', margin: '0 0 12px', letterSpacing: -0.8 }}>Pronto a studiare meglio?</h2>
        <p style={{ fontSize: 14, color: '#A1A1AA', margin: '0 0 28px' }}>Registrati gratis in 30 secondi — nessuna carta richiesta.</p>
        <Link href="/register" style={{ fontSize: 14, color: '#18181B', background: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 500, display: 'inline-block' }}>
          Inizia gratis
        </Link>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#18181B', padding: '44px 36px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.2fr', gap: 28, marginBottom: 32, maxWidth: 1000, margin: '0 auto 32px' }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 500, color: 'white', letterSpacing: -0.6 }}>
              klass<span style={{ color: '#D85A30' }}>.</span>
            </span>
            <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 10, lineHeight: 1.7, maxWidth: 200 }}>
              La piattaforma italiana per studiare, condividere e crescere insieme.
            </p>
          </div>
          {[
            { titolo: 'Piattaforma', links: [['Esplora appunti', '/esplora'], ['Trova un tutor', '/tutor'], ['Studia con AI', '/studia'], ['Forum Q&A', '/forum']] },
            { titolo: 'Account', links: [['Accedi', '/login'], ['Registrati', '/register'], ['Premium', '/premium']] },
            { titolo: 'Legale', links: [['Privacy Policy', '/privacy'], ['Termini', '/termini'], ['Cookie', '/privacy']] },
          ].map(function(col) {
            return (
              <div key={col.titolo}>
                <p style={{ fontSize: 11, color: '#71717A', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{col.titolo}</p>
                {col.links.map(function([label, href]) {
                  return (
                    <Link key={label} href={href} style={{ display: 'block', fontSize: 12, color: '#D4D4D8', textDecoration: 'none', marginBottom: 9 }}>
                      {label}
                    </Link>
                  )
                })}
              </div>
            )
          })}
          <div>
            <p style={{ fontSize: 11, color: '#71717A', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Newsletter</p>
            <div style={{ display: 'flex', borderBottom: '0.5px solid #3F3F46', paddingBottom: 8 }}>
              <input type="email" placeholder="La tua email" style={{ background: 'none', border: 'none', color: 'white', fontSize: 12, flex: 1, outline: 'none' }} />
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <i className="ti ti-arrow-right" style={{ fontSize: 15, color: '#A1A1AA' }} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '0.5px solid #3F3F46', padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>© 2026 klass — Tutti i diritti riservati</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['ti-brand-instagram', 'ti-brand-tiktok', 'ti-brand-youtube', 'ti-brand-linkedin'].map(function(icon) {
              return <i key={icon} className={`ti ${icon}`} style={{ fontSize: 16, color: '#71717A', cursor: 'pointer' }} />
            })}
          </div>
        </div>
      </footer>

    </div>
  )
}
