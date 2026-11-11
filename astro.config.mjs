// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages with the custom domain https://bluedoc.ai (public/CNAME holds it).
export default defineConfig({
  site: 'https://bluedoc.ai',
  base: '/',
  // Design variants under /variants/ are for review, not search: noindex, and left out of the sitemap; so is the
  // shared-doc viewer, /g/ (also Disallowed in robots.txt).
  integrations: [sitemap({ filter: (page) => !page.includes('/variants/') && !new URL(page).pathname.startsWith('/g/') })],
  // One small page: inline its CSS so the first paint waits on no stylesheet request.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
