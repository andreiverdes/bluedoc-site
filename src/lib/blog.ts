// The blog's posts (the `blog` collection, src/content.config.ts) and what its pages need to show them: the order,
// the URL, the date as written, and a clip's frame size and screen-reader text.
import { getCollection, type CollectionEntry } from 'astro:content';
import { atlasBlogHref } from '../content/atlas';
import { every, films, typePages, type ClipCopy } from '../content/types';

export type BlogPost = CollectionEntry<'blog'>;

/** Every post, newest first; among posts of the same date, lower `order` first. */
export async function getPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.order - b.data.order);
}

export const postHref = (post: BlogPost) => `${atlasBlogHref}${post.id}/`;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
/** "19 November 2026"; frontmatter dates are midnight UTC */
export const formatDate = (date: Date) => dateFormat.format(date);
/** "2026-11-19", for <time datetime> */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** A clip's frame in px: films (`film-*`, `ask-*`: the terminal beside the page) are 1600 × 1000, clips 1280 × 800. */
export function clipSize(clip: string): { width: number; height: number } {
  return /^(film|ask)-/.test(clip) ? { width: 1600, height: 1000 } : { width: 1280, height: 800 };
}

// what each clip shows, as the site's pages describe it (src/content/types.ts), for screen readers
const shows = new Map<string, string>();
const addShows = (c: ClipCopy) => shows.has(c.clip) || shows.set(c.clip, c.shows);
Object.values(every).forEach(addShows);
Object.values(films).forEach(addShows);
for (const p of Object.values(typePages)) [p.hero, ...p.features, ...p.shared, ...(p.films ?? [])].forEach(addShows);

/** What the clip shows, read to screen readers: the site's description of it, else `fallback`. */
export const clipShows = (clip: string, fallback: string) => shows.get(clip) ?? fallback;
