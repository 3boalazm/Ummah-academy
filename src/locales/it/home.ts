/** Home — italiano. */
import { prices } from '@/data/prices';

const P = prices('it');

export default {
  C: {
    meta: {
      title: 'Corano e arabo online con insegnanti di al-Azhar | 2 lezioni gratuite | Ummah Academy',
      desc: 'Lezioni individuali dal vivo di Corano, Tajweed, arabo e studi islamici con insegnanti di al-Azhar con ijaza verificata. Per bambini e adulti, in ogni fuso orario: le prime 2 lezioni sono gratuite.',
    },
    eyebrow: 'Dal vivo, individuale · Studiosi di al-Azhar',
    title: 'Il Corano, insegnato <span class="accent">così come è stato trasmesso.</span>',
    lede: 'Lezioni individuali dal vivo di Corano, Tajweed, arabo e studi islamici con insegnanti di al-Azhar che hanno un’ijaza verificata — per bambini e adulti, nel tuo fuso orario.',
    test: 'Test di 3 minuti',
    reassure: ['Nessuna carta richiesta', 'Insegnanti donne disponibili', 'Metti in pausa o disdici quando vuoi'],
    card1: ['Tajweed · Livello 2', 'Lezione 12 di 18', 'Avanzamento'],
    card2: ['Prossima lezione dal vivo', 'Regole del nun sakina', 'Ustadha Omneya · 19:00 GMT', 'Inizia tra 2 h 14 min'],
    verified: 'Ijaza verificata',
    stats: [
      ['50+', 'paesi'],
      ['1.000+', 'studenti'],
      ['12+', 'ijaza conferite'],
      ['95%', 'continuano dopo il primo mese'],
    ],
    router: {
      title: 'Chi studierà?',
      lede: 'Diccelo e ti indichiamo il posto giusto con un clic.',
      childKicker: 'Per mio figlio',
      childTitle: 'Ummah Cubs · 5–14 anni',
      childText: 'Lezioni giocose da 30 minuti con insegnanti pazienti e preparati per i bambini — insegnanti donne disponibili, e progressi che vedi ogni mese.',
      childChips: ['Lezioni da 30 min', 'Giochi e storie', 'Badge mensili'],
      childCta: 'Scopri Ummah Cubs',
      selfKicker: 'Per me',
      selfTitle: 'Qual è il tuo obiettivo?',
      goals: [
        ['Leggere il Corano partendo da zero', '/online-arabic-classes/', 'read'],
        ['Perfezionare il mio Tajweed', '/quran-recitation-course/', 'tajweed'],
        ['Memorizzare e ottenere un’ijaza', '/quran-memorization-hifz/', 'hifz'],
        ['Capire l’arabo del Corano', '/online-arabic-classes/', 'arabic'],
        ['Studiare aqida, fiqh, tafsir o sira', '/online-islamic-studies-classes/', 'islamic'],
      ],
      unsure: 'Non sei sicuro? Fai il test di livello di 3 minuti',
    },
    why: {
      eyebrow: 'Perché Ummah Academy',
      title: 'Un sapere di cui conosci <span class="accent">l’origine.</span> Lezioni che si adattano alla tua vita.',
      sanadKicker: 'Sanad verificato',
      sanadTitle: 'Una catena di maestri che risale al Profeta ﷺ',
      sanadText: 'Ogni insegnante ha un’ijaza — una catena di trasmissione documentata — e supera una verifica in quattro fasi: titoli, verifica del sanad, lezione di prova dal vivo e valutazione continua.',
      sanadLink: 'Come selezioniamo gli insegnanti',
      itqan: ['Il metodo Itqan', 'Versetti raggruppati per tema e significato, corretti dal vivo — una memorizzazione che dura, non una recitazione di facciata.', 'Come funziona'],
      safe: ['Sicuro per ogni famiglia', 'Lezioni private individuali, insegnanti donne per donne e ragazze, e un resoconto dopo ogni lezione.'],
      time: ['Costruito sul tuo orario', 'Al mattino a Milano o la sera a New York — prenota quando vuoi, con un promemoria su WhatsApp 15 minuti prima.'],
      price: [`Da ${P.from} al mese`, 'Piani trasparenti. Prima due lezioni gratuite.', 'Vedi i prezzi'],
    },
    how: {
      eyebrow: 'Come funziona',
      title: 'Cosa succede <span class="accent">dopo la prenotazione</span>',
      lede: 'Nessuna registrazione infinita: un vero insegnante e due vere lezioni, poi decidi tu.',
      steps: [
        ['Raccontaci di te', 'Tre domande veloci: chi studia, cosa e quando. Circa un minuto.'],
        ['Troviamo il tuo insegnante', 'Confermiamo insegnante e orari su WhatsApp — di solito in pochi minuti, sempre entro 2 ore.'],
        ['Due lezioni gratuite dal vivo', 'Il tuo insegnante valuta il tuo livello e costruisce un piano intorno al tuo obiettivo.'],
        ['Impara e guarda i progressi', 'Un resoconto dopo ogni lezione e un certificato per ogni livello.'],
      ],
    },
    tracks: { eyebrow: 'Corsi', title: 'Quattro porte d’ingresso. <span class="accent">Parti da dove sei.</span>', lede: 'Dalla tua prima lettera araba fino a un’ijaza completa.' },
    stories: { eyebrow: 'Storie', title: 'Famiglie in oltre 50 paesi, <span class="accent">una classe alla volta.</span>', note: 'Testimonianze tradotte dall’inglese.' },
    pricing: {
      eyebrow: 'Prezzi',
      title: 'Prezzi semplici. <span class="accent">Prima due lezioni gratuite.</span>',
      text: 'Scegli lezioni da 30 minuti per i bambini e la pratica mirata, oppure da 60 minuti per adulti, Tajweed e hifz.',
      tabs: ['30 minuti', '60 minuti'],
      perSession: 'a lezione',
      all: 'Tutti i piani e i dettagli',
    },
    faq: {
      eyebrow: 'Domande',
      title: 'Prima di <span class="accent">prenotare</span>',
      more: 'Tutte le domande',
      items: [
        {
          q: 'Le due lezioni di prova sono davvero gratuite?',
          a: 'Sì. Due lezioni complete dal vivo con il tuo insegnante — senza carta e senza impegno. Se continui, scegli un piano mensile; altrimenti, finisce lì.',
        },
        {
          q: 'Quanto costa, e posso disdire?',
          a: `I piani vanno da ${P.from} a ${P.to} al mese, in base a durata e frequenza delle lezioni. Puoi disdire quando vuoi (con effetto alla fine del mese di fatturazione), sospendere l’abbonamento e spostare le lezioni con 24 ore di preavviso.`,
        },
        { q: 'Posso scegliere un’insegnante donna?', a: 'Sì. Ci sono insegnanti donne per donne e ragazze: basta scegliere «Insegnante donna» al momento della prenotazione.' },
        { q: 'Mio figlio è troppo piccolo?', a: 'Ummah Cubs accoglie i bambini dai 5 anni, con lezioni brevi e giocose da 30 minuti, pensate per l’attenzione dei più piccoli.' },
        {
          q: 'Non parlo arabo. Capirò?',
          a: 'Sì. Ogni insegnante è perfettamente bilingue arabo-inglese; al momento le lezioni non si tengono in italiano. Molti dei nostri studenti partono da zero.',
        },
        {
          q: 'Le lezioni sono dal vivo? Vengono registrate?',
          a: 'Ogni lezione è dal vivo e individuale, su Zoom o Google Meet. L’insegnante invia un resoconto dopo ogni lezione; le registrazioni sono disponibili su richiesta, in attesa dell’archivio nell’Area famiglie.',
        },
      ],
    },
    cta: {
      eyebrow: 'Inizia oggi',
      title: 'Inizia con <span class="accent">due lezioni gratuite.</span>',
      lede: 'Conosci il tuo insegnante, scopri la differenza di una lezione individuale dal vivo, poi decidi. Nessuna carta, nessun impegno.',
    },
  },
};
