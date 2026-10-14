import quranImg from '@/assets/art/track-quran.jpg';
import arabicImg from '@/assets/art/track-arabic.jpg';
import kidsImg from '@/assets/art/track-kids.jpg';
import islamicImg from '@/assets/art/track-islamic.jpg';
import type { Lang } from '@/i18n';

export type TrackId = 'quran' | 'arabic' | 'kids' | 'islamic';

export interface Course {
  id: string;
  title: string;
  badge: string;
  tags: string[];
  desc: string;
  from: number;
  href?: string;
  /** canonical (English) value passed to the booking form */
  trial: string;
}

export interface Track {
  id: TrackId;
  title: string;
  subtitle: string;
  icon: string;
  intro: string;
  points: string[];
  from: number;
  href: string;
  trial: string;
  ctaLabel: string;
  image: ImageMetadata;
  courses: Course[];
}

const IMG: Record<TrackId, ImageMetadata> = { quran: quranImg, arabic: arabicImg, kids: kidsImg, islamic: islamicImg };
const HREF: Record<TrackId, string> = {
  quran: '/quran-recitation-course/',
  arabic: '/online-arabic-classes/',
  kids: '/ummah-cubs-kids-islamic-studies/',
  islamic: '/online-islamic-studies-classes/',
};

type C = [id: string, title: string, badge: string, tags: string[], desc: string, from: number, trial: string, href?: string];
const course = ([id, title, badge, tags, desc, from, trial, href]: C): Course => ({ id, title, badge, tags, desc, from, trial, href });

const EN: Track[] = [
  {
    id: 'quran',
    title: 'Quran & Tajweed',
    subtitle: 'Recitation · Tajweed · Hifz · Ijazah',
    icon: 'book-open-text',
    intro: 'Recite the Qur’an as it was revealed — with Tajweed, memorisation through the Itqan method, and a path to Ijazah.',
    points: ['Correct recitation as transmitted from the Prophet ﷺ', 'Tajweed in 3 progressive levels', 'Memorisation with the Itqan method', 'Ijazah programme with documented Sanad'],
    from: 64,
    href: HREF.quran,
    trial: 'Quran Recitation',
    ctaLabel: 'Book a free Quran trial',
    image: IMG.quran,
    courses: [
      course(['recitation', 'Quran Recitation', 'Beginner to advanced', ['All ages', '1-on-1 live'], 'Correct recitation from the first letters to full fluency.', 64, 'Quran Recitation', '/quran-recitation-course/']),
      course(['tajweed', 'Tajweed Rules', '3-level programme', ['Foundation', 'Rules', 'Mastery'], 'Makharij, Sifaat, Noon Sakinah and Madd rules through Al-Jazariyyah.', 64, 'Tajweed Rules', '/quran-recitation-course/']),
      course(['hifz', 'Hifz & Ijazah', 'Ijazah available', ['Itqan method', 'Ijazah track'], 'Memorise through thematic grouping and earn a formal Ijazah with Sanad.', 96, 'Quran Memorization (Hifz)', '/quran-memorization-hifz/']),
    ],
  },
  {
    id: 'arabic',
    title: 'Arabic Language',
    subtitle: 'Noor Al-Bayan · Grammar · Conversation',
    icon: 'pen-nib',
    intro: 'From reading the Mushaf correctly to understanding it — reading foundations, classical grammar and spoken fluency.',
    points: ['Noor Al-Bayan & Nooraniyyah foundation', 'Al-Ajrumiyyah classical grammar (Nahw & Sarf)', 'Spoken Arabic for daily life and lectures'],
    from: 40,
    href: HREF.arabic,
    trial: 'Noor Al-Bayan',
    ctaLabel: 'Book a free Arabic trial',
    image: IMG.arabic,
    courses: [
      course(['noor-al-bayan', 'Noor Al-Bayan', 'Beginners & kids', ['Age 5+', 'Zero Arabic'], 'The most trusted method for reading Arabic and the Qur’an from scratch.', 40, 'Noor Al-Bayan', '/online-arabic-classes/']),
      course(['grammar', 'Grammar: Nahw & Sarf', 'Al-Ajrumiyyah', ['Intermediate', 'Classical'], 'Classical Arabic grammar through the Al-Ajrumiyyah text.', 64, 'Arabic Grammar', '/online-arabic-classes/']),
      course(['conversation', 'Arabic Conversation', 'Modern Standard', ['All levels', 'Fluency'], 'Practical speaking for daily life and Islamic lectures.', 64, 'Arabic Conversation', '/online-arabic-classes/']),
    ],
  },
  {
    id: 'kids',
    title: 'Ummah Cubs',
    subtitle: 'For children aged 5–14',
    icon: 'star',
    intro: 'Qur’an, Arabic and Islamic values through games and stories — 30-minute sessions children actually look forward to.',
    points: ['Qur’an reading with Noor Al-Bayan', 'Islamic studies through stories and games', '30-minute sessions matched to focus span', 'Monthly achievement badges'],
    from: 40,
    href: HREF.kids,
    trial: 'Ummah Cubs (Kids)',
    ctaLabel: 'Book a free trial for my child',
    image: IMG.kids,
    courses: [
      course(['little-explorers', 'Little Explorers', 'Ages 5–7', ['Foundations', 'Games & stories'], 'First Arabic letters, Islamic stories and short surahs — playful 30-minute sessions.', 40, 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/']),
      course(['growing-learners', 'Growing Learners', 'Ages 8–10', ['Noor Al-Bayan', 'Short surahs'], 'Real reading fluency, short-surah memorisation and values through stories.', 40, 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/']),
      course(['junior-scholars', 'Junior Scholars', 'Ages 11–14', ['Structured track', 'Monthly badges'], 'Structured memorisation and deeper Islamic studies, preparing for the teen and adult tracks.', 40, 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/']),
    ],
  },
  {
    id: 'islamic',
    title: 'Islamic Studies',
    subtitle: 'Aqeedah · Fiqh · Tafseer · Seerah',
    icon: 'mosque',
    intro: 'A real curriculum for understanding your deen — taught by scholars who answer your actual questions.',
    points: ['Aqeedah — the 6 pillars with Qur’anic evidence', 'Fiqh — practical rulings of worship', 'Tafseer — meanings and life lessons', 'Seerah — the Prophet’s ﷺ life and guidance'],
    from: 64,
    href: HREF.islamic,
    trial: 'Islamic Studies',
    ctaLabel: 'Book a free Islamic Studies trial',
    image: IMG.islamic,
    courses: [
      course(['aqeedah', 'Aqeedah', 'Foundations of faith', ['6 pillars', 'Qur’anic evidence'], 'Unshakeable faith through the 6 pillars of Iman, grounded in authentic evidence.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
      course(['fiqh', 'Fiqh', 'Everyday worship', ['Practical rulings', 'Common mistakes'], 'Salah, purification and everyday rulings — with confidence and evidence.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
      course(['tafseer', 'Tafseer', 'The Qur’an explained', ['Verse by verse', 'Life lessons'], 'Go beyond translation to the deeper meanings and lessons of each verse.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
      course(['seerah', 'Seerah', 'Prophetic biography', ['Life of the Prophet ﷺ', 'Character'], 'The life of the Prophet ﷺ — his character, struggles and timeless guidance.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
    ],
  },
];

const AR: Track[] = [
  {
    id: 'quran',
    title: 'القرآن والتجويد',
    subtitle: 'تلاوة · تجويد · حفظ · إجازة',
    icon: 'book-open-text',
    intro: 'اقرأ القرآن كما أُنزل — بالتجويد، وبالحفظ وفق منهج الإتقان، وصولًا إلى الإجازة.',
    points: ['التلاوة الصحيحة كما نُقلت عن النبي ﷺ', 'التجويد في ثلاثة مستويات متدرجة', 'الحفظ بمنهج «الإتقان»', 'برنامج إجازة بسند موثَّق'],
    from: 64,
    href: HREF.quran,
    trial: 'Quran Recitation',
    ctaLabel: 'احجز تجربة مجانية في القرآن',
    image: IMG.quran,
    courses: [
      course(['recitation', 'تلاوة القرآن', 'من المبتدئ إلى المتقدم', ['لكل الأعمار', 'مباشر وفردي'], 'التلاوة الصحيحة من الحروف الأولى حتى الطلاقة الكاملة.', 64, 'Quran Recitation', '/quran-recitation-course/']),
      course(['tajweed', 'أحكام التجويد', 'برنامج من ٣ مستويات', ['تأسيس', 'أحكام', 'إتقان'], 'المخارج والصفات وأحكام النون الساكنة والمدود من خلال متن الجزرية.', 64, 'Tajweed Rules', '/quran-recitation-course/']),
      course(['hifz', 'الحفظ والإجازة', 'الإجازة متاحة', ['منهج الإتقان', 'مسار الإجازة'], 'احفظ بالتجميع الموضوعي للآيات، واحصل على إجازة رسمية بسند متصل.', 96, 'Quran Memorization (Hifz)', '/quran-memorization-hifz/']),
    ],
  },
  {
    id: 'arabic',
    title: 'اللغة العربية',
    subtitle: 'نور البيان · النحو والصرف · المحادثة',
    icon: 'pen-nib',
    intro: 'من قراءة المصحف قراءةً صحيحة إلى فهمه — تأسيس في القراءة، ثم قواعد تراثية، ثم طلاقة في الحديث.',
    points: ['تأسيس بنور البيان والقاعدة النورانية', 'النحو والصرف من خلال متن الآجرومية', 'محادثة عربية للحياة اليومية والدروس'],
    from: 40,
    href: HREF.arabic,
    trial: 'Noor Al-Bayan',
    ctaLabel: 'احجز تجربة مجانية في العربية',
    image: IMG.arabic,
    courses: [
      course(['noor-al-bayan', 'نور البيان', 'للمبتدئين والأطفال', ['من عمر ٥ سنوات', 'بدون معرفة سابقة'], 'المنهج الأوثق لتعلُّم قراءة العربية والقرآن من الصفر.', 40, 'Noor Al-Bayan', '/online-arabic-classes/']),
      course(['grammar', 'النحو والصرف', 'متن الآجرومية', ['متوسط', 'منهج تراثي'], 'قواعد العربية التراثية من خلال متن الآجرومية.', 64, 'Arabic Grammar', '/online-arabic-classes/']),
      course(['conversation', 'المحادثة العربية', 'الفصحى المعاصرة', ['كل المستويات', 'طلاقة'], 'مهارات تحدُّث عملية للحياة اليومية ولمتابعة الدروس الشرعية.', 64, 'Arabic Conversation', '/online-arabic-classes/']),
    ],
  },
  {
    id: 'kids',
    title: 'أشبال الأمة',
    subtitle: 'للأطفال من ٥ إلى ١٤ عامًا',
    icon: 'star',
    intro: 'القرآن والعربية والقيم الإسلامية بالألعاب والقصص — حصص مدتها ٣٠ دقيقة ينتظرها الطفل بشوق.',
    points: ['قراءة القرآن بمنهج نور البيان', 'دراسات إسلامية بالقصص والألعاب', 'حصص ٣٠ دقيقة تناسب تركيز الطفل', 'أوسمة إنجاز شهرية'],
    from: 40,
    href: HREF.kids,
    trial: 'Ummah Cubs (Kids)',
    ctaLabel: 'احجز تجربة مجانية لطفلي',
    image: IMG.kids,
    courses: [
      course(['little-explorers', 'المستكشفون الصغار', '٥–٧ سنوات', ['تأسيس', 'قصص وألعاب'], 'أول الحروف العربية وقصص إسلامية وسور قصيرة — حصص مرحة مدتها ٣٠ دقيقة.', 40, 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/']),
      course(['growing-learners', 'المتعلمون الناشئون', '٨–١٠ سنوات', ['نور البيان', 'السور القصيرة'], 'طلاقة حقيقية في القراءة، وحفظ السور القصيرة، وقيم عبر القصص.', 40, 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/']),
      course(['junior-scholars', 'العلماء الصغار', '١١–١٤ سنة', ['مسار منظَّم', 'أوسمة شهرية'], 'حفظ أكثر تنظيمًا ودراسات إسلامية أعمق، استعدادًا لمسارات الشباب والكبار.', 40, 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/']),
    ],
  },
  {
    id: 'islamic',
    title: 'الدراسات الإسلامية',
    subtitle: 'عقيدة · فقه · تفسير · سيرة',
    icon: 'mosque',
    intro: 'منهج حقيقي لفهم دينك — يقدّمه علماء يجيبون عن أسئلتك أنت.',
    points: ['العقيدة — أركان الإيمان الستة بأدلتها', 'الفقه — أحكام العبادات العملية', 'التفسير — المعاني والدروس للحياة', 'السيرة — حياة النبي ﷺ وهديه'],
    from: 64,
    href: HREF.islamic,
    trial: 'Islamic Studies',
    ctaLabel: 'احجز تجربة مجانية في الدراسات الإسلامية',
    image: IMG.islamic,
    courses: [
      course(['aqeedah', 'العقيدة', 'أسس الإيمان', ['الأركان الستة', 'أدلة قرآنية'], 'إيمان راسخ من خلال أركان الإيمان الستة، مؤصَّلًا بالأدلة الصحيحة.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
      course(['fiqh', 'الفقه', 'عبادات اليوم', ['أحكام عملية', 'أخطاء شائعة'], 'الصلاة والطهارة وأحكام الحياة اليومية — بثقة وبالدليل.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
      course(['tafseer', 'التفسير', 'معاني القرآن', ['آية بآية', 'دروس للحياة'], 'تجاوز الترجمة إلى المعاني العميقة والدروس في كل آية.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
      course(['seerah', 'السيرة', 'السيرة النبوية', ['حياة النبي ﷺ', 'الأخلاق'], 'حياة النبي ﷺ — أخلاقه وتحدياته وهديه الخالد.', 64, 'Islamic Studies', '/online-islamic-studies-classes/']),
    ],
  },
];

export const getTracks = (lang: Lang = 'en'): Track[] => (lang === 'ar' ? AR : EN);
export const trackById = (id: TrackId, lang: Lang = 'en') => getTracks(lang).find((t) => t.id === id)!;
/** Backwards-compatible default export for English-only templates. */
export const TRACKS = EN;

/** Booking options: canonical value (stored/sent to the team) + localized labels. */
export const TRIAL_COURSES = [
  { value: 'Quran Recitation', track: 'quran', en: 'Quran Recitation', ar: 'تلاوة القرآن', de: 'Koranrezitation', fr: 'Récitation du Coran', it: 'Recitazione del Corano' },
  { value: 'Tajweed Rules', track: 'quran', en: 'Tajweed Rules', ar: 'أحكام التجويد', de: 'Tajweed-Regeln', fr: 'Règles de tajwid', it: 'Regole del Tajweed' },
  { value: 'Quran Memorization (Hifz)', track: 'quran', en: 'Hifz (memorisation)', ar: 'حفظ القرآن', de: 'Hifz (Auswendiglernen)', fr: 'Hifz (mémorisation)', it: 'Hifz (memorizzazione)' },
  { value: 'Ijazah Program', track: 'quran', en: 'Ijazah programme', ar: 'برنامج الإجازة', de: 'Ijaza-Programm', fr: 'Programme d’ijaza', it: 'Programma di ijaza' },
  { value: 'Noor Al-Bayan', track: 'arabic', en: 'Noor Al-Bayan (reading)', ar: 'نور البيان (القراءة)', de: 'Noor Al-Bayan (Lesen)', fr: 'Noor Al-Bayan (lecture)', it: 'Noor Al-Bayan (lettura)' },
  { value: 'Arabic Grammar', track: 'arabic', en: 'Arabic grammar', ar: 'النحو والصرف', de: 'Arabische Grammatik', fr: 'Grammaire arabe', it: 'Grammatica araba' },
  { value: 'Arabic Conversation', track: 'arabic', en: 'Arabic conversation', ar: 'المحادثة العربية', de: 'Arabische Konversation', fr: 'Conversation en arabe', it: 'Conversazione in arabo' },
  { value: 'Ummah Cubs (Kids)', track: 'kids', en: 'Ummah Cubs (kids 5–14)', ar: 'أشبال الأمة (٥–١٤ سنة)', de: 'Ummah Cubs (Kinder 5–14)', fr: 'Ummah Cubs (enfants 5–14 ans)', it: 'Ummah Cubs (bambini 5–14)' },
  { value: 'Islamic Studies', track: 'islamic', en: 'Islamic studies', ar: 'الدراسات الإسلامية', de: 'Islamische Studien', fr: 'Sciences islamiques', it: 'Studi islamici' },
] as const;

export const courseLabel = (c: (typeof TRIAL_COURSES)[number], lang: Lang) => c[lang];
