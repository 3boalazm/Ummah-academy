/**
 * Display currencies for the public site. The academy bills in USD
 * (`src/data/prices.json`) until FIN-001 says otherwise. These rates are
 * indicative, dated, and never written into JSON-LD or invoices.
 *
 * AED and SAR use the published pegs. EUR and GBP are rounded mid-market
 * figures for 2026-10-17 — update `asOf` and `perUsd` together.
 */
import { type Lang } from '@/i18n';

export type FxCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR';

export interface FxCurrency {
  code: FxCode;
  /** units of this currency per 1 US dollar */
  perUsd: number;
  /** ISO-ish short label shown on the dock pill */
  short: string;
}

export const FX_AS_OF = '2026-10-17';
export const FX_BILLED: FxCode = 'USD';
export const FX_KEY = 'ua:fx';
export const FX: readonly FxCurrency[] = [
  { code: 'USD', perUsd: 1, short: 'USD' },
  { code: 'EUR', perUsd: 0.86, short: 'EUR' },
  { code: 'GBP', perUsd: 0.75, short: 'GBP' },
  { code: 'AED', perUsd: 3.6725, short: 'AED' },
  { code: 'SAR', perUsd: 3.75, short: 'SAR' },
];

export const isFx = (v: unknown): v is FxCode => FX.some((c) => c.code === v);

const toArabicDigits = (s: string) => s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
const NBSP = '\u00a0';

/** Convert a whole-dollar USD amount for display (never for charging). */
export const convertUsd = (usd: number, code: FxCode): number => {
  const row = FX.find((c) => c.code === code) ?? FX[0];
  return Math.round(usd * row.perUsd);
};

/** Format an already-converted amount in the page language. */
export function formatFx(lang: Lang, code: FxCode, amount: number): string {
  const n = lang === 'ar' ? toArabicDigits(String(amount)) : lang === 'de' || lang === 'fr' || lang === 'it' ? String(amount).replace('.', ',') : String(amount);
  const ar = lang === 'ar';
  switch (code) {
    case 'USD':
      return lang === 'en' ? `$${amount}` : `${n}${NBSP}$`;
    case 'EUR':
      return lang === 'en' ? `€${amount}` : `${n}${NBSP}€`;
    case 'GBP':
      return lang === 'en' ? `£${amount}` : `${n}${NBSP}£`;
    case 'AED':
      return ar ? `${n}${NBSP}د.إ` : `AED${NBSP}${amount}`;
    case 'SAR':
      return ar ? `${n}${NBSP}ر.س` : `SAR${NBSP}${amount}`;
  }
}

export const formatUsd = (lang: Lang, usd: number) => formatFx(lang, 'USD', usd);
