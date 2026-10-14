/**
 * Global site facts. Single source of truth for brand, contact and links.
 * Values are taken from the live site (ummahacademy.net, crawled Oct 2026).
 */

const env = import.meta.env;

export const SITE = {
  name: 'Ummah Academy',
  nameAr: 'أكاديمية الأمة',
  url: 'https://ummahacademy.net',
  locale: 'en',
  description:
    'Live 1-on-1 Quran, Tajweed, Arabic and Islamic Studies with Al-Azhar certified teachers. Start with 2 free trial sessions — no card needed.',
  email: 'info@ummahacademy.net',
  whatsapp: {
    number: '971502760242',
    display: '+971 50 276 0242',
  },
  /**
   * The student/family portal currently lives on WordPress. Before DNS cut-over,
   * move it to a sub-domain (e.g. https://portal.ummahacademy.net) and set
   * PUBLIC_PORTAL_URL. See docs/06-launch-checklist.md.
   */
  portalBase: (env.PUBLIC_PORTAL_URL as string | undefined) ?? 'https://ummahacademy.net',
  leadEndpoint: (env.PUBLIC_LEAD_ENDPOINT as string | undefined) ?? '',
  social: [] as { label: string; href: string }[],
} as const;

export const portalLinks = {
  login: `${SITE.portalBase.replace(/\/$/, '')}/login/`,
  register: `${SITE.portalBase.replace(/\/$/, '')}/register/student-access/`,
};

export function waLink(text?: string): string {
  const base = `https://wa.me/${SITE.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function trialLink(params: Record<string, string> = {}): string {
  const q = new URLSearchParams(params).toString();
  return `/contact/${q ? `?${q}` : ''}#book`;
}

export const NAV = {
  primary: [
    { label: 'Courses', href: '/courses/', mega: true },
    { label: 'Teachers', href: '/teachers/' },
    { label: 'Pricing', href: '/pricing/' },
    { label: 'Family Portal', href: '/family-portal/' },
    { label: 'About', href: '/about/' },
    { label: 'Blog', href: '/blog/' },
  ],
  footer: {
    Learn: [
      { label: 'All courses', href: '/courses/' },
      { label: 'Quran Recitation & Tajweed', href: '/quran-recitation-course/' },
      { label: 'Hifz & Ijazah', href: '/quran-memorization-hifz/' },
      { label: 'Arabic Language', href: '/online-arabic-classes/' },
      { label: 'Ummah Cubs (Kids)', href: '/ummah-cubs-kids-islamic-studies/' },
      { label: 'Islamic Studies', href: '/online-islamic-studies-classes/' },
    ],
    Academy: [
      { label: 'About us', href: '/about/' },
      { label: 'Our teachers', href: '/teachers/' },
      { label: 'Pricing', href: '/pricing/' },
      { label: 'Family Portal', href: '/family-portal/' },
      { label: 'Careers', href: '/career/' },
    ],
    Resources: [
      { label: 'Placement test', href: '/placement-test/' },
      { label: 'Blog', href: '/blog/' },
      { label: 'Free library', href: '/resources/' },
      { label: 'FAQ', href: '/faq/' },
      { label: 'Contact', href: '/contact/' },
    ],
  },
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Terms of Service', href: '/terms-of-service/' },
  ],
} as const;
