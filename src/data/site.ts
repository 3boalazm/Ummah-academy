/**
 * Global site facts — single source of truth for brand, contact and links.
 * Values from the live site (ummahacademy.net, crawled Oct 2026).
 * WhatsApp +971 50 276 0242 was confirmed by the business on 2026-10-15.
 * The e-mail domain (.net vs .com) is still to be confirmed (Linear ABO-37).
 */
import { lp, type Lang } from '@/i18n';

const env = import.meta.env;

export const SITE = {
  name: 'Ummah Academy',
  nameAr: 'أكاديمية الأمة',
  url: 'https://ummahacademy.net',
  description:
    'Live 1-on-1 Qur’an, Tajweed, Arabic and Islamic studies with Al-Azhar teachers who hold a verified Ijazah. For kids and adults in every time zone — your first 2 sessions are free.',
  email: 'info@ummahacademy.net',
  /**
   * Languages lessons and support are given in (ISO 639-1). This is NOT the list of
   * website languages: DE/FR/IT pages say plainly that lessons are in these languages.
   * Add 'de' / 'fr' / 'it' here once teachers for that language are on staff.
   */
  teachingLanguages: ['en', 'ar'],
  whatsapp: {
    number: '971502760242',
    display: '+971 50 276 0242',
  },
  /**
   * Student/family portal (WordPress today). Before DNS cut-over, move it to a
   * sub-domain and set PUBLIC_PORTAL_URL. See docs/06-launch-checklist.md.
   */
  portalBase: (env.PUBLIC_PORTAL_URL as string | undefined) ?? 'https://ummahacademy.net',
  /**
   * Provider identification for the legal notice (German "Impressum", § 5 DDG; French
   * "mentions légales"). Leave null until the business supplies real data — the page
   * /legal-notice/ (+ /de/ /fr/ /it/ /ar/) and its footer link only exist when this is set.
   * Never publish placeholders. Linear: launch gate "Impressum data".
   */
  legalEntity: null as null | {
    name: string;
    legalForm?: string;
    address: string[];
    representative?: string;
    register?: string;
    vatId?: string;
  },
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

/** Footer columns — routes here, labels in src/locales/<lang>/ui.ts (footerLinks, same order). */
const FOOTER_ROUTES = {
  learn: ['/courses/', '/quran-recitation-course/', '/quran-memorization-hifz/', '/online-arabic-classes/', '/ummah-cubs-kids-islamic-studies/', '/online-islamic-studies-classes/'],
  academy: ['/about/', '/teachers/', '/pricing/', '/family-portal/', '/career/'],
  resources: ['/placement-test/', '/blog/', '/resources/', '/faq/', '/contact/'],
} as const;

export const FOOTER_LINKS = (lang: Lang, labels: Record<keyof typeof FOOTER_ROUTES, readonly string[]>) =>
  Object.fromEntries(
    (Object.keys(FOOTER_ROUTES) as (keyof typeof FOOTER_ROUTES)[]).map((k) => [k, FOOTER_ROUTES[k].map((href, i) => ({ label: labels[k][i], href: lp(lang, href) }))]),
  ) as Record<keyof typeof FOOTER_ROUTES, { label: string; href: string }[]>;
