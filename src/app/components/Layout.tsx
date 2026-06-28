'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CookieBanner from '@/app/components/CookieBanner'

type Notifica = {
  id: string
  tipo: string
  titolo: string
  messaggio: string
  letta: boolean
  link: string
  created_at: string
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [emailFooter, setEmailFooter] = useState('')
  const [notifiche, setNotifiche] = useState<Notifica[]>([])
  const [notificheOpen, setNotificheOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [premiumAttivo, setPremiumAttivo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) return
      const uid = userData.data.user.id
      setUserId(uid)
      await caricaNotifiche(uid)

      const profilo = await supabase.from('profiles').select('premium_attivo').eq('id', uid).single()
      if (profilo.data?.premium_attivo) setPremiumAttivo(true)

      const channel = supabase
        .channel('notifiche_' + uid)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifiche',
          filter: 'utente_id=eq.' + uid
        }, function() {
          caricaNotifiche(uid)
        })
        .subscribe()

      return function() { supabase.removeChannel(channel) }
    }
    init()
  }, [])

  async function caricaNotifiche(uid: string) {
    const result = await supabase
      .from('notifiche')
      .select('*')
      .eq('utente_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    if (result.data) setNotifiche(result.data)
  }

  async function segnaLetta(id: string) {
    await supabase.from('notifiche').update({ letta: true }).eq('id', id)
    setNotifiche(function(prev) { return prev.map(function(n) { return n.id === id ? { ...n, letta: true } : n }) })
  }

  async function segnaAllLette() {
    await supabase.from('notifiche').update({ letta: true }).eq('utente_id', userId).eq('letta', false)
    setNotifiche(function(prev) { return prev.map(function(n) { return { ...n, letta: true } }) })
  }

  function handleLogout() {
    supabase.auth.signOut()
    router.push('/login')
    setMenuOpen(false)
  }

  function iconaNotifica(tipo: string) {
    if (tipo === 'messaggio') return '💬'
    if (tipo === 'prenotazione') return '📅'
    if (tipo === 'acquisto') return '💰'
    if (tipo === 'recensione') return '⭐'
    if (tipo === 'sessione') return '🎥'
    return '🔔'
  }

  function tempoFa(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Adesso'
    if (min < 60) return min + ' min fa'
    const ore = Math.floor(min / 60)
    if (ore < 24) return ore + ' ore fa'
    return Math.floor(ore / 24) + ' giorni fa'
  }

  const nonLette = notifiche.filter(function(n) { return !n.letta }).length

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui)', background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', cursor: 'default' }}>

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
                ['Importa contenuti', '/importa'],
                ['Trascrivi lezioni', '/trascrivi'],
                ['Messaggi', '/chat'],
                ['Forum Q&A', '/forum'],
                ['I miei punti', '/punti'],
                ['👑 Klass Premium', '/premium'],
                ['Diventa tutor', '/diventa-tutor'],
                ['Le mie sessioni', '/sessioni'],
                ['Il mio profilo', '/profilo-utente'],
              ].map(function([label, href]) {
                return (
                  <Link key={label} href={href} onClick={() => setMenuOpen(false)} style={{ color: label.includes('👑') ? '#FFD700' : 'white', fontSize: 16, fontWeight: 500, textDecoration: 'none', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)', display: 'block' }}>
                    {label}
                  </Link>
                )
              })}
              <button onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 400, background: 'none', border: 'none', padding: '10px 0', textAlign: 'left', cursor: 'pointer', marginTop: 8 }}>
                Esci
              </button>
            </div>
            <div style={{ marginTop: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8 }}>Resta aggiornato</p>
              <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.4)', paddingBottom: 8 }}>
                <input type="email" placeholder="La tua email" value={emailFooter} onChange={e => setEmailFooter(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 13, flex: 1, outline: 'none', cursor: 'text' }} />
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer' }}>Iscriviti</button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 20 }}>© 2026 Klass</p>
            </div>
          </div>
        </div>
      )}

      {notificheOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setNotificheOpen(false)}>
          <div style={{ position: 'absolute', top: 64, right: 80, width: 360, background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }} onClick={function(e) { e.stopPropagation() }}>
            <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Notifiche</p>
              {nonLette > 0 && (
                <button onClick={segnaAllLette} style={{ fontSize: 12, color: '#185FA5', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Segna tutte come lette
                </button>
              )}
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notifiche.length === 0 && (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>Nessuna notifica ancora</p>
                </div>
              )}
              {notifiche.map(function(n) {
                return (
                  <div
                    key={n.id}
                    onClick={async function() {
                      await segnaLetta(n.id)
                      setNotificheOpen(false)
                      if (n.link) router.push(n.link)
                    }}
                    style={{ display: 'flex', gap: 12, padding: '12px 18px', borderBottom: '0.5px solid #f3f4f6', cursor: 'pointer', background: n.letta ? 'white' : '#EFF6FF' }}
                  >
                    <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{iconaNotifica(n.tipo)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: n.letta ? 400 : 600, color: '#111827', marginBottom: 2 }}>{n.titolo}</p>
                      {n.messaggio && <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{n.messaggio}</p>}
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{tempoFa(n.created_at)}</p>
                    </div>
                    {!n.letta && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#185FA5', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '0.5px solid #e5e7eb', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #185FA5, #7F77DD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', letterSpacing: -0.5 }}>Klass</Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/esplora" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Esplora</Link>
          <Link href="/tutor" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Tutor</Link>
          <Link href="/studia" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Studia AI</Link>
          <Link href="/importa" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>⚡ Importa</Link>
          <Link href="/trascrivi" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>🎙️</Link>
          <Link href="/chat" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>💬</Link>
          <Link href="/forum" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>🙋</Link>
          <Link href="/punti" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>🏆</Link>
          {premiumAttivo ? (
            <Link href="/premium" style={{ fontSize: 13, color: '#B45309', textDecoration: 'none', fontWeight: 600 }}>👑 Premium</Link>
          ) : (
            <Link href="/premium" style={{ fontSize: 12, background: 'linear-gradient(135deg,#185FA5,#7F77DD)', color: 'white', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>👑 Premium</Link>
          )}
          <button
            onClick={() => setNotificheOpen(!notificheOpen)}
            style={{ position: 'relative', background: 'none', border: '0.5px solid #d1d5db', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
          >
            🔔
            {nonLette > 0 && (
              <div style={{ position: 'absolute', top: -4, right: -4, background: '#DC2626', color: 'white', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {nonLette > 9 ? '9+' : nonLette}
              </div>
            )}
          </button>
          <Link href="/profilo-utente" style={{ background: 'linear-gradient(135deg, #185FA5, #7F77DD)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Profilo</Link>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: '0.5px solid #d1d5db', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#374151', borderRadius: 2 }} />
          </button>
        </div>
      </nav>

      <div style={{ flex: 1 }}>{children}</div>
      <CookieBanner />

      <footer style={{ background: '#042C53', padding: '48px 40px 0', marginTop: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.6fr', gap: 32, paddingBottom: 40, borderBottom: '0.5px solid rgba(255,255,255,0.12)' }}>
          {[
            { title: 'Piattaforma', links: [['Esplora appunti', '/esplora'], ['Trova un tutor', '/tutor'], ['Studia con AI', '/studia'], ['Importa contenuti', '/importa'], ['Forum Q&A', '/forum']] },
            { title: 'Account', links: [['Registrati', '/register'], ['Accedi', '/login'], ['Il mio profilo', '/profilo-utente'], ['Le mie sessioni', '/sessioni'], ['I miei punti', '/punti']] },
            { title: 'Premium', links: [['👑 Klass Premium', '/premium'], ['Piano Mensile', '/premium'], ['Piano Trimestrale', '/premium'], ['Piano Annuale', '/premium']] },
            { title: 'Link utili', links: [['Privacy Policy', '/privacy'], ['Termini e condizioni', '/termini'], ['Cookie Policy', '/privacy'], ['FAQ', '#'], ['Contattaci', '#']] },
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
              <input type="email" placeholder="La tua email" value={emailFooter} onChange={e => setEmailFooter(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 13, flex: 1, outline: 'none', cursor: 'text' }} />
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
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>© 2026 Klass — Tutti i diritti riservati · <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy</Link> · <Link href="/termini" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Termini</Link></p>
        </div>
      </footer>
    </div>
  )
}
