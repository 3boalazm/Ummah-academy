/** FaqPage — italiano. */
import { lp } from '@/i18n';

export default {
  groups: [
    {
      id: 'start',
      title: 'Per iniziare',
      items: [
        { q: 'Quanto velocemente rispondete?', a: 'Su WhatsApp, di solito in pochi minuti — sempre entro 2 ore, in ogni fuso orario.' },
        { q: 'Le 2 lezioni di prova sono davvero gratuite?', a: 'Sì — completamente gratuite, senza carta e senza impegno.' },
        { q: 'Cosa succede dopo la prova?', a: 'Se vuoi continuare, scegli un piano mensile. Altrimenti, non c’è nulla da disdire.' },
        { q: 'Posso chiedere un insegnante in particolare?', a: 'Sì — indica il nome al momento della prenotazione e faremo del nostro meglio.' },
      ],
    },
    {
      id: 'method',
      title: 'Corsi e metodo',
      items: [
        { q: 'E se non parlo arabo?', a: 'Ogni insegnante è perfettamente bilingue arabo-inglese; al momento non offriamo lezioni in italiano. Molti studenti partono da zero.' },
        {
          q: 'Cosa rende diverso il vostro approccio?',
          a: 'Il metodo Itqan: padronanza e riflessione (tadabbur), non solo recitazione — versetti raggruppati per tema e correzione in tempo reale invece della ripetizione meccanica.',
        },
        {
          q: 'Ricevo un certificato o un’ijaza?',
          a: 'Ogni studente riceve un certificato per ogni livello. Chi studia recitazione e hifz può puntare a un’ijaza formale, con una catena documentata che risale al Profeta ﷺ.',
        },
      ],
    },
    {
      id: 'teachers',
      title: 'Insegnanti',
      items: [
        { q: 'Chi sono i vostri insegnanti?', a: 'Laureati dell’Università al-Azhar con ijaza, con esperienza sia con studenti arabofoni sia con chi non parla arabo.' },
        { q: 'Posso chiedere un’insegnante donna per mia figlia o mia moglie?', a: 'Sì — insegnanti donne dedicate a donne e bambini, in un ambiente riservato e rispettoso della fede.' },
      ],
    },
    {
      id: 'schedule',
      title: 'Orari e tecnologia',
      items: [
        { q: 'Su quale piattaforma si svolgono le lezioni?', a: 'Su Zoom o Google Meet, con una lavagna interattiva per annotare il Tajweed.' },
        { q: 'E se salto una lezione?', a: 'Spostala gratuitamente con 24 ore di preavviso: una lezione saltata non è una lezione persa.' },
        { q: 'Coprite il mio fuso orario?', a: 'Sì — le lezioni si tengono a ogni ora, così prenoti l’orario che ti è davvero comodo.' },
      ],
    },
    {
      id: 'family',
      title: 'Famiglia e bambini',
      items: [
        { q: 'Mio figlio ha 5 anni: è troppo piccolo?', a: 'Per niente — Ummah Cubs accoglie i bambini dai 5 anni con lezioni brevi e giocose da 30 minuti.' },
        {
          q: 'Posso seguire i progressi di mio figlio?',
          a: 'Un resoconto dopo ogni lezione e badge mensili, con un unico account nell’Area famiglie per tutti i tuoi figli; la dashboard in tempo reale e l’archivio delle registrazioni arriveranno a breve.',
        },
      ],
    },
    {
      id: 'pricing',
      title: 'Prezzi e pagamenti',
      items: [
        {
          q: 'Quanto costa?',
          a: `Da 40 $ a 128 $ al mese, in base a durata e frequenza delle lezioni — ogni piano inizia con 2 lezioni gratuite. Vedi i <a href="${lp('it', '/pricing/')}">prezzi</a>.`,
        },
        { q: 'Posso disdire o mettere in pausa?', a: 'Sì — disdetta quando vuoi (con effetto alla fine del mese di fatturazione) oppure sospensione temporanea dell’abbonamento.' },
        { q: 'Quali metodi di pagamento accettate?', a: 'Visa, Mastercard, PayPal, bonifico bancario, Western Union e MoneyGram.' },
      ],
    },
  ],
  C: {
    meta: {
      title: 'FAQ sulle lezioni di Corano | Ummah Academy',
      desc: 'Le risposte alle domande più frequenti delle famiglie: prova gratuita, insegnanti, insegnanti donne, fusi orari, bambini dai 5 anni, certificati, prezzi e pagamenti.',
    },
    eyebrow: 'Aiuto',
    title: 'Domande <span class="accent">frequenti</span>',
    lede: 'Tutto quello che devi sapere prima — e dopo — aver iniziato.',
    topics: 'Argomenti delle FAQ',
    ctaTitle: 'Hai ancora una domanda? <span class="accent">Scrivici su WhatsApp.</span>',
    ctaLede: 'Persone vere, risposte rapide — in inglese o in arabo.',
  },
};
