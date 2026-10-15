/** Insegnanti e testimonianze — italiano (solo testi; le testimonianze sono indicate come tradotte). */
import type { PeopleText } from '@/data/people';

const people: PeopleText = {
  teachers: {
    'omneya-ali': {
      role: 'Responsabile del Tajweed',
      specialty: 'Tajweed e qira’at',
      bio: 'Laureata alla Facoltà di Sharia e Diritto dell’Università al-Azhar, Omneya ha memorizzato l’intero Corano a 12 anni e ha un’ijaza in Hafs ’an ’Asim con una catena di trasmissione che risale al Profeta ﷺ. È specializzata nell’insegnamento a donne e bambini dai sette anni, con Noor Al-Bayan, Al-Qa’ida An-Nuraniyya e l’Ajrumiyya.',
      bestFor: ['Tajweed e qira’at', 'Donne', 'Bambini dai 7 anni'],
      credentials: ['Ijaza — Hafs ’an ’Asim', 'Oltre 10 anni di insegnamento', 'Arabo e inglese'],
    },
    'sara-ahmed': {
      role: 'Responsabile delle basi di arabo',
      specialty: 'Arabo e Noor Al-Bayan',
      bio: 'Laureata alla Facoltà di Lingua araba di al-Azhar e certificata in Noor Al-Bayan, Sara è specializzata nei principianti assoluti e nei bambini — dall’unire le lettere e le vocali brevi fino a una lettura autonoma e sicura.',
      bestFor: ['Principianti di arabo', 'Bambini', 'Noor Al-Bayan'],
      credentials: ['Certificata — Noor Al-Bayan', '8 anni online', 'Arabo e inglese'],
    },
    'nour-hassan': {
      role: 'Responsabile di Ummah Cubs',
      specialty: 'Bambini e studi islamici',
      bio: 'Certificata da al-Azhar in educazione islamica per la prima infanzia, Nour guida il programma Ummah Cubs — un apprendimento del Corano basato sul gioco per bambini dai 5 ai 14 anni, che rende i primi passi con il Corano gioiosi e incoraggianti.',
      bestFor: ['5–14 anni', 'Primi passi con il Corano', 'Apprendimento ludico'],
      credentials: ['Certificata — educazione islamica per la prima infanzia', '7 anni con bambini di 5–14 anni', 'Arabo e inglese'],
    },
  },
  testimonials: [
    { quote: 'Mio figlio temeva le lezioni di Corano. Ora è LUI a ricordarmi l’orario della lezione! L’insegnante Nour trasforma ogni lezione in un’avventura che aspetta davvero.', result: 'Ora aspetta con gioia ogni lezione di Corano', location: 'Londra, Regno Unito', program: 'Ummah Cubs' },
    { quote: 'Dopo anni di fatica, ho recitato correttamente la sura Al-Fatiha per la prima volta. Alhamdulillah — la pazienza dell’insegnante Omneya ha cambiato tutto.', result: 'Ha recitato Al-Fatiha correttamente per la prima volta', location: 'Toronto, Canada', program: 'Tajweed' },
    { quote: 'Come padre di tre figli, con l’Area famiglie seguo l’apprendimento di tutti i miei figli in un unico posto. Resoconti dettagliati dopo ogni lezione — davvero eccezionale.', result: 'Segue 3 figli in un unico posto', location: 'Houston, USA', program: 'Piano famiglia' },
    { quote: 'Vivo in Australia ed ero preoccupato per i fusi orari. Hanno fissato le mie lezioni alle 7 del mattino e mandano perfino promemoria su WhatsApp. Un team molto professionale.', result: 'Lezioni alle 7 nonostante i fusi orari', location: 'Sydney, Australia', program: 'Memorizzazione' },
    { quote: 'Con Noor Al-Bayan sono passata da zero assoluto in arabo alla lettura del Corano in soli 6 mesi. L’approccio Itqan è semplicemente straordinario.', result: 'Legge il Corano in 6 mesi', location: 'Parigi, Francia', program: 'Arabo' },
  ],
};
export default people;
