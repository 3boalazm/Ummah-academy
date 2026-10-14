/** Courses — italiano. */
export default {
  C: {
    ldName: 'I corsi di Ummah Academy',
    jump: 'Vai a un percorso',
    meta: {
      title: 'Corsi di Corano online | Tajweed, hifz, arabo e studi islamici | Ummah Academy',
      desc: 'Quattro percorsi — Corano e Tajweed, arabo, Ummah Cubs per bambini e studi islamici — con lezioni individuali dal vivo tenute da insegnanti di al-Azhar. Da 40 $ al mese, 2 lezioni gratuite.',
    },
    eyebrow: 'Corsi',
    title: 'Ogni corso, <span class="accent">un percorso chiaro.</span>',
    lede: 'Quattro percorsi — Corano e Tajweed, arabo, Ummah Cubs e studi islamici — con lezioni individuali dal vivo tenute da insegnanti di al-Azhar. Inizia con due lezioni gratuite.',
    chooserTitle: 'Qual è il programma giusto per me?',
    chooserLede: 'Un confronto rapido — oppure fai il test di livello per un consiglio personalizzato.',
    cols: ['Programma', 'Ideale per', 'Adatto ai principianti', 'Obiettivo principale'],
    rows: [
      ['Recitazione del Corano e Tajweed', '/quran-recitation-course/', 'Chiunque voglia recitare correttamente', 'Sì', 'Pronuncia corretta e regole del Tajweed'],
      ['Hifz e ijaza', '/quran-memorization-hifz/', 'Memorizzare con un’ijaza documentata', 'Le basi del Tajweed aiutano', 'Una memorizzazione duratura con un vero sanad'],
      ['Lingua araba', '/online-arabic-classes/', 'Leggere e capire l’arabo del Corano', 'Sì', 'Lettura, grammatica e comprensione'],
      ['Ummah Cubs', '/ummah-cubs-kids-islamic-studies/', 'Bambini dai 5 ai 14 anni', 'Sì', 'Corano, arabo e valori attraverso il gioco'],
      ['Studi islamici', '/online-islamic-studies-classes/', 'Adulti che vogliono studiare aqida, fiqh, tafsir o sira', 'Sì', 'Una comprensione più profonda della religione'],
    ],
    track: (i: number) => `Percorso ${i} di 4`,
    details: 'Dettagli del percorso',
    kidsTest: 'Non sei ancora sicuro? Fai il test di livello gratuito per bambini',
    ctaTitle: 'Non sai da dove iniziare? <span class="accent">Ti aiutiamo noi.</span>',
    ctaLede: 'Fai il test di livello di 3 minuti, oppure prenota due lezioni gratuite: il tuo insegnante troverà il tuo punto di partenza.',
    ctaSecondary: 'Test di livello',
  },
};
