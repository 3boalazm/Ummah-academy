/** Courses — English (reference locale) copy. */
export default {
  C: {
    meta: {
      title: 'Online Quran Courses | Tajweed, Hifz, Arabic & Islamic Studies | Ummah Academy',
      desc: 'Four tracks — Qur’an & Tajweed, Arabic, Ummah Cubs for kids and Islamic Studies — taught live 1-on-1 by Al-Azhar teachers. From $40/month, 2 free sessions.',
    },
    eyebrow: 'Courses',
    title: 'Every course, <span class="accent">one clear path.</span>',
    lede: 'Four tracks — Qur’an & Tajweed, Arabic, Ummah Cubs and Islamic Studies — taught live 1-on-1 by Al-Azhar teachers. Start with two free sessions.',
    chooserTitle: 'Which programme is right for me?',
    chooserLede: 'A quick comparison — or take the placement test for a personal recommendation.',
    cols: ['Programme', 'Best for', 'Beginner friendly', 'Main goal'],
    rows: [
      ['Quran Recitation & Tajweed', '/quran-recitation-course/', 'Anyone who wants to recite correctly', 'Yes', 'Correct pronunciation and Tajweed rules'],
      ['Hifz & Ijazah', '/quran-memorization-hifz/', 'Memorising with a documented Ijazah', 'Basic Tajweed helps', 'Lasting memorisation with a real Sanad'],
      ['Arabic Language', '/online-arabic-classes/', 'Reading and understanding Qur’anic Arabic', 'Yes', 'Reading, grammar and comprehension'],
      ['Ummah Cubs', '/ummah-cubs-kids-islamic-studies/', 'Children aged 5–14', 'Yes', 'Qur’an, Arabic and values through play'],
      ['Islamic Studies', '/online-islamic-studies-classes/', 'Adults wanting Aqeedah, Fiqh, Tafseer or Seerah', 'Yes', 'A deeper understanding of the deen'],
    ],
    track: (i: number) => `Track ${i} of 4`,
    details: 'Track details',
    kidsTest: 'Not sure yet? Take the free kids placement test',
    ctaTitle: 'Not sure where to start? <span class="accent">We’ll help.</span>',
    ctaLede: 'Take the 3-minute placement test, or book two free sessions and your teacher will find your starting point.',
    ctaSecondary: 'Placement test',
  },
};
