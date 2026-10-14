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

export type Copy = typeof en;
export type UIStrings = Copy['ui'];

const REGISTRY: Record<string, Copy> = { en, ar: ar as unknown as Copy };

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
  for (const [lang, mod] of Object.entries(REGISTRY)) if (lang !== 'en') compare(en, mod, '', lang, issues);
  if (issues.length) throw new Error(`Locale shape mismatch (${issues.length}):\n  ${issues.join('\n  ')}`);
}

const warned = new Set<string>();
export function copy(lang: Lang): Copy {
  assertParity();
  const c = REGISTRY[lang];
  if (c) return c;
  // While a locale is being translated it renders in English; strict builds (npm run qa) refuse.
  if (process.env.I18N_STRICT) throw new Error(`No locale registered for "${lang}" in src/locales/index.ts`);
  if (!warned.has(lang)) {
    warned.add(lang);
    console.warn(`[i18n] "${lang}" is not registered yet — rendering English copy`);
  }
  return en;
}

export const ui = (lang: Lang): UIStrings => copy(lang).ui;
