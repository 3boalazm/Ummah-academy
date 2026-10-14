/**
 * Teachers and testimonials as published on the live site (client claims —
 * consent, photos and credentials to be confirmed before launch).
 */
import type { Lang } from '@/i18n';

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

export const getTeachers = (lang: Lang = 'en') => (lang === 'ar' ? TEACHERS_AR : TEACHERS_EN);
export const TEACHERS = TEACHERS_EN;

export interface Testimonial {
  quote: string;
  result: string;
  name: string;
  initials: string;
  location: string;
  program: string;
  track: 'quran' | 'arabic' | 'kids' | 'islamic';
}

const T_EN: Testimonial[] = [
  { quote: 'My son used to dread Quran lessons. Now he reminds ME about his session time! Teacher Nour makes every class an adventure he genuinely looks forward to.', result: 'Now excited for every Quran class', name: 'Sarah Al-Mansouri', initials: 'SA', location: 'London, UK', program: 'Ummah Cubs', track: 'kids' },
  { quote: 'After years of struggling, I finally recited Surah Al-Fatiha correctly for the first time. Alhamdulillah — Teacher Omneya’s patience changed everything.', result: 'Recited Al-Fatiha correctly for the first time', name: 'Amina Bergström', initials: 'AB', location: 'Toronto, Canada', program: 'Tajweed', track: 'quran' },
  { quote: 'As a father of three, the Family Portal lets me track all my children’s learning in one place. Detailed reports after every session — truly exceptional.', result: 'Tracks 3 children in one place', name: 'Khalid Rahman', initials: 'KR', location: 'Houston, USA', program: 'Family plan', track: 'kids' },
  { quote: 'I live in Australia and was worried about timezones. They scheduled my sessions at 7am and even send WhatsApp reminders. Very professional team.', result: '7am sessions across time zones', name: 'Omar Al-Farsi', initials: 'OF', location: 'Sydney, Australia', program: 'Memorisation', track: 'quran' },
  { quote: 'My Arabic went from absolute zero to reading the Quran in just 6 months using Noor Al-Bayan. The Itqan approach is simply extraordinary.', result: 'Reading the Qur’an within 6 months', name: 'Yasmin Dubois', initials: 'YD', location: 'Paris, France', program: 'Arabic', track: 'arabic' },
];

const T_AR: Testimonial[] = [
  { ...T_EN[0], quote: 'كان ابني يتهرّب من حصص القرآن، والآن هو من يذكّرني بموعد حصته! المعلمة نور تجعل كل حصة مغامرة ينتظرها بشوق.', result: 'أصبح متحمسًا لكل حصة قرآن', name: 'سارة المنصوري', location: 'لندن، المملكة المتحدة', program: 'أشبال الأمة' },
  { ...T_EN[1], quote: 'بعد سنوات من المحاولة، قرأت سورة الفاتحة قراءة صحيحة لأول مرة. الحمد لله — صبر المعلمة أمنية غيّر كل شيء.', result: 'قرأت الفاتحة صحيحة لأول مرة', name: 'أمينة بيرغستروم', location: 'تورونتو، كندا', program: 'التجويد' },
  { ...T_EN[2], quote: 'بصفتي أبًا لثلاثة أطفال، تتيح لي بوابة الأسرة متابعة تعلّمهم جميعًا في مكان واحد، مع تقارير مفصّلة بعد كل حصة.', result: 'يتابع ٣ أطفال من مكان واحد', name: 'خالد رحمن', location: 'هيوستن، الولايات المتحدة', program: 'خطة الأسرة' },
  { ...T_EN[3], quote: 'أعيش في أستراليا وكنت قلقًا من فارق التوقيت، فجدولوا حصصي في السابعة صباحًا ويرسلون تذكيرًا عبر واتساب. فريق محترف جدًا.', result: 'حصص السابعة صباحًا رغم فارق التوقيت', name: 'عمر الفارسي', location: 'سيدني، أستراليا', program: 'الحفظ' },
  { ...T_EN[4], quote: 'انتقلت من الصفر تمامًا في العربية إلى قراءة القرآن خلال ستة أشهر فقط بمنهج نور البيان. منهج الإتقان استثنائي حقًا.', result: 'تقرأ القرآن خلال ٦ أشهر', name: 'ياسمين دوبوا', location: 'باريس، فرنسا', program: 'العربية' },
];

export const getTestimonials = (lang: Lang = 'en') => (lang === 'ar' ? T_AR : T_EN);
export const TESTIMONIALS = T_EN;
