// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages with the custom domain https://bluedoc.ai (public/CNAME holds it).
export default defineConfig({
  site: 'https://bluedoc.ai',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // One small page: inline its CSS so the first paint waits on no stylesheet request.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
