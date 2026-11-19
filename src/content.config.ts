// The changelog (/changelog/): one MDX file per post in src/content/changelog/; its file name is the slug and the
// URL, /changelog/<slug>/. The pages are src/pages/changelog/index.astro and src/pages/changelog/[slug].astro.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const changelog = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/changelog' }),
  schema: z.object({
    /** sentence case, at most 70 characters */
    title: z.string().max(70),
    /** one or two sentences: the card on /changelog/ and the post's meta description */
    summary: z.string(),
    date: z.coerce.date(),
    /** among posts of the same date, lower comes first */
    order: z.number().int(),
    /** the bluedoc version the post describes, shown as a chip */
    version: z.string().optional(),
    /** a clip name from public/clips/, shown under the title and as the post's card image */
    hero: z.string().optional(),
  }),
});

export const collections = { changelog };
