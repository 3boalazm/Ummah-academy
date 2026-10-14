/** TeacherProfile — italiano. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher, first: string) => ({
    teachers: 'Insegnanti',
    book: `Prenota una lezione gratuita con ${first}`,
    ask: `Chiedi le disponibilità di ${first}`,
    waText: `Assalamu alaikum, vorrei prenotare una lezione di prova con ${t.name}. Quali orari sono disponibili?`,
    verified: t.ijazah ? 'Ijaza verificata' : 'Titoli verificati',
    creds: 'Titoli',
    bestFor: 'Ideale per',
    sanadTitle: 'La sua catena di trasmissione',
    sanadText: `${first} ha un’ijaza in Hafs ’an ’Asim — una catena documentata di maestri, ciascuno istruito dal precedente, che risale fino al Profeta ﷺ.`,
    sanadNote: 'Verifichiamo direttamente la catena di ogni insegnante — mai sulla parola.',
    sanadMore: 'Cosa significa davvero un’ijaza',
    sanadHref: '/it/blog/che-cos-e-un-ijaza-certificazione-coranica-e-sanad/',
    vetTitle: 'Come si è guadagnata il suo posto',
    vet: [
      { icon: 'files', title: 'Esame della candidatura', text: 'Titoli e appartenenza ad al-Azhar verificati prima di qualsiasi colloquio.' },
      {
        icon: 'scroll',
        title: t.ijazah ? 'Verifica di ijaza e sanad' : 'Verifica dei titoli',
        text: t.ijazah ? 'La sua catena di trasmissione è stata controllata direttamente.' : 'I suoi titoli sono stati verificati direttamente presso gli enti che li hanno rilasciati.',
      },
      { icon: 'chalkboard-teacher', title: 'Lezione di prova dal vivo', text: 'Prima dell’approvazione ha tenuto una vera lezione.' },
      { icon: 'chart-line-up', title: 'Valutazione continua', text: 'La qualità dell’insegnamento viene verificata di continuo — non solo all’assunzione.' },
    ],
    teachesTitle: `Cosa insegna ${first}`,
    storiesTitle: `Cosa dicono le famiglie di ${first}`,
    bookTitle: `Prenotare con ${first}`,
    steps: [
      { icon: 'cursor-click', title: 'Sceglila nel modulo di prenotazione', text: 'Il suo nome è già inserito. Dicci per chi sono le lezioni e il tuo fuso orario.' },
      { icon: 'whatsapp-logo', title: 'Confermiamo i suoi orari su WhatsApp', text: 'Se nel tuo orario la sua agenda è piena, te lo diciamo con sincerità e ti proponiamo l’alternativa più vicina.' },
      { icon: 'gift', title: 'Due lezioni gratuite, poi decidi', text: 'Nessuna carta, nessun impegno. Continui solo se ti trovi bene.' },
    ],
    faqTitle: 'Domande sulla prenotazione',
    faq: [
      {
        q: `Posso scegliere proprio ${first}?`,
        a: 'Sì. Sceglila nel modulo di prenotazione (l’abbiamo già compilato) e confermeremo la sua disponibilità per il tuo fuso orario su WhatsApp prima della prima lezione.',
      },
      { q: 'Posso cambiare insegnante in seguito?', a: 'Sì. Se non ti trovi bene, scrivicelo su WhatsApp e cercheremo un abbinamento migliore.' },
      { q: 'In che lingua insegna?', a: `${first} insegna in arabo e in inglese, e sceglie la lingua delle spiegazioni in base allo studente e alla sua età. Al momento non offriamo lezioni in italiano.` },
    ],
    othersTitle: 'Le altre responsabili di dipartimento',
    ctaTitle: `Inizia con <span class="accent">${first}</span> questa settimana.`,
    ctaLede: 'Le prime 2 lezioni sono gratuite. Confermiamo gli orari su WhatsApp in pochi minuti.',
  }),
  meta: (t: Teacher) => ({
    title: `${t.name} — ${t.role} | Ummah Academy`,
    desc: `${t.name}, ${t.role} presso Ummah Academy: ${t.specialty}. I suoi titoli, per chi è più indicata e come prenotare 2 lezioni gratuite con lei.`,
  }),
};
