/**
 * Informativa sulla privacy e Termini di servizio — traduzione italiana fornita per comodità.
 * Fa fede esclusivamente la versione inglese (indicato sulla pagina). Revisione legale: Linear ABO-44.
 * `{email}` e `{pricing}` vengono sostituiti al momento del rendering.
 */
import type { LegalContent } from '@/content-i18n/legal';

const EMAIL = '<a href="mailto:{email}">{email}</a>';

const privacy: LegalContent = {
  meta: { title: 'Informativa sulla privacy | Ummah Academy', desc: 'Come Ummah Academy raccoglie, usa e protegge le tue informazioni — compresa la privacy dei minori, le registrazioni, i pagamenti e i tuoi diritti.' },
  title: 'Informativa sulla privacy',
  lede: 'Come raccogliamo, usiamo e proteggiamo le tue informazioni.',
  updated: 'Ultimo aggiornamento: luglio 2026',
  intro: 'Ummah Academy («noi», «nostro») offre lezioni online individuali e dal vivo di Corano, lingua araba e studi islamici a studenti in oltre 50 paesi. La presente informativa sulla privacy spiega quali informazioni raccogliamo, come le usiamo e quali scelte e diritti hai.',
  sections: [
    {
      h: '1. Informazioni che raccogliamo',
      html: `<p>Raccogliamo le informazioni che ci fornisci direttamente, tra cui:</p><ul>
<li><strong>Dati di registrazione:</strong> il tuo nome, numero WhatsApp, indirizzo e-mail, paese o fuso orario e il corso o percorso che ti interessa.</li>
<li><strong>Dati dell’Area famiglie:</strong> se registri un figlio (ad esempio per il programma Ummah Cubs), raccogliamo nome, età e progressi del minore, gestiti tramite l’account del genitore o del tutore legale.</li>
<li><strong>Dati delle lezioni:</strong> le lezioni dal vivo vengono registrate e conservate affinché studenti e genitori possano rivederle; gli insegnanti preparano inoltre resoconti dei progressi dopo ogni lezione.</li>
<li><strong>Dati di pagamento:</strong> quando sottoscrivi un piano a pagamento, il pagamento viene elaborato dai nostri fornitori di servizi di pagamento (che possono includere circuiti di carte, PayPal, bonifico bancario, Western Union o MoneyGram). Non conserviamo i dati completi della tua carta sui nostri server.</li>
<li><strong>Comunicazioni:</strong> i messaggi che ci invii tramite WhatsApp, e-mail o i nostri canali di contatto, compresi i promemoria delle lezioni e gli avvisi di rinnovo che ti inviamo.</li></ul>`,
    },
    { h: '2. Come usiamo le tue informazioni', html: '<p>Usiamo le informazioni raccolte per: programmare e tenere le lezioni dal vivo; abbinarti a un insegnante e a un livello adatti; inviare promemoria e resoconti dei progressi tramite WhatsApp ed e-mail; elaborare i pagamenti e gestire gli abbonamenti; rilasciare certificati e attestazioni di ijaza, ove previsto; e migliorare i nostri corsi e la nostra piattaforma.</p>' },
    { h: '3. Privacy dei minori', html: '<p>Il nostro programma Ummah Cubs è pensato per bambini a partire dai 5 anni. Gli account dei minori vengono creati e gestiti da un genitore o tutore legale tramite l’Area famiglie. I genitori possono in qualsiasi momento consultare le registrazioni e i resoconti e gestire la fatturazione dei propri figli. Non raccogliamo consapevolmente informazioni direttamente da un minore senza il coinvolgimento di un genitore o tutore.</p>' },
    { h: '4. Condivisione delle informazioni', html: '<p>Non vendiamo i tuoi dati personali. Condividiamo le informazioni solo con: i fornitori di servizi di pagamento, per completare le transazioni; WhatsApp, per recapitare i messaggi e i promemoria che hai accettato; e gli insegnanti, nella misura necessaria per le tue lezioni e i tuoi resoconti. Possiamo inoltre divulgare informazioni se richiesto dalla legge.</p>' },
    { h: '5. Conservazione e sicurezza dei dati', html: '<p>Conserviamo i dati dell’account, delle lezioni e dei pagamenti finché il tuo account è attivo e, successivamente, per un periodo ragionevole a fini di archiviazione e per motivi legali. Adottiamo misure tecniche e organizzative ragionevoli per proteggere le tue informazioni, ma nessun servizio online può garantire una sicurezza assoluta.</p>' },
    { h: '6. I tuoi diritti', html: '<p>A seconda del luogo in cui vivi, potresti avere il diritto di accedere ai tuoi dati personali, rettificarli, esportarli o chiederne la cancellazione, nonché di opporti a determinati trattamenti o di limitarli. Per esercitare uno di questi diritti, contattaci tramite i recapiti indicati di seguito.</p>' },
    { h: '7. Cookie', html: '<p>Il nostro sito utilizza cookie e tecnologie simili per mantenerti connesso, ricordare le tue preferenze e capire come viene utilizzato il sito. Puoi gestire i cookie dalle impostazioni del tuo browser.</p>' },
    { h: '8. Trasferimenti internazionali di dati', html: '<p>Poiché seguiamo studenti in oltre 50 paesi, le tue informazioni potrebbero essere trattate in un paese diverso da quello in cui vivi. In tal caso, adottiamo misure affinché le tue informazioni restino protette in conformità con la presente informativa.</p>' },
    { h: '9. Modifiche a questa informativa', html: '<p>Potremmo aggiornare la presente informativa sulla privacy di tanto in tanto. Eventuali modifiche saranno pubblicate su questa pagina con una data di ultimo aggiornamento aggiornata.</p>' },
    { h: '10. Contatti', html: `<p>Per domande sulla presente informativa o sul modo in cui trattiamo le tue informazioni, scrivici a ${EMAIL} o su WhatsApp.</p>` },
  ],
  note: 'Nota: questa informativa è un modello generale basato sui servizi descritti sul nostro sito. Non sostituisce una consulenza legale specifica per la tua situazione o il tuo paese.',
};

const terms: LegalContent = {
  meta: { title: 'Termini di servizio | Ummah Academy', desc: 'I termini che regolano il sito e le lezioni online dal vivo di Ummah Academy: prova gratuita, abbonamenti, disdetta, spostamenti, registrazioni e regole di comportamento.' },
  title: 'Termini di servizio',
  lede: 'I termini che regolano il tuo utilizzo di Ummah Academy.',
  updated: 'Ultimo aggiornamento: luglio 2026',
  intro: 'I presenti Termini di servizio («Termini») regolano l’utilizzo del sito e dei servizi di formazione online dal vivo di Ummah Academy. Registrandoti a una prova gratuita o a un piano a pagamento, accetti i presenti Termini.',
  sections: [
    { h: '1. Il nostro servizio', html: '<p>Ummah Academy offre lezioni online individuali e dal vivo di recitazione del Corano e Tajweed, lingua araba, studi islamici e il programma Ummah Cubs per bambini, tenute da insegnanti certificati di al-Azhar.</p>' },
    { h: '2. Prova gratuita', html: '<p>I nuovi studenti possono registrarsi a due lezioni di prova gratuite dal vivo, senza carta di pagamento. La prova gratuita è limitata a una per studente o famiglia ed è pensata per permetterti di valutare il nostro insegnamento prima di sottoscrivere un piano a pagamento.</p>' },
    { h: '3. Account e registrazione', html: '<p>Devi fornire dati di registrazione corretti (almeno nome e numero WhatsApp). Per i bambini del programma Ummah Cubs, l’account deve essere creato e gestito da un genitore o tutore legale tramite l’Area famiglie, che resta responsabile dell’account e del suo utilizzo.</p>' },
    { h: '4. Abbonamenti, tariffe e pagamento', html: '<p>I piani a pagamento vengono fatturati mensilmente in base al piano scelto. I metodi di pagamento accettati sono Visa, Mastercard, PayPal, bonifico bancario, Western Union e MoneyGram. Ci autorizzi (o autorizzi il nostro fornitore di servizi di pagamento) ad addebitare gli importi previsti per il piano scelto. I prezzi applicabili sono quelli indicati nella nostra <a href="{pricing}">pagina Prezzi</a> al momento dell’acquisto e possono cambiare per i periodi di fatturazione futuri, previo avviso.</p>' },
    { h: '5. Disdetta', html: '<p>Puoi disdire l’abbonamento in qualsiasi momento; la disdetta ha effetto alla fine del periodo di fatturazione in corso. Non offriamo rimborsi proporzionali per i mesi iniziati, salvo quanto previsto dalla legge applicabile.</p>' },
    { h: '6. Spostamento delle lezioni', html: '<p>Le lezioni possono essere spostate con almeno 24 ore di preavviso. Le lezioni annullate o saltate con un preavviso inferiore possono andare perse, a nostra discrezione, salvo casi di reale emergenza.</p>' },
    { h: '7. Registrazioni e proprietà intellettuale', html: '<p>Le lezioni dal vivo vengono registrate per tuo riferimento e conservate nel tuo account studente o nell’Area famiglie. Le registrazioni sono fornite esclusivamente per uso educativo personale e non possono essere ridistribuite, rivendute o pubblicate senza la nostra autorizzazione scritta. I materiali dei corsi, i programmi, il marchio e i contenuti del sito restano proprietà intellettuale di Ummah Academy.</p>' },
    { h: '8. Regole di comportamento', html: '<p>Chiediamo a tutti gli studenti, genitori e tutori di trattare insegnanti e personale con rispetto. Ci riserviamo il diritto di sospendere o chiudere gli account che adottano comportamenti offensivi, molestie o che usano i nostri servizi per scopi illeciti.</p>' },
    { h: '9. Qualifiche degli insegnanti e risultati formativi', html: '<p>I nostri insegnanti sono laureati dell’Università al-Azhar. Pur impegnandoci a offrire un insegnamento di alta qualità, i risultati individuali dipendono da molti fattori, tra cui l’impegno dello studente, la frequenza e il livello di partenza, e non possiamo garantire risultati o tempi specifici (ad esempio per la memorizzazione o il conseguimento dell’ijaza).</p>' },
    { h: '10. Limitazione di responsabilità', html: '<p>Nella misura massima consentita dalla legge, Ummah Academy non è responsabile per danni indiretti, incidentali o consequenziali derivanti dall’utilizzo dei nostri servizi. La nostra responsabilità complessiva per qualsiasi pretesa relativa ai nostri servizi è limitata all’importo che ci hai versato nei tre mesi precedenti la pretesa.</p>' },
    { h: '11. Cessazione', html: '<p>Possiamo sospendere o interrompere l’accesso ai nostri servizi per qualsiasi account che violi i presenti Termini. Puoi smettere di usare i nostri servizi e disdire l’abbonamento in qualsiasi momento, come descritto sopra.</p>' },
    { h: '12. Legge applicabile', html: '<p>I presenti Termini sono regolati dalla legge applicabile nel luogo in cui opera Ummah Academy, senza riguardo alle norme sui conflitti di legge, salvo quando la normativa a tutela dei consumatori del tuo paese disponga diversamente per gli studenti che vi risiedono.</p>' },
    { h: '13. Modifiche ai Termini', html: '<p>Potremmo aggiornare i presenti Termini di tanto in tanto. L’uso continuato dei nostri servizi dopo l’entrata in vigore delle modifiche costituisce accettazione dei Termini aggiornati.</p>' },
    { h: '14. Contatti', html: `<p>Le domande sui presenti Termini possono essere inviate a ${EMAIL} o su WhatsApp.</p>` },
  ],
  note: 'Nota: si tratta di un modello generale basato sui servizi descritti sul nostro sito. Non sostituisce una consulenza legale specifica per il tuo paese.',
};

export default { privacy, terms };
