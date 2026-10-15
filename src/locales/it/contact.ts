/** Contact — italiano. */
import { prices } from '@/data/prices';

const P = prices('it');

export default {
  C: {
    allFaq: 'Tutte le domande frequenti',
    meta: {
      title: 'Prenota 2 lezioni di prova gratuite | Contatti Ummah Academy',
      desc: 'Prenota in meno di un minuto due lezioni di prova gratuite, individuali e dal vivo, con un insegnante di al-Azhar. Confermiamo insegnante e orario su WhatsApp.',
    },
    eyebrow: 'Prova gratuita',
    title: 'Prenota le tue <span class="accent">due lezioni gratuite</span>',
    lede: 'Tre brevi passaggi, poi confermiamo con te insegnante e orario su WhatsApp.',
    gets: [
      ['video-camera', 'Due lezioni individuali dal vivo', 'Nessuna registrazione, nessun gruppo: il tuo insegnante è tutto per te.'],
      ['user-circle-check', 'Un insegnante scelto per te', 'In base a obiettivo, età e orari — un’insegnante donna su richiesta.'],
      ['hand-coins', 'Nessun pagamento, nessun impegno', 'Nessuna carta, nessun contratto. Continui solo se ti piace.'],
    ],
    direct: 'Preferisci contattarci direttamente?',
    next: 'Cosa succede dopo?',
    steps: [
      ['Ti scriviamo su WhatsApp', 'Di solito in pochi minuti, sempre entro 2 ore, per confermare insegnante e orario.'],
      ['Ricevi il link della lezione', 'Zoom o Google Meet, con un promemoria 15 minuti prima.'],
      ['Segui due lezioni gratuite', 'Il tuo insegnante valuta il tuo livello e ti propone un piano — poi decidi tu, senza pressioni.'],
    ],
    faqTitle: 'Domande sulla prova',
    faq: [
      { q: 'Le due lezioni sono davvero gratuite?', a: 'Del tutto. Nessuna carta e nessun impegno: solo il tuo nome e il tuo numero WhatsApp.' },
      { q: 'Posso chiedere un insegnante in particolare?', a: 'Sì — scrivi il nome nelle note, oppure usa «Prenota con…» nella pagina Insegnanti. Faremo del nostro meglio.' },
      { q: 'Su quale piattaforma si svolgono le lezioni?', a: 'Su Zoom o Google Meet, con una lavagna interattiva per annotare la recitazione e la scrittura.' },
      { q: 'Mio figlio ha 5 anni: è troppo piccolo?', a: 'Per niente. Ummah Cubs accoglie i bambini dai 5 anni con lezioni giocose da 30 minuti.' },
      { q: 'Cosa succede dopo le due lezioni?', a: `Se vuoi continuare, scegli un piano mensile (da ${P.from}). Puoi mettere in pausa o disdire quando vuoi.` },
    ],
  },
};
