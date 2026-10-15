/** Courses — Deutsch. */
export default {
  C: {
    ldName: 'Kurse der Ummah Academy',
    jump: 'Zu einem Bereich springen',
    meta: {
      title: 'Online-Korankurse | Tajweed, Hifz, Arabisch & Islamische Studien | Ummah Academy',
      desc: 'Vier Bereiche – Koran & Tajweed, Arabisch, Ummah Cubs für Kinder und Islamische Studien – live im Einzelunterricht mit Al-Azhar-Lehrkräften. Ab 40 $ im Monat, 2 Stunden gratis.',
    },
    eyebrow: 'Kurse',
    title: 'Jeder Kurs, <span class="accent">ein klarer Weg.</span>',
    lede: 'Vier Bereiche – Koran & Tajweed, Arabisch, Ummah Cubs und Islamische Studien – live im Einzelunterricht mit Al-Azhar-Lehrkräften. Starten Sie mit zwei kostenlosen Stunden.',
    chooserTitle: 'Welches Programm passt zu mir?',
    chooserLede: 'Ein schneller Vergleich – oder machen Sie den Einstufungstest für eine persönliche Empfehlung.',
    cols: ['Programm', 'Ideal für', 'Für Anfänger geeignet', 'Hauptziel'],
    rows: [
      ['Koranrezitation & Tajweed', '/quran-recitation-course/', 'Alle, die korrekt rezitieren möchten', 'Ja', 'Korrekte Aussprache und Tajweed-Regeln'],
      ['Hifz & Ijaza', '/quran-memorization-hifz/', 'Auswendiglernen mit dokumentierter Ijaza', 'Grundkenntnisse in Tajweed helfen', 'Dauerhaftes Auswendiglernen mit echtem Sanad'],
      ['Arabisch', '/online-arabic-classes/', 'Koranisches Arabisch lesen und verstehen', 'Ja', 'Lesen, Grammatik und Textverständnis'],
      ['Ummah Cubs', '/ummah-cubs-kids-islamic-studies/', 'Kinder von 5 bis 14 Jahren', 'Ja', 'Koran, Arabisch und Werte spielerisch'],
      ['Islamische Studien', '/online-islamic-studies-classes/', 'Erwachsene, die Aqida, Fiqh, Tafsir oder Sira lernen möchten', 'Ja', 'Ein tieferes Verständnis des Din'],
    ],
    track: (i: number) => `Bereich ${i} von 4`,
    details: 'Zum Bereich',
    kidsTest: 'Noch unsicher? Machen Sie den kostenlosen Einstufungstest für Kinder',
    ctaTitle: 'Unsicher, wo Sie anfangen sollen? <span class="accent">Wir helfen.</span>',
    ctaLede: 'Machen Sie den 3-Minuten-Einstufungstest – oder buchen Sie zwei kostenlose Stunden, und Ihre Lehrkraft findet Ihren Ausgangspunkt.',
    ctaSecondary: 'Einstufungstest',
  },
};
