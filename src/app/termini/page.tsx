import Layout from '@/app/components/Layout'

export default function Termini() {
  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Termini e Condizioni</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 32 }}>Ultimo aggiornamento: Giugno 2026</p>

        {[
          {
            titolo: '1. Accettazione dei termini',
            testo: 'Utilizzando Klass accetti integralmente questi Termini e Condizioni. Se non accetti, ti invitiamo a non utilizzare il servizio. L\'uso continuato della piattaforma costituisce accettazione di eventuali modifiche ai presenti termini.'
          },
          {
            titolo: '2. Descrizione del servizio',
            testo: 'Klass è una piattaforma educativa che permette agli utenti di: caricare e vendere appunti universitari e scolastici, acquistare appunti di altri studenti, prenotare sessioni di ripetizioni con tutor, studiare con strumenti AI (quiz, flashcard, schemi), partecipare a un forum Q&A e una chat tra studenti.'
          },
          {
            titolo: '3. Registrazione e account',
            testo: 'Per utilizzare Klass è necessario registrarsi fornendo dati veritieri e aggiornati. L\'utente è responsabile della sicurezza del proprio account e di tutte le attività che vi si svolgono. È vietata la creazione di account multipli o falsi.'
          },
          {
            titolo: '4. Contenuti caricati',
            testo: 'L\'utente che carica contenuti dichiara di essere il legittimo autore o di avere i diritti necessari per condividerli. È vietato caricare: materiale protetto da copyright senza autorizzazione, contenuti falsi o fuorvianti, materiale offensivo o illegale. Klass si riserva il diritto di rimuovere contenuti che violano questi termini.'
          },
          {
            titolo: '5. Commissioni e pagamenti',
            testo: 'Klass trattiene una commissione del 20% su ogni vendita di appunti e su ogni sessione di tutoraggio completata. I pagamenti vengono elaborati tramite Stripe. I guadagni vengono accreditati entro 7 giorni lavorativi dalla completamento della transazione. Le tariffe di abbonamento Premium sono indicate nella pagina dedicata e possono variare nel tempo.'
          },
          {
            titolo: '6. Abbonamento Premium',
            testo: 'L\'abbonamento Premium si rinnova automaticamente alla scadenza. L\'utente può cancellare il rinnovo automatico in qualsiasi momento dalla propria area personale. Non sono previsti rimborsi per i periodi già pagati, salvo nei casi previsti dalla legge. Klass si riserva il diritto di modificare i piani e i prezzi con preavviso di 30 giorni.'
          },
          {
            titolo: '7. Sessioni di tutoraggio',
            testo: 'Le sessioni di tutoraggio avvengono tramite videochiamata integrata. Il pagamento viene trattenuto fino al completamento della sessione. In caso di cancellazione con meno di 24 ore di preavviso, il tutor ha diritto al 50% del compenso. Klass non è responsabile della qualità delle sessioni ma fornisce un sistema di recensioni per garantire la qualità del servizio.'
          },
          {
            titolo: '8. Comportamento degli utenti',
            testo: 'È vietato: condividere informazioni false o fuorvianti, molestare altri utenti, tentare di aggirare il sistema di pagamento, usare la piattaforma per attività illegali, fare spam o pubblicità non autorizzata. La violazione di queste regole può comportare la sospensione o cancellazione dell\'account.'
          },
          {
            titolo: '9. Limitazione di responsabilità',
            testo: 'Klass non garantisce la correttezza dei contenuti caricati dagli utenti. Non siamo responsabili per eventuali danni derivanti dall\'uso della piattaforma o dalla qualità dei contenuti e delle sessioni. Il servizio è fornito "così com\'è" senza garanzie implicite.'
          },
          {
            titolo: '10. Proprietà intellettuale',
            testo: 'Il marchio Klass, il logo e tutti i contenuti della piattaforma sono di proprietà di Klass. Gli utenti mantengono la proprietà dei contenuti che caricano, ma concedono a Klass una licenza non esclusiva per visualizzarli e distribuirli sulla piattaforma.'
          },
          {
            titolo: '11. Legge applicabile',
            testo: 'Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Milano, salvo diversa disposizione di legge a tutela del consumatore.'
          },
          {
            titolo: '12. Contatti',
            testo: 'Per qualsiasi domanda sui presenti Termini e Condizioni contattaci a: legal@klass.it'
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
          <p style={{ fontSize: 13, color: '#185FA5' }}>Per domande legali contattaci a <strong>legal@klass.it</strong></p>
        </div>
      </div>
    </Layout>
  )
}
