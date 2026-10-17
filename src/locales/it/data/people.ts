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
};
export default people;
