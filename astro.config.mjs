// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages with the custom domain https://bluedoc.ai (public/CNAME holds it).
export default defineConfig({
  site: 'https://bluedoc.ai',
  base: '/',
  // The blog's posts are MDX (src/content/blog/). Design variants under /variants/ are for review, not search:
  // noindex, and left out of the sitemap; so is the shared-doc viewer, /g/ (also Disallowed in robots.txt).
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/variants/') && !new URL(page).pathname.startsWith('/g/') })],
  // Code blocks in the posts carry both themes' colours as CSS variables (--shiki-light, --shiki-dark); the blog's
  // styles (src/styles/blog.css) pick one by the page's data-theme.
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
