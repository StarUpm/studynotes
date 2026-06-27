'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Layout from '@/app/components/Layout'

export default function Dashboard() {
  const [punti, setPunti] = useState(0)
  const [livello, setLivello] = useState(1)
  const [nomeUtente, setNomeUtente] = useState('')

  const LIVELLI = [
    { livello: 1, nome: 'Matricola', emoji: '🌱' },
    { livello: 2, nome: 'Studente', emoji: '📚' },
    { livello: 3, nome: 'Secchione', emoji: '🤓' },
    { livello: 4, nome: 'Esperto', emoji: '⭐' },
    { livello: 5, nome: 'Genio', emoji: '🧠' },
    { livello: 6, nome: 'Maestro', emoji: '🎓' },
    { livello: 7, nome: 'Professore', emoji: '👨‍🏫' },
    { livello: 8, nome: 'Ricercatore', emoji: '🔬' },
    { livello: 9, nome: 'Accademico', emoji: '🏛️' },
    { livello: 10, nome: 'Leggenda', emoji: '🏆' },
  ]

  useEffect(() => {
    async function init() {
      const userData = await supabase.auth.getUser()
      if (!userData.data.user) return
      const uid = userData.data.user.id
      const [profiloResult, puntiResult] = await Promise.all([
        supabase.from('profiles').select('nome').eq('id', uid).single(),
        fetch('/api/punti?utente_id=' + uid).then(r => r.json())
      ])
      if (profiloResult.data?.nome) setNomeUtente(profiloResult.data.nome)
      if (puntiResult.punti_totali !== undefined) {
        setPunti(puntiResult.punti_totali)
        setLivello(puntiResult.livello || 1)
      }
    }
    init()
  }, [])

  const livelloAttuale = LIVELLI.find(l => l.livello === livello) || LIVELLI[0]

  return (
    <Layout>
      <div style={{ background: '#f9fafb', padding: '32px', maxWidth: 1100, margin: '0 auto' }}>

        {/* HERO */}
        <div style={{ background: 'linear-gradient(135deg,#185FA5,#7F77DD)', borderRadius: 16, padding: '24px 28px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              Ciao{nomeUtente ? ', ' + nomeUtente : ''}! 👋
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Bentornato su Klass — cosa studi oggi?</p>
          </div>
          <Link href="/punti" style={{ background: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '12px 18px', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 22 }}>{livelloAttuale.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{punti} pt</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Liv. {livello} · {livelloAttuale.nome}</div>
          </Link>
        </div>

        {/* STUDIA */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Studia</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Strumenti AI e materiali</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: '🤖', title: 'Studia con AI', desc: 'Quiz, flashcard e schemi', href: '/studia', bg: '#EEEDFE' },
              { icon: '⚡', title: 'Importa contenuti', desc: 'YouTube, foto, riassunti', href: '/importa', bg: '#FFFBEB' },
              { icon: '🎙️', title: 'Trascrivi lezioni', desc: 'Audio → testo con AI', href: '/trascrivi', bg: '#FDF2F8' },
              { icon: '🔍', title: 'Esplora appunti', desc: 'Trova materiale', href: '/esplora', bg: '#EFF6FF' },
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

        {/* GUADAGNA */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Guadagna</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Monetizza le tue conoscenze</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '📝', title: 'Carica appunti', desc: 'Condividi e guadagna +50pt', href: '/upload', bg: '#ECFDF5' },
              { icon: '👨‍🏫', title: 'Diventa tutor', desc: 'Offri ripetizioni online', href: '/diventa-tutor', bg: '#F0FDFA' },
              { icon: '📅', title: 'Le mie sessioni', desc: 'Gestisci prenotazioni', href: '/sessioni', bg: '#EEF2FF' },
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

        {/* RIPETIZIONI */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Ripetizioni</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Trova un tutor</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {[
              { icon: '🎓', title: 'Trova un tutor', desc: 'Prenota ripetizioni online quando vuoi', href: '/tutor', bg: '#FFFBEB' },
              { icon: '🎥', title: 'Le mie videochiamate', desc: 'Accedi alle sessioni confermate', href: '/sessioni', bg: '#EEF2FF' },
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

        {/* COMMUNITY */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Community</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Connettiti con altri studenti</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '💬', title: 'Messaggi', desc: 'Chatta con studenti e tutor', href: '/chat', bg: '#FDF2F8' },
              { icon: '🙋', title: 'Forum Q&A', desc: 'Fai domande e aiuta', href: '/forum', bg: '#FFFBEB' },
              { icon: '🏆', title: 'I miei punti', desc: 'Livello ' + livello + ' · ' + punti + ' pt', href: '/punti', bg: '#ECFDF5' },
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

      </div>
    </Layout>
  )
}
