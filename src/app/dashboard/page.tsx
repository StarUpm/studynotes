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
    { livello: 1, nome: 'Matricola' },
    { livello: 2, nome: 'Studente' },
    { livello: 3, nome: 'Secchione' },
    { livello: 4, nome: 'Esperto' },
    { livello: 5, nome: 'Genio' },
    { livello: 6, nome: 'Maestro' },
    { livello: 7, nome: 'Professore' },
    { livello: 8, nome: 'Ricercatore' },
    { livello: 9, nome: 'Accademico' },
    { livello: 10, nome: 'Leggenda' },
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

  const azioniPrincipali = [
    { icon: 'ti-sparkles', label: 'Studia con AI', desc: 'Quiz, flashcard e schemi', href: '/studia', bg: '#F4B860', color: '#412402' },
    { icon: 'ti-folder', label: 'Esplora appunti', desc: 'Trova materiale', href: '/esplora', bg: '#7BC67A', color: '#173404' },
    { icon: 'ti-school', label: 'Trova un tutor', desc: 'Ripetizioni online', href: '/tutor', bg: '#7FB3E8', color: '#042C53' },
  ]

  const azioniSecondarie = [
    { icon: 'ti-upload', label: 'Carica appunti', desc: 'Condividi e guadagna', href: '/upload' },
    { icon: 'ti-bolt', label: 'Importa contenuti', desc: 'YouTube, foto, riassunti', href: '/importa' },
    { icon: 'ti-microphone', label: 'Trascrivi lezioni', desc: 'Audio in testo', href: '/trascrivi' },
    { icon: 'ti-message-circle', label: 'Messaggi', desc: 'Chat con studenti', href: '/chat' },
    { icon: 'ti-help-circle', label: 'Forum Q&A', desc: 'Fai una domanda', href: '/forum' },
    { icon: 'ti-calendar', label: 'Le mie sessioni', desc: 'Gestisci prenotazioni', href: '/sessioni' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 4px', letterSpacing: -0.5 }}>
              Ciao{nomeUtente ? ', ' + nomeUtente : ''}
            </h1>
            <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Cosa studi oggi?</p>
          </div>
          <Link href="/punti" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: '#18181B', borderRadius: 10, padding: '8px 14px' }}>
            <i className="ti ti-trophy" style={{ fontSize: 15, color: '#FAC775' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>{punti} punti</span>
            <span style={{ fontSize: 12, color: '#71717A' }}>· {livelloAttuale.nome}</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
          {azioniPrincipali.map(function(item) {
            return (
              <Link key={item.href} href={item.href} style={{ background: item.bg, borderRadius: 16, padding: '22px', textDecoration: 'none', display: 'block' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 22, color: item.color }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '14px 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: 12, color: item.color, margin: 0 }}>{item.desc}</p>
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

          <div>
            <p style={{ fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>Strumenti e sezioni</p>
            <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
              {azioniSecondarie.map(function(item) {
                return (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid #F4F4F5', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: '#D85A30' }} />
                      <div>
                        <p style={{ fontSize: 13, color: '#18181B', margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{item.desc}</p>
                      </div>
                    </div>
                    <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#D4D4D8' }} />
                  </Link>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#18181B', borderRadius: 16, padding: 20 }}>
              <i className="ti ti-trophy" style={{ fontSize: 18, color: '#FAC775' }} />
              <p style={{ fontSize: 20, fontWeight: 500, color: 'white', margin: '10px 0 0' }}>{punti} punti</p>
              <p style={{ fontSize: 11, color: '#A1A1AA', margin: '2px 0 0' }}>Livello {livello} · {livelloAttuale.nome}</p>
              <Link href="/punti" style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: '#D85A30', textDecoration: 'none' }}>
                Vedi storico
              </Link>
            </div>

            <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 16, padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#18181B', margin: '0 0 12px' }}>Prossima sessione</p>
              <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>
                Nessuna sessione programmata —{' '}
                <Link href="/tutor" style={{ color: '#D85A30', textDecoration: 'none' }}>trova un tutor</Link>
              </p>
            </div>

            <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 16, padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#18181B', margin: '0 0 12px' }}>Il mio saldo</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: '#18181B', margin: '0 0 2px' }}>€ 0,00</p>
              <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>Al netto del 20%</p>
              <Link href="/profilo-utente" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#D85A30', textDecoration: 'none' }}>
                Vedi dettagli
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
