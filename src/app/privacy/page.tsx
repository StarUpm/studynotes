import Layout from '@/app/components/Layout'

export default function Privacy() {
  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 32 }}>Ultimo aggiornamento: Giugno 2026</p>

        {[
          {
            titolo: '1. Titolare del trattamento',
            testo: 'Il titolare del trattamento dei dati personali è Klass, raggiungibile all\'indirizzo email: privacy@klass.it. I dati personali degli utenti sono trattati nel rispetto del Regolamento Europeo 2016/679 (GDPR).'
          },
          {
            titolo: '2. Dati raccolti',
            testo: 'Raccogliamo i seguenti dati: nome e cognome, indirizzo email, foto profilo (facoltativa), università o scuola frequentata, anno di corso, curriculum e competenze (facoltativi), dati di pagamento (gestiti da Stripe, non conservati da noi), contenuti caricati (appunti in PDF), messaggi inviati tramite la chat interna.'
          },
          {
            titolo: '3. Finalità del trattamento',
            testo: 'I dati vengono utilizzati per: fornire e migliorare i servizi della piattaforma, gestire l\'account e l\'autenticazione, elaborare pagamenti e abbonamenti, inviare notifiche relative all\'uso del servizio, garantire la sicurezza della piattaforma.'
          },
          {
            titolo: '4. Base giuridica',
            testo: 'Il trattamento si basa su: esecuzione del contratto (fornitura del servizio), consenso dell\'utente (per comunicazioni facoltative), legittimo interesse (sicurezza e prevenzione frodi), obbligo legale (conservazione dati fiscali).'
          },
          {
            titolo: '5. Conservazione dei dati',
            testo: 'I dati vengono conservati per tutta la durata dell\'account e per un periodo massimo di 5 anni dalla cancellazione, salvo obblighi di legge. I dati di pagamento sono gestiti esclusivamente da Stripe e non vengono conservati sui nostri server.'
          },
          {
            titolo: '6. Condivisione dei dati',
            testo: 'I dati non vengono venduti a terzi. Vengono condivisi solo con: Supabase (database e autenticazione), Stripe (pagamenti), Whereby (videochiamate), Google (autenticazione OAuth e AI), Vercel (hosting). Tutti i fornitori operano in conformità al GDPR.'
          },
          {
            titolo: '7. Diritti dell\'utente',
            testo: 'L\'utente ha diritto di: accedere ai propri dati, rettificarli o aggiornarli, richiederne la cancellazione, opporsi al trattamento, richiedere la portabilità dei dati, revocare il consenso in qualsiasi momento. Per esercitare questi diritti, contatta: privacy@klass.it'
          },
          {
            titolo: '8. Cookie',
            testo: 'Utilizziamo cookie tecnici necessari al funzionamento del sito e cookie analitici per migliorare l\'esperienza utente. Per maggiori informazioni consulta la nostra Cookie Policy.'
          },
          {
            titolo: '9. Sicurezza',
            testo: 'Adottiamo misure tecniche e organizzative per proteggere i dati degli utenti, inclusa la crittografia dei dati in transito (HTTPS) e a riposo, e l\'accesso limitato ai dati da parte del personale autorizzato.'
          },
          {
            titolo: '10. Modifiche',
            testo: 'Ci riserviamo il diritto di aggiornare questa Privacy Policy. Le modifiche significative verranno comunicate via email o tramite notifica sulla piattaforma.'
          }
        ].map(function(s) {
          return (
            <div key={s.titolo} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{s.titolo}</h2>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{s.testo}</p>
            </div>
          )
        })}

        <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 12, padding: 20, marginTop: 32 }}>
          <p style={{ fontSize: 13, color: '#185FA5' }}>Per domande sulla privacy contattaci a <strong>privacy@klass.it</strong></p>
        </div>
      </div>
    </Layout>
  )
}
