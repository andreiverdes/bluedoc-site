import type { posts } from '../content/blog';
import { html } from './html';

type Post = (typeof posts)[number];

export const PostCard = (p: Post) => html`
  <article class="post" id="post-${p.slug}">
    <a href="/blog/#post-${p.slug}">
      <div class="cover tone-${p.tone}" aria-hidden="true"><span></span></div>
      <p class="meta"><span class="tag">${p.tag}</span>${p.date}</p>
      <h2 class="post-title">${p.title}</h2>
      <p class="excerpt">${p.excerpt}</p>
    </a>
  </article>`;
