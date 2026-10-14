import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog posts migrated from WordPress. File name = URL slug, served at the
 * site root (/<slug>/) exactly like the WordPress permalinks.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum([
      'Getting Started',
      'Tajweed',
      'Hifz & Memorization',
      'Arabic Language',
      'Kids & Parents',
      'Certification',
      'Islamic Studies',
    ]),
    track: z.enum(['quran', 'arabic', 'kids', 'islamic', 'general']),
    author: z.string().default('Ummah Academy Editorial'),
    featured: z.boolean().default(false),
  }),
});

/**
 * Arabic articles (Phase 3). Written for Arab families — not machine translations.
 * Served at /ar/blog/<slug>/. `translationOf` names the English article on the same
 * topic (if any) so hreflang and the language switch point at the true twin.
 */
const blogAr = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-ar' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['البداية', 'التجويد', 'الحفظ', 'اللغة العربية', 'الأطفال والأسرة', 'الإجازة والسند', 'الدراسات الإسلامية']),
    track: z.enum(['quran', 'arabic', 'kids', 'islamic', 'general']),
    author: z.string().default('فريق التحرير في أكاديمية الأمة'),
    translationOf: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, blogAr };
