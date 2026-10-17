/**
 * Family stories shown on Home, teacher profiles and /reviews/.
 * Edited in the CMS (/admin/ → Reviews) as src/content/reviews/<lang>.json.
 * English is the id/track/teacher source of truth; other locales must keep
 * the same ids in the same order or the build fails.
 */
import type { Lang } from '@/i18n';
import en from '@/content/reviews/en.json';
import ar from '@/content/reviews/ar.json';
import de from '@/content/reviews/de.json';
import fr from '@/content/reviews/fr.json';
import it from '@/content/reviews/it.json';

export interface Testimonial {
  id: string;
  quote: string;
  result: string;
  name: string;
  initials: string;
  location: string;
  program: string;
  track: 'quran' | 'arabic' | 'kids' | 'islamic';
  teacher?: string;
}

const FILES: Record<Lang, { items: Testimonial[] }> = { en, ar, de, fr, it };
const TRACKS = new Set(['quran', 'arabic', 'kids', 'islamic']);

function load(lang: Lang): Testimonial[] {
  const items = FILES[lang]?.items;
  const ref = en.items;
  if (!items) throw new Error(`[reviews] missing ${lang}.json`);
  if (items.length !== ref.length) throw new Error(`[reviews] ${lang}.json has ${items.length} items, expected ${ref.length}`);
  return items.map((row, i) => {
    const base = ref[i];
    if (row.id !== base.id) throw new Error(`[reviews] ${lang}.json item ${i} id "${row.id}" ≠ "${base.id}"`);
    if (row.track !== base.track) throw new Error(`[reviews] ${lang}.json ${row.id}: track must match English`);
    if ((row.teacher || '') !== (base.teacher || '')) throw new Error(`[reviews] ${lang}.json ${row.id}: teacher must match English`);
    if (!TRACKS.has(row.track)) throw new Error(`[reviews] ${row.id}: bad track`);
    const teacher = row.teacher?.trim() || undefined;
    return { ...row, initials: base.initials, teacher };
  });
}

const cache = new Map<Lang, Testimonial[]>();
export const getTestimonials = (lang: Lang = 'en'): Testimonial[] => {
  if (!cache.has(lang)) cache.set(lang, load(lang));
  return cache.get(lang)!;
};
export const TESTIMONIALS = getTestimonials('en');
