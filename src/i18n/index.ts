/**
 * i18n engine for a five-locale static site.
 *
 * - English lives at the root (URL parity with the WordPress site).
 * - Every other locale lives at /<code>/ with the *same* page slugs (/de/pricing/).
 * - Blog articles are the exception: each locale has its own slugs, so their
 *   translation clusters are passed explicitly as `Alternates`.
 *
 * Strings never live here — they live in src/locales/<code>/. This module is
 * dependency-free so locale files can import its helpers without cycles.
 */
export type Lang = 'en' | 'ar' | 'de' | 'fr' | 'it';

export interface LocaleInfo {
  code: Lang;
  /** native name, shown in the language menu */
  name: string;
  /** English name (analytics, docs) */
  english: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 tag for Intl (dates, numbers) */
  intl: string;
  /** Open Graph locale */
  og: string;
  /** URL prefix ('' for the default locale) */
  prefix: string;
  /** compact label for the header pill */
  short: string;
}

export const LOCALE: Record<Lang, LocaleInfo> = {
  en: { code: 'en', name: 'English', english: 'English', dir: 'ltr', intl: 'en-GB', og: 'en_US', prefix: '', short: 'EN' },
  ar: { code: 'ar', name: 'العربية', english: 'Arabic', dir: 'rtl', intl: 'ar-EG', og: 'ar_AR', prefix: '/ar', short: 'AR' },
  de: { code: 'de', name: 'Deutsch', english: 'German', dir: 'ltr', intl: 'de-DE', og: 'de_DE', prefix: '/de', short: 'DE' },
  fr: { code: 'fr', name: 'Français', english: 'French', dir: 'ltr', intl: 'fr-FR', og: 'fr_FR', prefix: '/fr', short: 'FR' },
  it: { code: 'it', name: 'Italiano', english: 'Italian', dir: 'ltr', intl: 'it-IT', og: 'it_IT', prefix: '/it', short: 'IT' },
};

/** Menu order: the site's two original languages first, then the European locales. */
export const LANGS: Lang[] = ['en', 'ar', 'de', 'fr', 'it'];
export const DEFAULT_LANG: Lang = 'en';
/** Locales served under a /<code>/ prefix — the `[locale]` routes generate these. */
export const PREFIXED: Exclude<Lang, 'en'>[] = ['ar', 'de', 'fr', 'it'];
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as string[]).includes(v);
export const dirOf = (l: Lang) => LOCALE[l].dir;

/** English page paths that exist in every locale (mirrored slugs). */
export const TRANSLATED_ROUTES = [
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
  '/blog/',
  '/resources/',
  '/family-portal/',
  '/privacy-policy/',
  '/terms-of-service/',
  // Teacher profiles — keep in sync with src/data/people.ts (asserted at build time)
  '/teachers/omneya-ali/',
  '/teachers/sara-ahmed/',
  '/teachers/nour-hassan/',
] as const;
const ROUTES = TRANSLATED_ROUTES as readonly string[];

/** A page's translations: locale → path. Only locales that really have the page. */
export type Alternates = Partial<Record<Lang, string>>;

/** One entry of the language menu. `exact` = a true translation of this page (else a fallback). */
export interface LangTarget {
  lang: Lang;
  href: string;
  exact: boolean;
}

const PREFIX_RE = new RegExp(`^/(${PREFIXED.join('|')})(?=/|$)`);

export const langFromPath = (pathname: string): Lang => {
  const m = pathname.match(PREFIX_RE);
  return m ? (m[1] as Lang) : 'en';
};

/** Strip the locale prefix → the canonical English path. */
export const basePath = (pathname: string) => pathname.replace(PREFIX_RE, '') || '/';

export const isTranslated = (pathname: string) => ROUTES.includes(basePath(pathname));

/** Build a path in a given locale from an English path (untranslated paths stay English). */
export const lp = (lang: Lang, path: string) => {
  if (lang === 'en') return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [p, rest = ''] = path.split(/(?=[?#])/);
  return ROUTES.includes(p) ? `${LOCALE[lang].prefix}${p}${rest}` : path;
};

/** Mirrored translations of a page (empty when the page is not a translated route). */
export const mirrorAlternates = (pathname: string): Alternates => {
  const base = basePath(pathname);
  if (!ROUTES.includes(base)) return {};
  return Object.fromEntries(LANGS.map((l) => [l, lp(l, base)]));
};

/**
 * Where each language in the menu should go from this page: the true translation
 * when it exists, otherwise `fallback` (an English path, e.g. '/blog/') in that
 * language — so the switch can never 404.
 */
export const langTargets = (pathname: string, alternates?: Alternates, fallback = '/'): LangTarget[] => {
  const alt = alternates && Object.keys(alternates).length ? alternates : mirrorAlternates(pathname);
  return LANGS.map((l) => (alt[l] ? { lang: l, href: alt[l]!, exact: true } : { lang: l, href: lp(l, fallback), exact: false }));
};

/* ── Formatting ─────────────────────────────────────────────────────────── */

const NBSP = '\u00a0';
const toArabicDigits = (s: string) => s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

/** Digits only (copy already carries locale-specific separators). */
export const num = (lang: Lang, v: string | number) => (lang === 'ar' ? toArabicDigits(String(v)) : String(v));

/** Whole-dollar USD price in the locale's convention: $40 · ٤٠ $ · 40 $. */
export const price = (lang: Lang, v: number) => {
  if (lang === 'en') return `$${v}`;
  if (lang === 'ar') return `${toArabicDigits(String(v))}${NBSP}$`;
  return `${String(v).replace('.', ',')}${NBSP}$`;
};

/** Percentage: 65% · ٦٥٪ · 65 % (DE/FR) · 65% (IT). */
export const pct = (lang: Lang, v: number) => {
  if (lang === 'ar') return `${toArabicDigits(String(v))}٪`;
  if (lang === 'de' || lang === 'fr') return `${v}${NBSP}%`;
  return `${v}%`;
};

export const fmtDate = (lang: Lang, d: Date, month: 'long' | 'short' = 'long') => d.toLocaleDateString(LOCALE[lang].intl, { day: 'numeric', month, year: 'numeric' });

/**
 * Typography fixes for text typed by people (CMS, front-matter): French takes a no-break
 * space before ? ! : ; » and after « — typed spaces are converted, existing NBSPs kept.
 * Idempotent; other languages pass through. (Markdown bodies: scripts/markdown-french-spacing.mjs.)
 */
export const typo = (lang: Lang, s: string) => (lang === 'fr' ? s.replace(/[ \u00a0]+([?!:;»])/g, `${NBSP}$1`).replace(/«[ \u00a0]+/g, `«${NBSP}`) : s);

/** Language names rendered in a given locale ("Arabisch und Englisch"). */
export const listLanguages = (lang: Lang, codes: readonly string[]) => {
  const names = new Intl.DisplayNames([LOCALE[lang].intl], { type: 'language' });
  return new Intl.ListFormat(LOCALE[lang].intl, { type: 'conjunction' }).format(codes.map((c) => names.of(c) ?? c));
};

/** getStaticPaths for the `[locale]` page wrappers. */
export const localePaths = () => PREFIXED.map((locale) => ({ params: { locale } }));
