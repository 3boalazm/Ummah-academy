/**
 * Locale registry — every human-language string on the site lives under
 * src/locales/<lang>/. English is the typed reference; every other locale must
 * mirror its shape. The parity check below runs once per build and fails the
 * build when a translation is missing a key, has a different array length or a
 * different value type — so a half-translated page can never ship silently.
 */
import type { Lang } from '@/i18n';
import * as en from './en';
import * as ar from './ar';
import * as de from './de';
import * as fr from './fr';
import * as it from './it';

export type Copy = typeof en;
export type UIStrings = Copy['ui'];

/** A locale may be partial while it is being translated (missing modules render in English). */
const REGISTRY: Record<string, Partial<Copy>> = { en, ar: ar as unknown as Copy, de: de as Partial<Copy>, fr: fr as Partial<Copy>, it: it as Partial<Copy> };

/** Keys a locale may legitimately omit or add (documented, intentional differences). */
const OPTIONAL: Record<string, string[]> = {
  // The Arabic blog index has two extra sections (Arabic articles + English library) and its own CTA.
  ar: ['blog.C.arHead', 'blog.C.enHead', 'blog.C.cta'],
};

type Issue = string;
function compare(ref: unknown, other: unknown, path: string, lang: string, out: Issue[]) {
  const optional = OPTIONAL[lang] ?? [];
  if (optional.includes(path)) return;
  const tr = Array.isArray(ref) ? 'array' : typeof ref;
  const to = Array.isArray(other) ? 'array' : typeof other;
  if (other === undefined) {
    out.push(`${lang}: missing ${path}`);
    return;
  }
  if (tr !== to) {
    out.push(`${lang}: ${path} is ${to}, expected ${tr}`);
    return;
  }
  if (tr === 'array') {
    const a = ref as unknown[];
    const b = other as unknown[];
    if (a.length !== b.length) out.push(`${lang}: ${path} has ${b.length} items, expected ${a.length}`);
    a.forEach((v, i) => b[i] !== undefined && compare(v, b[i], `${path}.${i}`, lang, out));
    return;
  }
  if (tr === 'object' && ref !== null) {
    const r = ref as Record<string, unknown>;
    const o = other as Record<string, unknown>;
    for (const k of Object.keys(r)) compare(r[k], o[k], path ? `${path}.${k}` : k, lang, out);
    for (const k of Object.keys(o)) if (!(k in r) && !optional.includes(path ? `${path}.${k}` : k)) out.push(`${lang}: unexpected ${path ? `${path}.${k}` : k}`);
  }
}

let checked = false;
function assertParity() {
  if (checked) return;
  checked = true;
  const issues: Issue[] = [];
  for (const [lang, mod] of Object.entries(REGISTRY)) {
    if (lang === 'en') continue;
    // only modules that exist are compared; missing modules are reported by copy()
    const present = Object.fromEntries(Object.keys(mod).map((k) => [k, (en as Record<string, unknown>)[k]]));
    compare(present, mod, '', lang, issues);
  }
  if (issues.length) throw new Error(`Locale shape mismatch (${issues.length}):\n  ${issues.join('\n  ')}`);
}

const warned = new Set<string>();
const merged = new Map<string, Copy>();
export function copy(lang: Lang): Copy {
  assertParity();
  if (merged.has(lang)) return merged.get(lang)!;
  const c = REGISTRY[lang];
  if (!c) throw new Error(`No locale registered for "${lang}" in src/locales/index.ts`);
  const missing = Object.keys(en).filter((k) => !(k in c));
  if (missing.length) {
    // While a locale is being translated, missing modules render in English in dev.
    // Production builds are strict (a half-translated locale must never ship); `astro dev` is lenient.
    if ((import.meta.env.PROD && !process.env.I18N_LENIENT) || process.env.I18N_STRICT) throw new Error(`Locale "${lang}" is missing modules: ${missing.join(', ')}`);
    if (!warned.has(lang)) {
      warned.add(lang);
      console.warn(`[i18n] "${lang}" missing ${missing.length} module(s), rendering English: ${missing.join(', ')}`);
    }
  }
  const full = { ...en, ...c } as Copy;
  merged.set(lang, full);
  return full;
}

/** Locales whose every module is translated (used by QA). */
export const completeLocales = () => Object.keys(REGISTRY).filter((l) => Object.keys(en).every((k) => k in REGISTRY[l]!));

export const ui = (lang: Lang): UIStrings => copy(lang).ui;
