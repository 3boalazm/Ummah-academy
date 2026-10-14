/**
 * Minimal, type-safe i18n for a two-locale static site.
 * English lives at the root (URL parity with WordPress); Arabic at /ar/.
 */
export type Lang = 'en' | 'ar';
export const LANGS: Lang[] = ['en', 'ar'];
export const dirOf = (l: Lang) => (l === 'ar' ? 'rtl' : 'ltr');

/** English routes that also exist in Arabic. */
export const BILINGUAL_ROUTES = [
  '/',
  '/courses/',
  '/pricing/',
  '/teachers/',
  '/about/',
  '/contact/',
  '/placement-test/',
  '/faq/',
  '/career/',
  '/thank-you/',
  '/quran-recitation-course/',
  '/quran-memorization-hifz/',
  '/online-arabic-classes/',
  '/ummah-cubs-kids-islamic-studies/',
  '/online-islamic-studies-classes/',
] as const;

export const langFromPath = (pathname: string): Lang => (pathname === '/ar' || pathname.startsWith('/ar/') ? 'ar' : 'en');

/** Strip the locale prefix → the canonical English path. */
export const basePath = (pathname: string) => (langFromPath(pathname) === 'ar' ? pathname.replace(/^\/ar/, '') || '/' : pathname);

/** Build a path in a given locale from an English path. */
export const lp = (lang: Lang, path: string) => {
  if (lang === 'en') return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [p, rest = ''] = path.split(/(?=[?#])/);
  const has = (BILINGUAL_ROUTES as readonly string[]).includes(p);
  return has ? `/ar${p}${rest}` : path;
};

/** Counterpart of the current page in the other language (falls back to that language's home). */
export const counterpart = (pathname: string) => {
  const lang = langFromPath(pathname);
  const base = basePath(pathname);
  const exists = (BILINGUAL_ROUTES as readonly string[]).includes(base);
  if (lang === 'en') return { lang: 'ar' as Lang, href: exists ? `/ar${base}` : '/ar/' };
  return { lang: 'en' as Lang, href: base };
};

export const hasArabic = (pathname: string) => (BILINGUAL_ROUTES as readonly string[]).includes(basePath(pathname));

const toArabicDigits = (s: string) => s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
export const num = (lang: Lang, v: string | number) => (lang === 'ar' ? toArabicDigits(String(v)) : String(v));
export const price = (lang: Lang, v: number) => (lang === 'ar' ? `${toArabicDigits(String(v))} $` : `$${v}`);

/** Shared UI strings. Page copy lives next to each view in src/content-i18n. */
export const UI = {
  en: {
    nav: { courses: 'Courses', teachers: 'Teachers', pricing: 'Pricing', about: 'About', blog: 'Blog', faq: 'FAQ', contact: 'Contact', portal: 'Family Portal' },
    signIn: 'Sign in',
    bookTrial: 'Book free trial',
    bookTrialShort: 'Free trial',
    book2: 'Book 2 free sessions',
    findLevel: 'Find my level',
    whatsapp: 'Chat on WhatsApp',
    from: 'From',
    perMonth: '/mo',
    perMonthLong: 'per month',
    explore: 'Explore',
    learnMore: 'Learn more',
    readMore: 'Read more',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    skip: 'Skip to content',
    home: 'Home',
    allCourses: 'All courses',
    compareCourses: 'Compare all courses',
    placementTest: 'Placement test',
    notSure: 'Not sure where to start?',
    takeTest: 'Take the free 3-minute placement test',
    langSwitch: 'العربية',
    langSwitchLabel: 'اقرأ الموقع بالعربية',
    footerMission: 'Live 1-on-1 Qur’an, Arabic and Islamic studies with Al-Azhar scholars who hold a verified chain of transmission — for families in 50+ countries.',
    footerCols: { learn: 'Learn', academy: 'Academy', resources: 'Resources' },
    rights: 'All rights reserved.',
    footerNote: 'Serving 50+ countries · Lessons around the clock',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    careers: 'Careers',
    library: 'Free library',
    sticky: { book: 'Book free trial', wa: 'WhatsApp' },
    noCard: 'No card · Cancel anytime',
  },
  ar: {
    nav: { courses: 'الدورات', teachers: 'المعلمون', pricing: 'الأسعار', about: 'من نحن', blog: 'المدونة', faq: 'الأسئلة الشائعة', contact: 'تواصل معنا', portal: 'بوابة الأسرة' },
    signIn: 'تسجيل الدخول',
    bookTrial: 'احجز تجربة مجانية',
    bookTrialShort: 'تجربة مجانية',
    book2: 'احجز حصتين مجانًا',
    findLevel: 'اعرف مستواك',
    whatsapp: 'تواصل عبر واتساب',
    from: 'تبدأ من',
    perMonth: '/شهريًا',
    perMonthLong: 'شهريًا',
    explore: 'استكشف',
    learnMore: 'اعرف المزيد',
    readMore: 'اقرأ المزيد',
    menuOpen: 'فتح القائمة',
    menuClose: 'إغلاق القائمة',
    skip: 'تخطَّ إلى المحتوى',
    home: 'الرئيسية',
    allCourses: 'كل الدورات',
    compareCourses: 'قارن بين الدورات',
    placementTest: 'اختبار تحديد المستوى',
    notSure: 'لست متأكدًا من أين تبدأ؟',
    takeTest: 'خذ اختبار تحديد المستوى المجاني (٣ دقائق)',
    langSwitch: 'English',
    langSwitchLabel: 'Read this page in English',
    footerMission: 'حصص مباشرة فردية في القرآن والعربية والعلوم الإسلامية مع علماء من الأزهر يحملون سندًا متصلًا موثقًا — لأسر في أكثر من ٥٠ دولة.',
    footerCols: { learn: 'تعلَّم', academy: 'الأكاديمية', resources: 'مصادر' },
    rights: 'جميع الحقوق محفوظة.',
    footerNote: 'نخدم أكثر من ٥٠ دولة · حصص على مدار الساعة',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    careers: 'الوظائف',
    library: 'المكتبة المجانية',
    sticky: { book: 'احجز تجربة مجانية', wa: 'واتساب' },
    noCard: 'بدون بطاقة دفع · إلغاء في أي وقت',
  },
} as const;

export type UIStrings = (typeof UI)['en'];
export const ui = (lang: Lang): UIStrings => UI[lang] as unknown as UIStrings;
