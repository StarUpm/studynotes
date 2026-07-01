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
  const [notifiche, setNotifiche] = useState<Notifica[]>([])
  const [notificheOpen, setNotificheOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [premiumAttivo, setPremiumAttivo] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [nomeUtente, setNomeUtente] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) return
      const uid = userData.data.user.id
      setUserId(uid)
      await caricaNotifiche(uid)

      const profilo = await supabase.from('profiles').select('premium_attivo, avatar_url, nome').eq('id', uid).single()
      if (profilo.data) {
        setPremiumAttivo(profilo.data.premium_attivo || false)
        setAvatarUrl(profilo.data.avatar_url || '')
        setNomeUtente(profilo.data.nome || '')
      }

      const channel = supabase
        .channel('notifiche_' + uid)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifiche',
          filter: 'utente_id=eq.' + uid
        }, function() { caricaNotifiche(uid) })
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
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, letta: true } : n))
  }

  async function segnaAllLette() {
    await supabase.from('notifiche').update({ letta: true }).eq('utente_id', userId).eq('letta', false)
    setNotifiche(prev => prev.map(n => ({ ...n, letta: true })))
  }

  function handleLogout() {
    supabase.auth.signOut()
    router.push('/login')
    setMenuOpen(false)
  }

  function iconaNotifica(tipo: string) {
    if (tipo === 'messaggio') return 'ti-message-circle'
    if (tipo === 'prenotazione') return 'ti-calendar'
    if (tipo === 'acquisto') return 'ti-coin'
    if (tipo === 'recensione') return 'ti-star'
    if (tipo === 'sessione') return 'ti-video'
    return 'ti-bell'
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

  const nonLette = notifiche.filter(n => !n.letta).length
  const iniziale = nomeUtente ? nomeUtente.charAt(0).toUpperCase() : '?'

  const navLinks = [
    { label: 'Esplora', href: '/esplora' },
    { label: 'Tutor', href: '/tutor' },
    { label: 'Studia AI', href: '/studia' },
    { label: 'Forum', href: '/forum' },
  ]

  const menuLinks = [
    { label: 'Esplora appunti', href: '/esplora' },
    { label: 'Trova un tutor', href: '/tutor' },
    { label: 'Studia con AI', href: '/studia' },
    { label: 'Importa contenuti', href: '/importa' },
    { label: 'Trascrivi lezioni', href: '/trascrivi' },
    { label: 'Messaggi', href: '/chat' },
    { label: 'Forum Q&A', href: '/forum' },
    { label: 'I miei punti', href: '/punti' },
    { label: 'Klass Premium', href: '/premium' },
    { label: 'Diventa tutor', href: '/diventa-tutor' },
    { label: 'Le mie sessioni', href: '/sessioni' },
    { label: 'Il mio profilo', href: '/profilo-utente' },
  ]

  const footerLinks = [
    {
      titolo: 'Piattaforma',
      links: [
        { label: 'Esplora appunti', href: '/esplora' },
        { label: 'Trova un tutor', href: '/tutor' },
        { label: 'Studia con AI', href: '/studia' },
        { label: 'Forum Q&A', href: '/forum' },
        { label: 'Carica appunti', href: '/upload' },
      ]
    },
    {
      titolo: 'Account',
      links: [
        { label: 'Accedi', href: '/login' },
        { label: 'Registrati', href: '/register' },
        { label: 'Premium', href: '/premium' },
        { label: 'Profilo', href: '/profilo-utente' },
        { label: 'I miei punti', href: '/punti' },
      ]
    },
    {
      titolo: 'Legale',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Termini e condizioni', href: '/termini' },
        { label: 'Cookie Policy', href: '/privacy' },
      ]
    },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-geist-sans, system-ui)', background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 280, background: '#18181B', padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: 19, fontWeight: 500, color: 'white', letterSpacing: -0.5 }}>klass<span style={{ color: '#D85A30' }}>.</span></span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <i className="ti ti-x" style={{ fontSize: 20, color: '#A1A1AA' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              {menuLinks.map(function(l) {
                return (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: '#D4D4D8', fontSize: 14, textDecoration: 'none', padding: '11px 0', borderBottom: '0.5px solid #3F3F46', display: 'block' }}>
                    {l.label}
                  </Link>
                )
              })}
              <button onClick={handleLogout} style={{ color: '#71717A', fontSize: 14, background: 'none', border: 'none', padding: '11px 0', textAlign: 'left', cursor: 'pointer', marginTop: 8 }}>
                Esci
              </button>
            </div>
            <p style={{ color: '#3F3F46', fontSize: 11, marginTop: 24 }}>© 2026 klass</p>
          </div>
        </div>
      )}

      {/* PANNELLO NOTIFICHE */}
      {notificheOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setNotificheOpen(false)}>
          <div style={{ position: 'absolute', top: 60, right: 72, width: 340, background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F4F4F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: 0 }}>Notifiche</p>
              {nonLette > 0 && (
                <button onClick={segnaAllLette} style={{ fontSize: 12, color: '#D85A30', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Segna tutte come lette
                </button>
              )}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifiche.length === 0 && (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <i className="ti ti-bell" style={{ fontSize: 28, color: '#D4D4D8', display: 'block', marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>Nessuna notifica ancora</p>
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
                    style={{ display: 'flex', gap: 12, padding: '12px 18px', borderBottom: '0.5px solid #F4F4F5', cursor: 'pointer', background: n.letta ? 'white' : '#FFF8F6' }}
                  >
                    <i className={`ti ${iconaNotifica(n.tipo)}`} style={{ fontSize: 17, color: '#D85A30', marginTop: 1, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: n.letta ? 400 : 500, color: '#18181B', margin: '0 0 2px' }}>{n.titolo}</p>
                      {n.messaggio && <p style={{ fontSize: 12, color: '#71717A', lineHeight: 1.5, margin: 0 }}>{n.messaggio}</p>}
                      <p style={{ fontSize: 11, color: '#A1A1AA', margin: '4px 0 0' }}>{tempoFa(n.created_at)}</p>
                    </div>
                    {!n.letta && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D85A30', flexShrink: 0, marginTop: 5 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: 56, borderBottom: '0.5px solid #F4F4F5', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.6, textDecoration: 'none', color: '#18181B' }}>
          klass<span style={{ color: '#D85A30' }}>.</span>
        </Link>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {navLinks.map(function(l) {
            return (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#71717A', textDecoration: 'none' }}>
                {l.label}
              </Link>
            )
          })}

          {premiumAttivo ? (
            <Link href="/premium" style={{ fontSize: 13, color: '#854F0B', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="ti ti-crown" style={{ fontSize: 14 }} />
              Premium
            </Link>
          ) : (
            <Link href="/premium" style={{ fontSize: 13, color: '#18181B', textDecoration: 'none', fontWeight: 500, background: '#F4F4F5', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="ti ti-crown" style={{ fontSize: 14 }} />
              Premium
            </Link>
          )}

          <button
            onClick={() => setNotificheOpen(!notificheOpen)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8 }}
          >
            <i className="ti ti-bell" style={{ fontSize: 18, color: '#71717A' }} />
            {nonLette > 0 && (
              <div style={{ position: 'absolute', top: 4, right: 4, background: '#D85A30', color: 'white', fontSize: 9, fontWeight: 600, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {nonLette > 9 ? '9+' : nonLette}
              </div>
            )}
          </button>

          <Link href="/profilo-utente" style={{ textDecoration: 'none' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #E4E4E7' }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F4B860', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#412402' }}>
                {iniziale}
              </div>
            )}
          </Link>

          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-menu-2" style={{ fontSize: 20, color: '#71717A' }} />
          </button>
        </div>
      </nav>

      <div style={{ flex: 1 }}>{children}</div>
      <CookieBanner />

      {/* FOOTER */}
      <footer style={{ background: '#18181B', padding: '44px 36px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.2fr', gap: 28, marginBottom: 32 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 500, color: 'white', letterSpacing: -0.6 }}>
              klass<span style={{ color: '#D85A30' }}>.</span>
            </span>
            <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 10, lineHeight: 1.7, maxWidth: 200 }}>
              La piattaforma italiana per studiare, condividere e crescere insieme.
            </p>
          </div>
          {footerLinks.map(function(col) {
            return (
              <div key={col.titolo}>
                <p style={{ fontSize: 11, color: '#71717A', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{col.titolo}</p>
                {col.links.map(function(l) {
                  return (
                    <Link key={l.label} href={l.href} style={{ display: 'block', fontSize: 12, color: '#D4D4D8', textDecoration: 'none', marginBottom: 9 }}>
                      {l.label}
                    </Link>
                  )
                })}
              </div>
            )
          })}
          <div>
            <p style={{ fontSize: 11, color: '#71717A', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Newsletter</p>
            <div style={{ display: 'flex', borderBottom: '0.5px solid #3F3F46', paddingBottom: 8, marginBottom: 16 }}>
              <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: 12, flex: 1, outline: 'none' }}
              />
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <i className="ti ti-arrow-right" style={{ fontSize: 15, color: '#A1A1AA' }} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '0.5px solid #3F3F46', padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
