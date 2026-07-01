import Layout from '@/app/components/Layout'

export default function Privacy() {
  const sezioni = [
    { titolo: '1. Titolare del trattamento', testo: 'Il titolare del trattamento dei dati personali è Klass, raggiungibile all\'indirizzo email: privacy@klass.it. I dati personali degli utenti sono trattati nel rispetto del Regolamento Europeo 2016/679 (GDPR).' },
    { titolo: '2. Dati raccolti', testo: 'Raccogliamo: nome e cognome, indirizzo email, foto profilo (facoltativa), università o scuola frequentata, anno di corso, curriculum e competenze (facoltativi), dati di pagamento (gestiti da Stripe, non conservati da noi), contenuti caricati (appunti in PDF), messaggi inviati tramite la chat interna.' },
    { titolo: '3. Finalità del trattamento', testo: 'I dati vengono utilizzati per: fornire e migliorare i servizi della piattaforma, gestire l\'account e l\'autenticazione, elaborare pagamenti e abbonamenti, inviare notifiche relative all\'uso del servizio, garantire la sicurezza della piattaforma.' },
    { titolo: '4. Base giuridica', testo: 'Il trattamento si basa su: esecuzione del contratto (fornitura del servizio), consenso dell\'utente (per comunicazioni facoltative), legittimo interesse (sicurezza e prevenzione frodi), obbligo legale (conservazione dati fiscali).' },
    { titolo: '5. Conservazione dei dati', testo: 'I dati vengono conservati per tutta la durata dell\'account e per un periodo massimo di 5 anni dalla cancellazione, salvo obblighi di legge. I dati di pagamento sono gestiti esclusivamente da Stripe.' },
    { titolo: '6. Condivisione dei dati', testo: 'I dati non vengono venduti a terzi. Vengono condivisi solo con: Supabase (database), Stripe (pagamenti), Whereby (videochiamate), Google (autenticazione), Vercel (hosting). Tutti i fornitori operano in conformità al GDPR.' },
    { titolo: '7. Diritti dell\'utente', testo: 'L\'utente ha diritto di: accedere ai propri dati, rettificarli, richiederne la cancellazione, opporsi al trattamento, richiedere la portabilità dei dati, revocare il consenso. Per esercitare questi diritti: privacy@klass.it' },
    { titolo: '8. Cookie', testo: 'Utilizziamo cookie tecnici necessari al funzionamento del sito e cookie analitici per migliorare l\'esperienza utente.' },
    { titolo: '9. Sicurezza', testo: 'Adottiamo misure tecniche per proteggere i dati degli utenti, inclusa la crittografia dei dati in transito (HTTPS) e a riposo, e l\'accesso limitato ai dati da parte del personale autorizzato.' },
    { titolo: '10. Modifiche', testo: 'Ci riserviamo il diritto di aggiornare questa Privacy Policy. Le modifiche significative verranno comunicate via email o tramite notifica sulla piattaforma.' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#18181B', margin: '0 0 6px', letterSpacing: -0.5 }}>Privacy Policy</h1>
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
          <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Per domande sulla privacy contattaci a <span style={{ color: '#18181B', fontWeight: 500 }}>privacy@klass.it</span></p>
        </div>
      </div>
    </Layout>
  )
}
