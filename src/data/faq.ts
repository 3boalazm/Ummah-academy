/**
 * The /faq/ page questions live in src/content/faq/<lang>.json — editable in the CMS
 * (/admin/ → FAQ), all five languages side by side in one entry. This module turns that
 * editor-friendly text into the HTML the page renders:
 *   - {{from}}, {{to}}, {{launch}} … price tokens → the current price (src/data/prices.json)
 *   - [text](/pricing/) → a link to that page in the visitor's language
 *   - French: no-break space before ? ! : ; » and after « (typed spaces are fixed)
 * Bad input fails the build with a readable message, so it can never reach the live site.
 */
import { lp, typo, type Lang } from '@/i18n';
import { fillPrices } from '@/data/prices';

export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

const esc = (s: string) => s.replace(/&(?![a-z]+;|#\d+;|#x[0-9a-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** CMS text → safe inline HTML for one language. */
export function faqHtml(lang: Lang, text: string): string {
  let out = esc(fillPrices(lang, text.trim()));
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
    if (/^https?:\/\//.test(href)) return `<a href="${href}" rel="noopener">${label}</a>`;
    if (!href.startsWith('/')) throw new Error(`FAQ link "${href}" must start with / (a page on this site) or https://`);
    return `<a href="${lp(lang, href)}">${label}</a>`;
  });
  return typo(lang, out);
}

const plain = (lang: Lang, s: string) => typo(lang, fillPrices(lang, s.trim()));

/** Validate and render one language's FAQ file. */
export function faqGroups(lang: Lang, file: { groups: FaqGroup[] }): FaqGroup[] {
  const where = `src/content/faq/${lang}.json`;
  if (!Array.isArray(file?.groups) || !file.groups.length) throw new Error(`${where}: needs at least one topic`);
  const ids = new Set<string>();
  return file.groups.map((g, gi) => {
    if (!/^[a-z][a-z0-9-]*$/.test(g.id ?? '')) throw new Error(`${where}: topic ${gi + 1} needs an anchor like "pricing" (lowercase letters, digits, dashes)`);
    if (ids.has(g.id)) throw new Error(`${where}: anchor "${g.id}" is used twice`);
    ids.add(g.id);
    if (!g.title?.trim()) throw new Error(`${where}: topic "${g.id}" has no title`);
    if (!Array.isArray(g.items) || !g.items.length) throw new Error(`${where}: topic "${g.id}" has no questions`);
    return {
      id: g.id,
      title: plain(lang, g.title),
      items: g.items.map((it, i) => {
        if (!it.q?.trim() || !it.a?.trim()) throw new Error(`${where}: topic "${g.id}", question ${i + 1} is missing its question or answer`);
        return { q: plain(lang, it.q), a: faqHtml(lang, it.a) };
      }),
    };
  });
}
