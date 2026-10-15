/**
 * One view over every article in every language, plus the translation clusters
 * that drive hreflang, the language menu and "also available in".
 *
 *  en  src/content/blog/<slug>.md            → /<slug>/            (WordPress parity)
 *  ar  src/content/blog-ar/<slug>.md         → /ar/blog/<slug>/    (Arabic originals; optional translationOf)
 *  de/fr/it  src/content/blog-tr/<lang>/<slug>.md → /<lang>/blog/<slug>/  (translations; translationOf required)
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGS, type Lang, type Alternates } from '@/i18n';

export type AnyPost = CollectionEntry<'blog'> | CollectionEntry<'blogAr'> | CollectionEntry<'blogTr'>;

export interface Post {
  lang: Lang;
  slug: string;
  url: string;
  /** the English article this one belongs to (its own slug for English posts) */
  enId?: string;
  entry: AnyPost;
}

interface Blog {
  posts: Post[];
  /** English slug → every language's URL */
  clusters: Map<string, Alternates>;
}

let cache: Promise<Blog> | undefined;

export function loadBlog(): Promise<Blog> {
  return (cache ??= (async () => {
    const [en, ar, tr] = await Promise.all([getCollection('blog'), getCollection('blogAr'), getCollection('blogTr')]);
    const posts: Post[] = [
      ...en.map((e) => ({ lang: 'en' as Lang, slug: e.id, url: `/${e.id}/`, enId: e.id, entry: e })),
      ...ar.map((e) => ({ lang: 'ar' as Lang, slug: e.id, url: `/ar/blog/${e.id}/`, enId: e.data.translationOf, entry: e })),
      ...tr.map((e) => {
        const [lang, slug] = e.id.split('/') as [Lang, string];
        return { lang, slug, url: `/${lang}/blog/${slug}/`, enId: e.data.translationOf, entry: e };
      }),
    ];
    const enIds = new Set(en.map((e) => e.id));
    const clusters = new Map<string, Alternates>();
    for (const p of posts) {
      if (!p.enId) continue;
      if (!enIds.has(p.enId)) throw new Error(`${p.url}: translationOf "${p.enId}" is not an English article`);
      const c = clusters.get(p.enId) ?? {};
      if (c[p.lang]) throw new Error(`Two ${p.lang} translations of "${p.enId}": ${c[p.lang]} and ${p.url}`);
      c[p.lang] = p.url;
      clusters.set(p.enId, c);
    }
    posts.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
    return { posts, clusters };
  })());
}

export async function postsIn(lang: Lang) {
  return (await loadBlog()).posts.filter((p) => p.lang === lang);
}

/** The full translation cluster of a post (undefined when it exists in one language only). */
export async function clusterOf(p: Post): Promise<Alternates | undefined> {
  if (!p.enId) return undefined;
  const c = (await loadBlog()).clusters.get(p.enId);
  if (!c || Object.keys(c).length < 2) return undefined;
  // stable, menu-ordered object
  return Object.fromEntries(LANGS.filter((l) => c[l]).map((l) => [l, c[l]]));
}

/** Previous/next links within one language, newest first. */
export function neighbours(list: Post[], i: number) {
  const prev = list[i + 1];
  const next = list[i - 1];
  return {
    prev: prev ? { href: prev.url, title: prev.entry.data.title } : null,
    next: next ? { href: next.url, title: next.entry.data.title } : null,
  };
}
