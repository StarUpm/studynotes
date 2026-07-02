'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/app/components/Layout'

type Schema = { titolo: string; sezioni: { sottotema: string; punti: string[] }[] }

export default function SchemaRisultato() {
  const [schema, setSchema] = useState<Schema | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('klass_schema')
    if (saved) {
      setSchema(JSON.parse(saved))
      async function addPoints() {
        const userData = await supabase.auth.getUser()
        if (userData.data.user) {
          await fetch('/api/punti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente_id: userData.data.user.id, azione: 'schema_generato' }) })
        }
      }
      addPoints()
    } else { router.push('/studia/schema') }
  }, [router])

  if (!schema) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><p style={{ color: '#A1A1AA', fontSize: 13 }}>Caricamento...</p></div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <button onClick={() => router.push('/studia/schema')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: 13, cursor: 'pointer', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
              Torna a Schema
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: 0, letterSpacing: -0.5 }}>{schema.titolo}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} style={{ fontSize: 13, background: 'white', color: '#18181B', border: '0.5px solid #E4E4E7', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-printer" style={{ fontSize: 15 }} />
              Stampa
            </button>
            <button onClick={() => router.push('/studia')} style={{ fontSize: 13, background: '#18181B', color: 'white', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
              Nuovo studio
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {schema.sezioni.map(function(sezione, i) {
            return (
              <div key={i} style={{ background: 'white', border: '0.5px solid #E4E4E7', borderRadius: 14, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F4B860', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#412402', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 500, color: '#18181B', margin: 0 }}>{sezione.sottotema}</h2>
                </div>
                <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
                  {sezione.punti.map(function(punto, j) {
                    return (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D85A30', flexShrink: 0, marginTop: 5 }} />
                        <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{punto}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: '#15803D', margin: 0 }}>Hai guadagnato <strong>15 punti</strong> per aver generato questo schema!</p>
        </div>
      </div>
    </Layout>
  )
}
