// The changelog's posts (the `changelog` collection, src/content.config.ts) and what its pages need to show them:
// the order, the URL, the date as written, a post by its slug, its card's poster, a clip's frame size and
// screen-reader text, and the size of a picture in a post.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { imageMetadata } from 'astro/assets/utils';
import { getCollection, type CollectionEntry } from 'astro:content';
import { atlasChangelogHref } from '../content/atlas';
import { every, films, typePages, type ClipCopy } from '../content/types';
import { base } from './paths';

export type ChangelogPost = CollectionEntry<'changelog'>;

/** Every post, newest first; among posts of the same date, lower `order` first. */
export async function getPosts(): Promise<ChangelogPost[]> {
  const posts = await getCollection('changelog');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.order - b.data.order);
}

export const postHref = (post: ChangelogPost) => `${atlasChangelogHref}${post.id}/`;

/** The post at /changelog/<slug>/; a slug with no post stops the build, naming `from` (the component asking). */
export async function getPost(slug: string, from: string): Promise<ChangelogPost> {
  const posts = await getPosts();
  const post = posts.find((p) => p.id === slug);
  if (!post) {
    const known = posts.map((p) => p.id).join(', ');
    throw new Error(`${from}: no changelog post "${slug}" (src/content/changelog/${slug}.mdx). Posts: ${known}.`);
  }
  return post;
}

/** The poster of the post's hero clip, for its card, when it has a hero and the poster is recorded. */
export function postPoster(post: ChangelogPost): { src: string; width: number; height: number } | undefined {
  const hero = post.data.hero;
  if (!hero || !existsSync(join(process.cwd(), 'public', 'clips', `${hero}.poster.webp`))) return undefined;
  return { src: `${base}clips/${hero}.poster.webp`, ...clipSize(hero) };
}

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

/** A picture in a post (`/changelog/<slug>/<name>.webp`, a file in public/): its URL under the site's base and its
 * size in px, read from the file. A missing file stops the build, naming `from` (the component asking). */
export async function postImage(src: string, from: string): Promise<{ src: string; width: number; height: number }> {
  const path = src.replace(/^\//, '');
  const file = join(process.cwd(), 'public', path);
  if (!existsSync(file)) throw new Error(`${from}: no image public/${path}.`);
  const { width, height } = await imageMetadata(await readFile(file), src);
  return { src: `${base}${path}`, width, height };
}
