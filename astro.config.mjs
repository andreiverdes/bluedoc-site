// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The posts that went live under /blog/ before it became the changelog; later posts never had a /blog/ URL.
const blogSlugs = ['a-new-look', 'bluedoc-1-1', 'charts', 'questions', 'reviews', 'sharing'];

// GitHub Pages with the custom domain https://bluedoc.ai (public/CNAME holds it).
export default defineConfig({
  site: 'https://bluedoc.ai',
  base: '/',
  // The changelog's posts are MDX (src/content/changelog/). Design variants under /variants/ are for review, not
  // search: noindex, and left out of the sitemap; so is the shared-doc viewer, /g/ (also Disallowed in robots.txt).
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/variants/') && !new URL(page).pathname.startsWith('/g/') })],
  // Moved pages: the changelog was the blog (/blog/, /blog/<slug>/), Revisions became a feature page. Static output
  // writes each old URL as a page that sends the browser on (meta refresh and canonical link).
  redirects: {
    '/blog': '/changelog/',
    ...Object.fromEntries(blogSlugs.map((slug) => [`/blog/${slug}`, `/changelog/${slug}/`])),
    '/revisions': '/features/revisions/',
  },
  // Code blocks in the posts carry both themes' colours as CSS variables (--shiki-light, --shiki-dark); the
  // changelog's styles (src/styles/changelog.css) pick one by the page's data-theme.
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  // One small page: inline its CSS so the first paint waits on no stylesheet request.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
