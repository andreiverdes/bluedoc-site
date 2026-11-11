import type { APIRoute } from 'astro';

// Built from `site` and `base` in astro.config.mjs, so it follows a domain change. /g/ (the shared-doc viewer, whose
// docs are in the link's #fragment) is not for search.
export const GET: APIRoute = ({ site }) => {
  const root = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const sitemap = new URL(`${root}sitemap-index.xml`, site);
  return new Response(`User-agent: *\nAllow: /\nDisallow: ${root}g/\n\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
