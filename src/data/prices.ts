/**
 * The ONE place prices live. Edit src/data/prices.json (by hand or in the CMS at /admin/)
 * and every mention updates in all five languages: the pricing page and its JSON-LD,
 * course and track cards, the mega menu, page titles and meta descriptions, FAQs, the
 * booking wizard, the placement-test recommendation — nothing is typed twice.
 *
 * Plan structure (minutes, sessions per week) lives in src/data/pricing.ts with the plan
 * copy, because changing it changes what the plan *is* — that's a developer change.
 */
import data from './prices.json';
import { num, price, type Lang } from '@/i18n';

export type PlanId = 'launch' | 'consistent' | 'elite' | 'starter' | 'gold' | 'diamond';
const IDS: PlanId[] = ['launch', 'consistent', 'elite', 'starter', 'gold', 'diamond'];

// Fail the build — never the page — if an edit leaves a price that isn't a sane whole number.
for (const id of IDS) {
  const v = (data.plans as Record<string, unknown>)[id];
  if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > 10000) {
    throw new Error(`src/data/prices.json: plans.${id} must be a whole number of US dollars between 1 and 10000 (got ${JSON.stringify(v)})`);
  }
}
if (data.currency !== 'USD') throw new Error('src/data/prices.json: only "USD" is supported for now (see Linear ABO-43)');

export const PRICES = data.plans as Record<PlanId, number>;

const min = (ids: PlanId[]) => Math.min(...ids.map((i) => PRICES[i]));
const max = (ids: PlanId[]) => Math.max(...ids.map((i) => PRICES[i]));
/** Derived facts copy refers to: the cheapest plan, the dearest, and the cheapest 60-minute plan. */
export const PRICE_FACTS = {
  from: min(IDS),
  to: max(IDS),
  from60: min(['starter', 'gold', 'diamond']),
} as const;

/**
 * Arabic counted noun for dollars after a figure: ٥ دولارات · ٤٠ دولارًا · ١٠٠ دولار · ١٢٨ دولارًا.
 * (3–10 → plural genitive; 11–99 → singular accusative; round hundreds/thousands → singular genitive;
 * above 100 the last two digits decide.)
 */
export function arDollarNoun(n: number): string {
  const r = n % 100;
  if (n === 1) return 'دولار واحد';
  if (n === 2) return 'دولاران';
  if (r >= 3 && r <= 10) return 'دولارات';
  if (r >= 11 && r <= 99) return 'دولارًا';
  return 'دولار';
}

type Key = PlanId | keyof typeof PRICE_FACTS;
const ALL: Record<Key, number> = { ...PRICES, ...PRICE_FACTS };
const map = (f: (v: number) => string) => Object.fromEntries(Object.entries(ALL).map(([k, v]) => [k, f(v)])) as Record<Key, string>;

/**
 * Prices formatted for copy in one language.
 *   p.from        running-text form: "$40" · "40 $" (DE/FR/IT, no-break space) · "٤٠ دولارًا" (AR, words)
 *   p.sym.from    symbol form everywhere: "$40" · "40 $" · "٤٠ $"
 *   p.n.from      the bare figure in the locale's digits: "40" · "٤٠"
 */
export function prices(lang: Lang) {
  const sym = map((v) => price(lang, v));
  const n = map((v) => num(lang, v));
  const text = lang === 'ar' ? map((v) => `${num('ar', v)} ${arDollarNoun(v)}`) : sym;
  return { ...text, sym, n };
}

/**
 * Tokens for CMS-edited text (FAQ answers): {{from}} {{to}} {{from60}} {{launch}} … {{diamond}}
 * give the running-text form; add ":number" for the bare figure — e.g. "من {{from:number}} إلى {{to}}".
 */
export function fillPrices(lang: Lang, text: string): string {
  const p = prices(lang);
  return text.replace(/\{\{\s*(\w+)(?::(number|symbol))?\s*\}\}/g, (m, key: string, mode?: string) => {
    if (!(key in ALL)) throw new Error(`Unknown price token ${m} — use one of: ${Object.keys(ALL).join(', ')}`);
    return mode === 'number' ? p.n[key as Key] : mode === 'symbol' ? p.sym[key as Key] : p[key as Key];
  });
}
