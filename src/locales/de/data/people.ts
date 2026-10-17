/** Lehrkräfte & Erfahrungsberichte — Deutsch (nur Texte; die Berichte sind als Übersetzung gekennzeichnet). */
import type { PeopleText } from '@/data/people';

const people: PeopleText = {
  teachers: {
    'omneya-ali': {
      role: 'Leiterin Tajweed',
      specialty: 'Tajweed & Qira’at',
      bio: 'Omneya hat an der Fakultät für Scharia und Recht der Al-Azhar-Universität studiert, den gesamten Koran bis zum Alter von 12 Jahren auswendig gelernt und besitzt eine Ijaza in Hafs ’an ’Asim mit einer Überlieferungskette bis zum Propheten ﷺ. Sie ist auf den Unterricht für Frauen und Kinder ab sieben Jahren spezialisiert und arbeitet mit Noor Al-Bayan, Al-Qaida An-Nuraniyya und der Ajrumiyya.',
      bestFor: ['Tajweed & Qira’at', 'Frauen', 'Kinder ab 7'],
      credentials: ['Ijaza – Hafs ’an ’Asim', '10+ Jahre Unterrichtserfahrung', 'Arabisch & Englisch'],
    },
    'sara-ahmed': {
      role: 'Leiterin Arabisch-Grundlagen',
      specialty: 'Arabisch & Noor Al-Bayan',
      bio: 'Sara hat an der Fakultät für Arabische Sprache der Al-Azhar studiert und ist für Noor Al-Bayan zertifiziert. Sie ist auf absolute Anfänger und Kinder spezialisiert – vom Verbinden der Buchstaben über die kurzen Vokale bis zum sicheren, selbstständigen Lesen.',
      bestFor: ['Arabisch-Anfänger', 'Kinder', 'Noor Al-Bayan'],
      credentials: ['Zertifiziert – Noor Al-Bayan', '8 Jahre online', 'Arabisch & Englisch'],
    },
    'nour-hassan': {
      role: 'Leiterin Ummah Cubs',
      specialty: 'Kinder & Islamische Studien',
      bio: 'Nour ist von der Al-Azhar in früher islamischer Bildung zertifiziert und leitet das Programm Ummah Cubs – spielerisches Koranlernen für Kinder von 5 bis 14 Jahren, das die ersten Schritte mit dem Koran fröhlich und ermutigend gestaltet.',
      bestFor: ['5 bis 14 Jahre', 'Erste Schritte mit dem Koran', 'Spielerisches Lernen'],
      credentials: ['Zertifiziert – frühe islamische Bildung', '7 Jahre mit 5- bis 14-Jährigen', 'Arabisch & Englisch'],
    },
  },
};
export default people;
