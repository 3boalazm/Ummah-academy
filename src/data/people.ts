/**
 * Teachers and testimonials as published on the live site (client claims —
 * consent, photos and credentials to be confirmed before launch).
 */
import type { Lang } from '@/i18n';
import peopleDe from '@/locales/de/data/people';
import peopleFr from '@/locales/fr/data/people';
import peopleIt from '@/locales/it/data/people';

export interface Teacher {
  id: string;
  name: string;
  /** canonical English name, used to prefill the booking form */
  canonical: string;
  initials: string;
  role: string;
  specialty: string;
  bio: string;
  bestFor: string[];
  credentials: string[];
  hue: 'violet' | 'sky' | 'rose';
  track: 'quran' | 'arabic' | 'kids';
  /** true only when the published bio states an Ijazah (drives the badge and Sanad section) */
  ijazah: boolean;
  /** structured data (English only): institution she graduated from, if published */
  alumniOf?: string;
  /** structured data: credentials as published on the live site */
  credentialNames?: string[];
}

const TEACHERS_EN: Teacher[] = [
  {
    id: 'omneya-ali',
    name: 'Omneya Ali',
    canonical: 'Omneya Ali',
    initials: 'OA',
    role: 'Head of Tajweed',
    specialty: 'Tajweed & Qira’at',
    bio: 'A graduate of Al-Azhar University’s Faculty of Sharia and Law, Omneya memorised the entire Qur’an by age 12 and holds an Ijazah in Hafs ’an ’Asim with a chain of transmission to the Prophet ﷺ. She specialises in teaching women and children from age seven, using Noor Al-Bayan, Al-Qaida Al-Nooraniyyah and Al-Ajrumiyyah.',
    bestFor: ['Tajweed & Qira’at', 'Women', 'Children 7+'],
    credentials: ['Ijazah — Hafs ’an ’Asim', '10+ years teaching', 'Arabic & English'],
    hue: 'violet',
    track: 'quran',
    ijazah: true,
    alumniOf: 'Al-Azhar University — Faculty of Sharia and Law',
    credentialNames: ['Ijazah in Hafs ’an ’Asim with a chain of transmission'],
  },
  {
    id: 'sara-ahmed',
    name: 'Sara Ahmed',
    canonical: 'Sara Ahmed',
    initials: 'SA',
    role: 'Lead, Arabic Foundations',
    specialty: 'Arabic & Noor Al-Bayan',
    bio: 'A graduate of Al-Azhar’s Faculty of Arabic Language and certified in Noor Al-Bayan, Sara specialises in absolute beginners and children — connecting letters, short vowels and building toward confident, independent reading.',
    bestFor: ['Arabic beginners', 'Children', 'Noor Al-Bayan'],
    credentials: ['Certified — Noor Al-Bayan', '8 years online', 'Arabic & English'],
    hue: 'sky',
    track: 'arabic',
    ijazah: false,
    alumniOf: 'Al-Azhar University — Faculty of Arabic Language',
    credentialNames: ['Noor Al-Bayan teaching certification'],
  },
  {
    id: 'nour-hassan',
    name: 'Nour Hassan',
    canonical: 'Nour Hassan',
    initials: 'NH',
    role: 'Lead, Ummah Cubs',
    specialty: 'Kids & Islamic studies',
    bio: 'Certified in Early Islamic Education from Al-Azhar, Nour leads the Ummah Cubs programme — gamified Qur’an learning for children aged 5 to 14 that keeps first steps with the Qur’an playful and encouraging.',
    bestFor: ['Ages 5–14', 'First Qur’an steps', 'Gamified learning'],
    credentials: ['Certified — Early Islamic Education', '7 years with ages 5–14', 'Arabic & English'],
    hue: 'rose',
    track: 'kids',
    ijazah: false,
    credentialNames: ['Certificate in Early Islamic Education (Al-Azhar)'],
  },
];

const TEACHERS_AR: Teacher[] = [
  {
    ...TEACHERS_EN[0],
    name: 'أمنية علي',
    role: 'رئيسة قسم التجويد',
    specialty: 'التجويد والقراءات',
    bio: 'خريجة كلية الشريعة والقانون بجامعة الأزهر، أتمّت حفظ القرآن كاملًا في الثانية عشرة من عمرها، وتحمل إجازة برواية حفص عن عاصم بسند متصل إلى النبي ﷺ. متخصصة في تعليم النساء والأطفال من سن السابعة بمناهج نور البيان والقاعدة النورانية والآجرومية.',
    bestFor: ['التجويد والقراءات', 'النساء', 'الأطفال من ٧ سنوات'],
    credentials: ['إجازة — حفص عن عاصم', 'أكثر من ١٠ سنوات تدريس', 'العربية والإنجليزية'],
  },
  {
    ...TEACHERS_EN[1],
    name: 'سارة أحمد',
    role: 'مسؤولة تأسيس اللغة العربية',
    specialty: 'العربية ونور البيان',
    bio: 'خريجة كلية اللغة العربية بالأزهر ومعتمدة في منهج نور البيان، متخصصة في المبتدئين تمامًا والأطفال — من وصل الحروف والحركات القصيرة حتى القراءة المستقلة بثقة.',
    bestFor: ['المبتدئون في العربية', 'الأطفال', 'نور البيان'],
    credentials: ['معتمدة — نور البيان', '٨ سنوات تدريس أونلاين', 'العربية والإنجليزية'],
  },
  {
    ...TEACHERS_EN[2],
    name: 'نور حسن',
    role: 'مسؤولة برنامج أشبال الأمة',
    specialty: 'الأطفال والدراسات الإسلامية',
    bio: 'حاصلة على شهادة في التربية الإسلامية المبكرة من الأزهر، تقود برنامج أشبال الأمة — تعليم قرآني قائم على اللعب للأطفال من ٥ إلى ١٤ عامًا يجعل الخطوات الأولى مع القرآن ممتعة ومشجِّعة.',
    bestFor: ['من ٥ إلى ١٤ عامًا', 'الخطوات الأولى مع القرآن', 'التعلم باللعب'],
    credentials: ['معتمدة — التربية الإسلامية المبكرة', '٧ سنوات مع الأطفال', 'العربية والإنجليزية'],
  },
];

/** Text-only overlay (German/French/Italian): ids, names, credentials data and flags stay in EN. */
export type TeacherText = Pick<Teacher, 'role' | 'specialty' | 'bio' | 'bestFor' | 'credentials'>;
export interface PeopleText {
  teachers: Record<string, TeacherText>;
}
export type { Testimonial } from './reviews';
export { getTestimonials, TESTIMONIALS } from './reviews';
const OVERLAY: Partial<Record<Lang, PeopleText>> = { de: peopleDe, fr: peopleFr, it: peopleIt };

const teachersFor = new Map<Lang, Teacher[]>();
export const getTeachers = (lang: Lang = 'en'): Teacher[] => {
  if (lang === 'en') return TEACHERS_EN;
  if (lang === 'ar') return TEACHERS_AR;
  if (!teachersFor.has(lang)) {
    const x = OVERLAY[lang];
    teachersFor.set(
      lang,
      x
        ? TEACHERS_EN.map((t) => {
            if (!x.teachers[t.id]) throw new Error(`[people] ${lang} is missing teacher "${t.id}"`);
            return { ...t, ...x.teachers[t.id] };
          })
        : TEACHERS_EN,
    );
  }
  return teachersFor.get(lang)!;
};
export const teacherById = (id: string, lang: Lang = 'en') => getTeachers(lang).find((t) => t.id === id);
export const TEACHERS = TEACHERS_EN;
