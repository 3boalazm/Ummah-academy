import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: 'Ummah Academy — Blog',
    description: 'Practical guides on Quran, Tajweed, Hifz, Arabic and Islamic studies.',
    site: context.site ?? 'https://ummahacademy.net',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/${p.id}/`,
      categories: [p.data.category],
    })),
  });
}
