import quranImg from '@/assets/art/track-quran.jpg';
import arabicImg from '@/assets/art/track-arabic.jpg';
import kidsImg from '@/assets/art/track-kids.jpg';
import islamicImg from '@/assets/art/track-islamic.jpg';

export type TrackId = 'quran' | 'arabic' | 'kids' | 'islamic';

export interface Course {
  id: string;
  title: string;
  badge: string;
  tags: string[];
  desc: string;
  from: number;
  href?: string;
  /** value passed to the trial form */
  trial: string;
}

export interface Track {
  id: TrackId;
  title: string;
  titleAr: string;
  subtitle: string;
  icon: string;
  intro: string;
  homePoints: string[];
  points: string[];
  from: number;
  href: string;
  trial: string;
  ctaLabel: string;
  image: ImageMetadata;
  courses: Course[];
}

export const TRACKS: Track[] = [
  {
    id: 'quran',
    title: 'Quran & Tajweed',
    titleAr: 'القرآن والتجويد',
    subtitle: 'Tilawah · Tajweed · Hifz · Ijazah',
    icon: 'book-open-text',
    intro: 'Master the Quran as it was revealed — with Tajweed, memorization using the Itqan method, and Ijazah.',
    homePoints: [
      'Correct Recitation — all levels & ages',
      'Tajweed Rules — 3 progressive levels with certificates',
      'Memorization using the Itqan (Perfection) method',
      'Ijazah with chain of transmission to Prophet ﷺ',
    ],
    points: [
      'Correct recitation as transmitted from the Prophet ﷺ',
      'Tajweed in 3 progressive levels',
      'Memorization using the “Itqan” mastery method',
      'Ijazah program with documented Sanad',
    ],
    from: 64,
    href: '/quran-recitation-course/',
    trial: 'Quran Recitation',
    ctaLabel: 'Start free trial in Quran',
    image: quranImg,
    courses: [
      {
        id: 'recitation',
        title: 'Quran Recitation',
        badge: 'Beginner → Advanced',
        tags: ['All Ages', '1:1 Live'],
        desc: 'Learn correct Quran recitation from Alif-Ba to full fluency.',
        from: 64,
        href: '/quran-recitation-course/',
        trial: 'Quran Recitation',
      },
      {
        id: 'tajweed',
        title: 'Tajweed Rules',
        badge: '3-Level Program',
        tags: ['Foundation', 'Rules', 'Mastery'],
        desc: 'Makhraj, Sifaat, Noon Sakinah, Madd rules using Al-Jazariyyah.',
        from: 64,
        href: '/quran-recitation-course/',
        trial: 'Tajweed Rules',
      },
      {
        id: 'hifz',
        title: 'Hifz & Ijazah',
        badge: 'Ijazah Available',
        tags: ['Itqan Method', 'Ijazah Track'],
        desc: 'Memorize with thematic grouping and earn formal Ijazah with Sanad.',
        from: 96,
        href: '/quran-memorization-hifz/',
        trial: 'Quran Memorization (Hifz)',
      },
    ],
  },
  {
    id: 'arabic',
    title: 'Arabic Language',
    titleAr: 'اللغة العربية',
    subtitle: 'Noor Al-Bayan · Grammar · Conversation',
    icon: 'pen-nib',
    intro: 'From reading the Mushaf correctly to conversational fluency and classical Arabic grammar mastery.',
    homePoints: [
      'Noor Al-Bayan & Nooraniyyah foundation',
      'Nahw & Sarf — Al-Ajrumiyyah classical texts',
      'Spoken Arabic for daily fluency and confidence',
      'Quranic Arabic for deeper comprehension',
    ],
    points: [
      'Noor Al-Bayan & Nooraniyyah foundation',
      'Al-Ajrumiyyah classical grammar (Nahw & Sarf)',
      'Spoken Arabic for daily conversation',
    ],
    from: 40,
    href: '/online-arabic-classes/',
    trial: 'Noor Al-Bayan',
    ctaLabel: 'Start free trial in Arabic',
    image: arabicImg,
    courses: [
      {
        id: 'noor-al-bayan',
        title: 'Noor Al-Bayan',
        badge: 'Beginners & Kids',
        tags: ['Age 5+', 'Zero Arabic'],
        desc: 'The most trusted foundation method for reading Arabic and Quran from scratch.',
        from: 40,
        href: '/online-arabic-classes/',
        trial: 'Noor Al-Bayan',
      },
      {
        id: 'grammar',
        title: 'Grammar: Nahw & Sarf',
        badge: 'Al-Ajrumiyyah',
        tags: ['Intermediate', 'Classical'],
        desc: 'Deep study of Arabic grammar using the classical Al-Ajrumiyyah text.',
        from: 64,
        href: '/online-arabic-classes/',
        trial: 'Arabic Grammar',
      },
      {
        id: 'conversation',
        title: 'Arabic Conversation',
        badge: 'Modern Standard',
        tags: ['All Levels', 'Fluency'],
        desc: 'Build practical speaking skills for daily life and Islamic lectures.',
        from: 64,
        href: '/online-arabic-classes/',
        trial: 'Arabic Conversation',
      },
    ],
  },
  {
    id: 'kids',
    title: 'Ummah Cubs',
    titleAr: 'أشبال الأمة',
    subtitle: 'Islamic Studies for Kids · Ages 5+',
    icon: 'star',
    intro: 'Complete Islamic education for children 5–14. Quran, Arabic, and Islamic values through games and visuals.',
    homePoints: [
      'Aqeedah — 6 Pillars of Iman, visual & interactive',
      'Fiqh basics — Salah, Wudhu, worship correction',
      'Islamic Morals (Akhlaq) through Seerah stories',
      'Quran reading with gamified reward system',
    ],
    points: [
      'Quran reading using Noor Al-Bayan',
      'Islamic studies through stories and games',
      '30-minute sessions matched to focus span',
      'Monthly achievement badges',
    ],
    from: 40,
    href: '/ummah-cubs-kids-islamic-studies/',
    trial: 'Ummah Cubs (Kids)',
    ctaLabel: 'Enroll my child free',
    image: kidsImg,
    courses: [
      {
        id: 'little-explorers',
        title: 'Little Explorers',
        badge: 'Ages 5–7',
        tags: ['Foundations', 'Games & Stories'],
        desc: 'First Arabic letters, fun Islamic stories, and singing short surahs together — playful 30-minute sessions.',
        from: 40,
        href: '/ummah-cubs-kids-islamic-studies/',
        trial: 'Ummah Cubs (Kids)',
      },
      {
        id: 'growing-learners',
        title: 'Growing Learners',
        badge: 'Ages 8–10',
        tags: ['Noor Al-Bayan', 'Short Surahs'],
        desc: 'Building real reading fluency with Noor Al-Bayan, memorizing short surahs, and learning Islamic values through stories.',
        from: 40,
        href: '/ummah-cubs-kids-islamic-studies/',
        trial: 'Ummah Cubs (Kids)',
      },
      {
        id: 'junior-scholars',
        title: 'Junior Scholars',
        badge: 'Ages 11–14',
        tags: ['Structured Track', 'Monthly Badges'],
        desc: 'More structured Quran memorization and deeper Islamic studies — preparing confidently for our teen and adult tracks.',
        from: 40,
        href: '/ummah-cubs-kids-islamic-studies/',
        trial: 'Ummah Cubs (Kids)',
      },
    ],
  },
  {
    id: 'islamic',
    title: 'Islamic Studies',
    titleAr: 'الدراسات الإسلامية',
    subtitle: 'Aqeedah · Fiqh · Tafseer · Seerah',
    icon: 'mosque',
    intro: 'Deep understanding of your deen — Aqeedah, Fiqh, Tafseer, and Seerah for adults.',
    homePoints: [
      'Aqeedah — the 6 pillars of Iman with full evidence',
      'Fiqh — worship rulings & correcting common mistakes',
      'Tafseer — understanding deeper Quranic meanings',
      'Seerah — Prophet’s ﷺ biography & life lessons',
    ],
    points: [
      'Aqeedah — 6 pillars with Quranic evidence',
      'Fiqh — practical worship rulings',
      'Tafseer — verse understanding and life lessons',
      'Seerah — Prophet’s ﷺ biography and guidance',
    ],
    from: 64,
    href: '/online-islamic-studies-classes/',
    trial: 'Islamic Studies',
    ctaLabel: 'Start free trial in Islamic Studies',
    image: islamicImg,
    courses: [
      {
        id: 'aqeedah',
        title: 'Aqeedah',
        badge: 'Foundations of Faith',
        tags: ['6 Pillars', 'Quranic Evidence'],
        desc: 'Build unshakeable faith through the 6 pillars of Iman, grounded in Quran and authentic evidence.',
        from: 64,
        href: '/online-islamic-studies-classes/',
        trial: 'Islamic Studies',
      },
      {
        id: 'fiqh',
        title: 'Fiqh',
        badge: 'Everyday Worship',
        tags: ['Practical Rulings', 'Common Mistakes'],
        desc: 'Practical worship rulings for daily life — Salah, purification, and correcting common mistakes with confidence.',
        from: 64,
        href: '/online-islamic-studies-classes/',
        trial: 'Islamic Studies',
      },
      {
        id: 'tafseer',
        title: 'Tafseer',
        badge: 'Quran Explained',
        tags: ['Verse by Verse', 'Life Lessons'],
        desc: 'Go beyond translation — understand the deeper meaning of the Quran and the life lessons within each verse.',
        from: 64,
        href: '/online-islamic-studies-classes/',
        trial: 'Islamic Studies',
      },
      {
        id: 'seerah',
        title: 'Seerah',
        badge: 'Prophetic Biography',
        tags: ['Life of the Prophet', 'Character & Guidance'],
        desc: 'Walk through the life of Prophet Muhammad, peace be upon him — his character, struggles, and timeless guidance for today.',
        from: 64,
        href: '/online-islamic-studies-classes/',
        trial: 'Islamic Studies',
      },
    ],
  },
];

export const trackById = (id: TrackId) => TRACKS.find((t) => t.id === id)!;

/** Options offered by the trial-booking form (mirrors the live form). */
export const TRIAL_COURSES = [
  'Quran Recitation',
  'Tajweed Rules',
  'Quran Memorization (Hifz)',
  'Ijazah Program',
  'Noor Al-Bayan',
  'Arabic Grammar',
  'Arabic Conversation',
  'Ummah Cubs (Kids)',
  'Islamic Studies',
] as const;
