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

export const collections = { blog };
