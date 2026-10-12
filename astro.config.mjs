// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project site: https://andreiverdes.github.io/bluedoc-site/
// For a custom domain (e.g. https://bluedoc.acme.dev), set `site` to it and `base` to '/'
// (and add public/CNAME with the domain).
export default defineConfig({
  site: 'https://andreiverdes.github.io',
  base: '/bluedoc-site',
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
