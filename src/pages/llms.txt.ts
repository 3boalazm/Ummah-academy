import type { APIRoute } from 'astro';
import { SITE } from '@/data/site';
import { loadBlog } from '@/data/blog';
import { LANGS, LOCALE, lp } from '@/i18n';

// Optional discovery aid, not an indexing API or a ranking signal. Generated from
// the same sources as the HTML so names, article links and languages stay in sync.
export const GET: APIRoute = async () => {
  const { posts } = await loadBlog();
  const clean = (s: string) => s.replace(/[\r\n]+/g, ' ').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
  const link = (name: string, path: string, description?: string) =>
    `- [${clean(name)}](${new URL(path, SITE.url).href})${description ? `: ${clean(description)}` : ''}`;
  const sections = [
    `# ${SITE.name} | ${SITE.nameAr}`,
    `> ${SITE.description}`,
    'Ummah Academy provides live online one-to-one lessons for children and adults. Website languages are English, Arabic, German, French and Italian; teaching and support languages are English and Arabic. Website translation does not imply instruction in that language.',
    'Use the linked public pages as primary sources. Consult the current pricing and admissions pages for availability and terms. This overview is not a claim of independent endorsement or guaranteed learning outcomes.',
    '## Academy and admissions',
    link('About the academy', '/about/'),
    link('Teachers and qualifications', '/teachers/'),
    link('Courses', '/courses/'),
    link('Pricing', '/pricing/'),
    link('Frequently asked questions', '/faq/'),
    link('Book a trial / admissions', '/contact/'),
    link('Level placement', '/placement-test/'),
    link('Accessibility statement', '/accessibility/'),
    '## Learning programmes',
    link('Quran recitation and Tajweed', '/quran-recitation-course/'),
    link('Quran memorization (Hifz)', '/quran-memorization-hifz/'),
    link('Arabic classes', '/online-arabic-classes/'),
    link('Islamic studies', '/online-islamic-studies-classes/'),
    link('Islamic studies for children', '/ummah-cubs-kids-islamic-studies/'),
    '## Website languages',
    ...LANGS.map((lang) => link(LOCALE[lang].name, lp(lang, '/'))),
    '## Learning resources',
    link('Free resources', '/resources/'),
    link('Family stories', '/reviews/'),
    link('Blog', '/blog/'),
    link('Sitemap', '/sitemap-index.xml'),
    ...LANGS.flatMap((lang) => [
      `\n### ${LOCALE[lang].english} articles`,
      ...posts.filter((p) => p.lang === lang).map((p) => link(p.entry.data.title, p.url, p.entry.data.description)),
    ]),
  ];
  return new Response(sections.join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
