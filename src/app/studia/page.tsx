'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/app/components/Layout'

export default function Studia() {
  const [testo, setTesto] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const imported = sessionStorage.getItem('klass_testo_importato')
    if (imported) { setTesto(imported); sessionStorage.removeItem('klass_testo_importato') }
  }, [])

  function avvia(tipo: string) {
    if (!testo && !file) return
    if (file) {
      const reader = new FileReader()
      reader.onload = function(e) {
        const text = e.target?.result as string
        sessionStorage.setItem('klass_testo_studio', text)
        router.push('/studia/' + tipo)
      }
      reader.readAsText(file)
    } else {
      sessionStorage.setItem('klass_testo_studio', testo)
      router.push('/studia/' + tipo)
    }
  }

  const strumenti = [
    { id: 'quiz', icon: 'ti-brain', label: 'Quiz', desc: 'Domande a risposta multipla per testare la tua preparazione', color: '#F4B860', textColor: '#412402' },
    { id: 'flashcard', icon: 'ti-cards', label: 'Flashcard', desc: 'Carte fronte/retro per memorizzare concetti e definizioni', color: '#7BC67A', textColor: '#173404' },
    { id: 'schema', icon: 'ti-sitemap', label: 'Schema', desc: 'Mappa gerarchica dei concetti principali del testo', color: '#7FB3E8', textColor: '#042C53' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Studia con AI</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '0 0 32px' }}>Incolla il testo o carica un PDF — l&apos;AI genera quiz, flashcard e schemi</p>

        <div style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#18181B', display: 'block', marginBottom: 8 }}>Testo degli appunti</label>
          <textarea
            placeholder="Incolla qui il testo dei tuoi appunti, una dispensa o il contenuto di un capitolo..."
            value={testo}
            onChange={e => setTesto(e.target.value)}
            rows={8}
            style={{ width: '100%', border: '0.5px solid #E4E4E7', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <i className="ti ti-file-text" style={{ fontSize: 15, color: '#A1A1AA' }} />
              Oppure carica un PDF
            </label>
            <input type="file" accept=".pdf,.txt" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 12 }} />
            {file && <span style={{ fontSize: 12, color: '#15803D' }}>✓ {file.name}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {strumenti.map(function(s) {
            const disabilitato = !testo && !file
            return (
              <button
                key={s.id}
                onClick={() => avvia(s.id)}
                disabled={disabilitato}
                style={{ background: disabilitato ? '#FAFAFA' : s.color, border: disabilitato ? '0.5px solid #F4F4F5' : 'none', borderRadius: 14, padding: '22px', textAlign: 'left', cursor: disabilitato ? 'default' : 'pointer', opacity: disabilitato ? 0.5 : 1 }}
              >
                <i className={`ti ${s.icon}`} style={{ fontSize: 22, color: disabilitato ? '#D4D4D8' : s.textColor }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: disabilitato ? '#A1A1AA' : '#18181B', margin: '14px 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: 11, color: disabilitato ? '#D4D4D8' : s.textColor, margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 32, borderTop: '0.5px solid #F4F4F5', paddingTop: 24 }}>
          <p style={{ fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 14px' }}>Altri strumenti</p>
          <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
            {[
              { icon: 'ti-bolt', label: 'Importa contenuti', desc: 'YouTube, foto, riassunti AI', href: '/importa' },
              { icon: 'ti-microphone', label: 'Trascrivi lezione', desc: 'Converti audio in testo', href: '/trascrivi' },
            ].map(function(item) {
              return (
                <button key={item.href} onClick={() => router.push(item.href)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid #F4F4F5', background: 'none', width: '100%', cursor: 'pointer' }}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: '#D85A30' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 13, color: '#18181B', margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                  <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#D4D4D8' }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
