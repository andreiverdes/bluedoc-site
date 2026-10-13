/// <reference types="vite/client" />
// The blog (blog/index.html): the post list and the subscribe box.
import '../styles/site.css';
import { blog, posts } from '../content/blog';
import { Footer } from '../components/Footer';
import { html, mount } from '../components/html';
import { Nav } from '../components/Nav';
import { PostCard } from '../components/PostCard';
import { Subscribe } from '../components/Subscribe';

mount([
  Nav('/blog/'),
  html`<main class="blog" id="posts">
    <div class="wrap">
      <header class="blog-head"><h1>${blog.title}</h1><p class="lead">${blog.lead}</p></header>
      <div class="posts">${posts.map(PostCard)}</div>
    </div>
  </main>`,
  Subscribe(),
  Footer(),
]);

// a post or component edit re-renders the page in place instead of reloading it
import.meta.hot?.accept();
