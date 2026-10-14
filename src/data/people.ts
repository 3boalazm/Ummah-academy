/** Teachers and testimonials as published on the live site (client claims). */

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  bio: string;
  bestFor: string[];
  credentials: string[];
  quote?: string;
}

export const TEACHERS: Teacher[] = [
  {
    id: 'omneya-ali',
    name: 'Omneya Ali',
    initials: 'OA',
    role: 'Head of Tajweed Department',
    specialty: 'Tajweed & Qira’at Specialist',
    bio: 'A graduate of Al-Azhar University’s Faculty of Sharia and Law, Omneya memorized the entire Qur’an by age 12 and holds an Ijazah in Hafs ’an ’Asim with a chain of transmission to the Prophet ﷺ. She specializes in teaching children from age seven and women, using approved curricula including Noor Al-Bayan, Al-Qaida Al-Nooraniyyah, and Al-Ajrumiyyah.',
    bestFor: ['Tajweed & Qira’at', 'Children 7+', 'Women'],
    credentials: ['Ijazah in Hafs ’an ’Asim', '10+ Years Teaching', 'Arabic & English'],
    quote: 'Seeking knowledge is a pursuit towards Allah — and as knowledge grows, faith increases.',
  },
  {
    id: 'sara-ahmed',
    name: 'Sara Ahmed',
    initials: 'SA',
    role: 'Arabic Foundation Specialist',
    specialty: 'Arabic Language & Noor Al-Bayan',
    bio: 'A graduate of Al-Azhar’s Arabic Language Faculty, Sara is certified in Noor Al-Bayan and specializes in absolute beginners and children — the first steps of connecting letters, short vowels, and building toward confident, independent reading.',
    bestFor: ['Arabic beginners', 'Children', 'Noor Al-Bayan'],
    credentials: ['Certified — Noor Al-Bayan', '8 Years Online Teaching', 'Arabic & English'],
  },
  {
    id: 'nour-hassan',
    name: 'Nour Hassan',
    initials: 'NH',
    role: 'Ummah Cubs Programme Lead',
    specialty: 'Kids & Islamic Studies',
    bio: 'Certified in Early Islamic Education from Al-Azhar, Nour leads the Ummah Cubs programme — an expert in gamified Qur’an learning for children ages 5 to 14, keeping first steps with the Qur’an playful and encouraging.',
    bestFor: ['Ages 5–14', 'First Qur’an steps', 'Gamified learning'],
    credentials: ['Certified — Early Islamic Education', '7 Years With Ages 5–14', 'Arabic & English'],
  },
];

export interface Testimonial {
  quote: string;
  result: string;
  name: string;
  initials: string;
  location: string;
  program: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'My son used to dread Quran lessons. Now he reminds ME about his session time! Teacher Nour makes every class an adventure he genuinely looks forward to.',
    result: 'Now excited for every Quran class',
    name: 'Sarah Al-Mansouri',
    initials: 'SA',
    location: 'London, UK',
    program: 'Ummah Cubs',
  },
  {
    quote:
      'After years of struggling, I finally recited Surah Al-Fatiha correctly for the first time. Alhamdulillah — Teacher Omneya’s patience changed everything.',
    result: 'Recited Surah Al-Fatiha correctly for the first time',
    name: 'Amina Bergström',
    initials: 'AB',
    location: 'Toronto, Canada',
    program: 'Tajweed',
  },
  {
    quote:
      'As a father of three, the Family Portal lets me track all my children’s learning in one place. Detailed reports after every session — truly exceptional.',
    result: 'Tracks all 3 children’s progress in one place',
    name: 'Khalid Rahman',
    initials: 'KR',
    location: 'Houston, USA',
    program: 'Family Plan',
  },
  {
    quote:
      'I live in Australia and was worried about timezones. They scheduled my sessions at 7am and even send WhatsApp reminders. Very professional team.',
    result: 'Seamless 7am sessions across time zones',
    name: 'Omar Al-Farsi',
    initials: 'OF',
    location: 'Sydney, Australia',
    program: 'Memorization',
  },
  {
    quote:
      'My Arabic went from absolute zero to reading the Quran in just 6 months using Noor Al-Bayan. The Itqan approach is simply extraordinary.',
    result: 'Reading the Quran within 6 months',
    name: 'Yasmin Dubois',
    initials: 'YD',
    location: 'Paris, France',
    program: 'Arabic',
  },
];

export const HALL_OF_FAME = [
  { name: 'Ahmed K.', initials: 'AK', achievement: 'Full Quran Hifz', country: 'UK' },
  { name: 'Fatima R.', initials: 'FR', achievement: 'Ijazah Certified', country: 'USA' },
  { name: 'Yusuf T.', initials: 'YT', achievement: 'Juz Amma', country: 'Canada' },
  { name: 'Maryam S.', initials: 'MS', achievement: 'Tajweed L3', country: 'Australia' },
  { name: 'Ibrahim M.', initials: 'IM', achievement: 'Arabic Mastery', country: 'Germany' },
  { name: 'Nour A.', initials: 'NA', achievement: 'Top Cub', country: 'France' },
];
