import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { postsIn } from '@/data/blog';
import { PREFIXED, type Lang } from '@/i18n';
import { copy, ui } from '@/locales';

export const getStaticPaths = () => PREFIXED.map((locale) => ({ params: { locale } }));

/** One feed per language: /ar/rss.xml, /de/rss.xml, … (English: /rss.xml). */
export async function GET(context: APIContext) {
  const lang = context.params.locale as Lang;
  const t = ui(lang);
  const C = copy(lang).blog.C;
  const categories = C.categories as Record<string, string>;
  const posts = await postsIn(lang);
  return rss({
    title: `${t.siteName} — ${t.nav.blog}`,
    description: C.meta.desc,
    site: context.site ?? 'https://ummahacademy.net',
    customData: `<language>${lang}</language>`,
    items: posts.map((p) => ({
      title: p.entry.data.title,
      description: p.entry.data.description,
      pubDate: p.entry.data.date,
      link: p.url,
      categories: [lang === 'ar' ? p.entry.data.category : (categories[p.entry.data.category] ?? p.entry.data.category)],
    })),
  });
}
