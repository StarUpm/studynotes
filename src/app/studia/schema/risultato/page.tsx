'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout'

type Schema = {
  titolo: string
  sezioni: { sottotema: string; punti: string[] }[]
}

export default function SchemaRisultato() {
  const [schema, setSchema] = useState<Schema | null>(null)
  const [config, setConfig] = useState<{ tipoSchema: string; dettaglio: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const stampaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(function() {
    const saved = sessionStorage.getItem('klass_schema')
    const savedConfig = sessionStorage.getItem('klass_schema_config')
    if (saved) {
      setSchema(JSON.parse(saved))
    } else {
      router.push('/studia/schema')
    }
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
    setLoading(false)
  }, [router])

  function stampa() {
    window.print()
  }

  function scaricaTesto() {
    if (!schema) return
    let testo = schema.titolo + '\n\n'
    schema.sezioni.forEach(function(s) {
      testo += s.sottotema + '\n'
      s.punti.forEach(function(p) {
        testo += '  • ' + p + '\n'
      })
      testo += '\n'
    })
    const blob = new Blob([testo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = schema.titolo + '.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function copiaTesto() {
    if (!schema) return
    let testo = schema.titolo + '\n\n'
    schema.sezioni.forEach(function(s) {
      testo += s.sottotema + '\n'
      s.punti.forEach(function(p) {
        testo += '  • ' + p + '\n'
      })
      testo += '\n'
    })
    navigator.clipboard.writeText(testo)
    alert('Schema copiato negli appunti!')
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <p style={{ color: '#9CA3AF' }}>Caricamento schema...</p>
        </div>
      </Layout>
    )
  }

  if (!schema) return null

  const tipoLabel = config?.tipoSchema === 'mappa' ? 'Mappa concettuale'
    : config?.tipoSchema === 'discorsivo' ? 'Schema discorsivo'
    : config?.tipoSchema === 'tabella' ? 'Tabella comparativa'
    : 'Schema a punti'

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <button onClick={function() { router.push('/studia/schema') }} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
          ← Genera un nuovo schema
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🗺️ Schema generato</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>{tipoLabel} · {config?.dettaglio || 'medio'}</p>

        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '0.5px solid #e5e7eb' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{schema.titolo}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={copiaTesto}
                style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                📋 Copia
              </button>
              <button
                onClick={stampa}
                style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🖨️ Stampa
              </button>
              <button
                onClick={scaricaTesto}
                style={{ background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ⬇️ Scarica
              </button>
            </div>
          </div>

          <div ref={stampaRef} style={{ padding: 32 }}>
            {config?.tipoSchema === 'mappa' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{ background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, marginBottom: 0, textAlign: 'center' }}>
                  {schema.titolo}
                </div>
                <div style={{ width: 2, height: 24, background: '#e5e7eb' }} />
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(schema.sezioni.length, 3)}, 1fr)`, gap: 12, width: '100%' }}>
                  {schema.sezioni.map(function(sezione, i) {
                    const colors = ['#EFF6FF', '#EEEDFE', '#ECFDF5', '#FFFBEB']
                    const textColors = ['#185FA5', '#534AB7', '#059669', '#B45309']
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: colors[i % 4], border: `0.5px solid`, borderColor: colors[i % 4], color: textColors[i % 4], padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', width: '100%' }}>
                          {sezione.sottotema}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                          {sezione.punti.map(function(punto, j) {
                            return (
                              <div key={j} style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 11, color: '#6B7280', textAlign: 'center' }}>
                                {punto}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {config?.tipoSchema === 'discorsivo' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 20, paddingBottom: 10, borderBottom: '3px solid #1D9E75' }}>
                  {schema.titolo}
                </h2>
                {schema.sezioni.map(function(sezione, i) {
                  return (
                    <div key={i} style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 4, height: 18, background: '#1D9E75', borderRadius: 2 }} />
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>{i + 1}. {sezione.sottotema}</h3>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {sezione.punti.map(function(punto, j) {
                          return (
                            <li key={j} style={{ fontSize: 14, color: '#374151', padding: '5px 0 5px 16px', position: 'relative', lineHeight: 1.7 }}>
                              <span style={{ position: 'absolute', left: 0, color: '#1D9E75', fontWeight: 700 }}>→</span>
                              {punto}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}

            {config?.tipoSchema === 'tabella' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{schema.titolo}</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', color: 'white', padding: '12px 16px', fontSize: 13, fontWeight: 600, textAlign: 'left', borderRadius: '8px 0 0 0' }}>Argomento</th>
                      <th style={{ background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', color: 'white', padding: '12px 16px', fontSize: 13, fontWeight: 600, textAlign: 'left', borderRadius: '0 8px 0 0' }}>Dettagli</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.sezioni.map(function(sezione, i) {
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0F6E56', borderBottom: '0.5px solid #e5e7eb', verticalAlign: 'top' }}>
                            {sezione.sottotema}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '0.5px solid #e5e7eb' }}>
                            {sezione.punti.join(' · ')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {(!config?.tipoSchema || config?.tipoSchema === 'punti') && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>{schema.titolo}</h2>
                {schema.sezioni.map(function(sezione, i) {
                  return (
                    <div key={i} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F6E56', marginBottom: 8 }}>{i + 1}. {sezione.sottotema}</p>
                      <div style={{ paddingLeft: 16 }}>
                        {sezione.punti.map(function(punto, j) {
                          return (
                            <div key={j} style={{ fontSize: 13, color: '#374151', padding: '4px 0 4px 12px', position: 'relative', lineHeight: 1.6 }}>
                              <span style={{ position: 'absolute', left: 0, color: '#1D9E75' }}>•</span>
                              {punto}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
          <button
            onClick={function() { router.push('/studia/schema') }}
            style={{ background: 'white', color: '#374151', border: '0.5px solid #e5e7eb', padding: '11px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
          >
            ← Genera nuovo schema
          </button>
          <button
            onClick={function() { router.push('/studia') }}
            style={{ background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', color: 'white', border: 'none', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Torna a Studia con AI
          </button>
        </div>
      </div>
    </Layout>
  )
}
