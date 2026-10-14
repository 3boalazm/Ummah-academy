/**
 * Global site facts — single source of truth for brand, contact and links.
 * Values from the live site (ummahacademy.net, crawled Oct 2026). The business
 * must confirm the canonical WhatsApp number (the live site shows two).
 */
import { lp, type Lang } from '@/i18n';

const env = import.meta.env;

export const SITE = {
  name: 'Ummah Academy',
  nameAr: 'أكاديمية الأمة',
  url: 'https://ummahacademy.net',
  description:
    'Live 1-on-1 Qur’an, Tajweed, Arabic and Islamic studies with Al-Azhar teachers who hold a verified Ijazah. For kids and adults in every time zone — your first 2 sessions are free.',
  descriptionAr:
    'حصص مباشرة فردية في القرآن والتجويد والعربية والدراسات الإسلامية مع معلمين من الأزهر يحملون إجازة موثقة، للأطفال والكبار في كل المناطق الزمنية — أول حصتين مجانًا.',
  email: 'info@ummahacademy.net',
  whatsapp: {
    number: '971502760242',
    display: '+971 50 276 0242',
  },
  /**
   * Student/family portal (WordPress today). Before DNS cut-over, move it to a
   * sub-domain and set PUBLIC_PORTAL_URL. See docs/06-launch-checklist.md.
   */
  portalBase: (env.PUBLIC_PORTAL_URL as string | undefined) ?? 'https://ummahacademy.net',
  leadEndpoint: (env.PUBLIC_LEAD_ENDPOINT as string | undefined) ?? '',
} as const;

export const portalLinks = {
  login: `${SITE.portalBase.replace(/\/$/, '')}/login/`,
  register: `${SITE.portalBase.replace(/\/$/, '')}/register/student-access/`,
};

export function waLink(text?: string): string {
  const base = `https://wa.me/${SITE.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function trialLink(params: Record<string, string> = {}, lang: Lang = 'en'): string {
  const q = new URLSearchParams(params).toString();
  return `${lp(lang, '/contact/')}${q ? `?${q}` : ''}#book`;
}

export const FOOTER_LINKS = (lang: Lang) => {
  const ar = lang === 'ar';
  return {
    learn: [
      { label: ar ? 'كل الدورات' : 'All courses', href: lp(lang, '/courses/') },
      { label: ar ? 'التلاوة والتجويد' : 'Quran Recitation & Tajweed', href: lp(lang, '/quran-recitation-course/') },
      { label: ar ? 'الحفظ والإجازة' : 'Hifz & Ijazah', href: lp(lang, '/quran-memorization-hifz/') },
      { label: ar ? 'اللغة العربية' : 'Arabic Language', href: lp(lang, '/online-arabic-classes/') },
      { label: ar ? 'أشبال الأمة (للأطفال)' : 'Ummah Cubs (kids)', href: lp(lang, '/ummah-cubs-kids-islamic-studies/') },
      { label: ar ? 'الدراسات الإسلامية' : 'Islamic Studies', href: lp(lang, '/online-islamic-studies-classes/') },
    ],
    academy: [
      { label: ar ? 'من نحن' : 'About us', href: lp(lang, '/about/') },
      { label: ar ? 'المعلمون' : 'Our teachers', href: lp(lang, '/teachers/') },
      { label: ar ? 'الأسعار' : 'Pricing', href: lp(lang, '/pricing/') },
      { label: ar ? 'بوابة الأسرة' : 'Family Portal', href: lp(lang, '/family-portal/') },
      { label: ar ? 'انضم إلينا كمعلم' : 'Teach with us', href: lp(lang, '/career/') },
    ],
    resources: [
      { label: ar ? 'اختبار تحديد المستوى' : 'Placement test', href: lp(lang, '/placement-test/') },
      { label: ar ? 'المدونة' : 'Blog', href: lp(lang, '/blog/') },
      { label: ar ? 'المكتبة المجانية' : 'Free library', href: lp(lang, '/resources/') },
      { label: ar ? 'الأسئلة الشائعة' : 'FAQ', href: lp(lang, '/faq/') },
      { label: ar ? 'احجز تجربة / تواصل' : 'Book a trial / contact', href: lp(lang, '/contact/') },
    ],
  };
};
