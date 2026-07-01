import Layout from '@/app/components/Layout'

export default function Termini() {
  const sezioni = [
    { titolo: '1. Accettazione dei termini', testo: 'Utilizzando Klass accetti integralmente questi Termini e Condizioni. Se non accetti, ti invitiamo a non utilizzare il servizio. L\'uso continuato della piattaforma costituisce accettazione di eventuali modifiche.' },
    { titolo: '2. Descrizione del servizio', testo: 'Klass è una piattaforma educativa che permette di: caricare e vendere appunti, acquistare appunti di altri studenti, prenotare sessioni di ripetizioni con tutor, studiare con strumenti AI, partecipare a forum e chat tra studenti.' },
    { titolo: '3. Registrazione e account', testo: 'Per utilizzare Klass è necessario registrarsi fornendo dati veritieri e aggiornati. L\'utente è responsabile della sicurezza del proprio account. È vietata la creazione di account multipli o falsi.' },
    { titolo: '4. Contenuti caricati', testo: 'L\'utente che carica contenuti dichiara di essere il legittimo autore o di avere i diritti necessari. È vietato caricare materiale protetto da copyright senza autorizzazione, contenuti falsi o materiale offensivo. Klass si riserva il diritto di rimuovere contenuti che violano questi termini.' },
    { titolo: '5. Commissioni e pagamenti', testo: 'Klass trattiene una commissione del 20% su ogni vendita di appunti e su ogni sessione di tutoraggio. I pagamenti vengono elaborati tramite Stripe. I guadagni vengono accreditati entro 7 giorni lavorativi.' },
    { titolo: '6. Abbonamento Premium', testo: 'L\'abbonamento Premium si rinnova automaticamente alla scadenza. L\'utente può cancellare il rinnovo in qualsiasi momento. Non sono previsti rimborsi per i periodi già pagati, salvo nei casi previsti dalla legge.' },
    { titolo: '7. Sessioni di tutoraggio', testo: 'Le sessioni avvengono tramite videochiamata integrata. Il pagamento viene trattenuto fino al completamento. In caso di cancellazione con meno di 24 ore di preavviso, il tutor ha diritto al 50% del compenso.' },
    { titolo: '8. Comportamento degli utenti', testo: 'È vietato: condividere informazioni false, molestare altri utenti, tentare di aggirare il sistema di pagamento, usare la piattaforma per attività illegali. La violazione può comportare la sospensione dell\'account.' },
    { titolo: '9. Limitazione di responsabilità', testo: 'Klass non garantisce la correttezza dei contenuti caricati dagli utenti. Non siamo responsabili per eventuali danni derivanti dall\'uso della piattaforma. Il servizio è fornito "così com\'è" senza garanzie implicite.' },
    { titolo: '10. Proprietà intellettuale', testo: 'Il marchio Klass e tutti i contenuti della piattaforma sono di proprietà di Klass. Gli utenti mantengono la proprietà dei contenuti che caricano, ma concedono a Klass una licenza per visualizzarli e distribuirli.' },
    { titolo: '11. Legge applicabile', testo: 'Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Milano, salvo diversa disposizione di legge a tutela del consumatore.' },
    { titolo: '12. Contatti', testo: 'Per domande sui presenti Termini contattaci a: legal@klass.it' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Termini e Condizioni</h1>
        <p style={{ fontSize: 13, color: '#A1A1AA', margin: '0 0 36px' }}>Ultimo aggiornamento: Giugno 2026</p>
        <div style={{ borderTop: '0.5px solid #F4F4F5' }}>
          {sezioni.map(function(s) {
            return (
              <div key={s.titolo} style={{ padding: '24px 0', borderBottom: '0.5px solid #F4F4F5' }}>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: '#18181B', margin: '0 0 10px' }}>{s.titolo}</h2>
                <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.8, margin: 0 }}>{s.testo}</p>
              </div>
            )
          })}
        </div>
        <div style={{ background: '#FAFAFA', border: '0.5px solid #F4F4F5', borderRadius: 10, padding: '16px 20px', marginTop: 28 }}>
          <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Per domande legali contattaci a <span style={{ color: '#18181B', fontWeight: 500 }}>legal@klass.it</span></p>
        </div>
      </div>
    </Layout>
  )
}
