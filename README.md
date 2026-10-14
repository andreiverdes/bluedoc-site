# bluedoc-site

The marketing site for [bluedoc](https://github.com/andreiverdes/bluedoc), built with Astro and Tailwind CSS v4 and set in bluedoc's pixel-art night bay: a landing page, and one showcase page per doc type (`/docs/`, `/designs/`, `/websites/`) that shows each feature in a short looping clip.

## Run it

Needs Node 22.12 or later.

```sh
npm i            # install
npm run dev      # dev server with hot reload, http://localhost:4321/
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
npm run check    # type-check the .astro and .ts files
```

To review the page with an agent, keep `npm run dev` running and open the bluedoc doc: `python3 <bluedoc skill>/scripts/serve.py open docs/site.bluedoc.json`. It shows the page live, section by section, for comments and picks.

## Change the copy

All text, links and the screenshots each section of the landing page shows live in **`src/content/site.ts`**: the nav, hero, product shot, the loop steps, the doc types, the features, the JSON snippet, the install commands, the FAQ, the closing band and the footer. The components in `src/components/` only lay it out, so most edits never touch them.

| Section | Component | Copy in `site.ts` |
|---|---|---|
| Nav, with the Doc types menu | `Nav.astro` | `nav`; the menu lists each type in `docTypes` that has an `href` |
| Hero banner, headline, install chip (agent tabs) | `Hero.astro` | `hero`; the chip's agents and commands come from `install` |
| Framed screenshot | `ProductShot.astro` | `productShot` |
| The loop timeline | `Loop.astro` (icons in `PixelIcon.astro`) | `loop` |
| Doc types bento | `DocTypes.astro` | `docTypes`; a card with an `href` links to its type page |
| Feature cards | `Features.astro` | `features` |
| JSON and the rendered page | `CodePeek.astro` | `codePeek` |
| Install tabs | `Install.astro` | `install` |
| FAQ | `Faq.astro` | `faq` |
| Closing band | `FinalCta.astro` | `finalCta` |
| Footer and credits | `Footer.astro` | `footer`, after a link to each type page |

Page title and description: `meta` in `site.ts`. Colours, fonts and shared styles: `src/styles/global.css` (CSS variables per theme, `[data-theme='dark']` and `[data-theme='light']`).

### Type pages

`src/pages/docs.astro`, `designs.astro` and `websites.astro` each render `src/layouts/TypePage.astro` with one entry of **`src/content/types.ts`**: the hero and its clip, What it's for, a feature row per clip (`FeatureRow.astro`), the shared clips under Works on every doc, How the agent uses it (`AgentSnippet.astro`, highlighted at build time by `src/lib/highlight.ts`), the install tabs and the other types (`TypeLinks.astro`). A clip is named by its id in the showcase plan. `Clip.astro` looks for its files at build time: a clip with no MP4 yet shows its poster, and one with no poster either shows a card with its title, so a page builds before its clips are recorded. To add a type page, add its entry to `types.ts`, an `href` to its card in `docTypes`, and a page file like `docs.astro`.

## Change the images

- **Screenshots** sit in `src/assets/shots/`. Replace a file, or add one and import it at the top of `site.ts`. Astro converts them to sized WebP at build time.
- **Hero banners** are `src/assets/hero/hero-dark.webp` and `hero-light.webp` (1672 × 523). The ships that drift are small cut-outs of the banner in `src/assets/hero/ships/`, placed at the source-pixel boxes listed in `Hero.astro`; with a new banner, cut new ones (or remove the `ships` list).
- **Logo**: `src/components/Logo.astro` (the mark and the outlined wordmark). The favicon is `public/favicon.svg`, with `favicon.ico` and `apple-touch-icon.png` rendered from it.
- **Social card**: `public/og.png` (1200 × 630) is rendered from `scripts/og/og.html`. Edit the HTML, then run `npm run og` (needs Google Chrome or Chromium; set `CHROME_PATH` if it isn't found).
- **Clips**: `public/clips/` holds short looping recordings of bluedoc (mp4, webm and a poster each), shown with `src/components/Clip.astro`. Run `npm run clips` to record them again from the scenarios in `clips/scenarios/` (needs Chrome, ffmpeg and the bluedoc repo next to this one); `clips/README.md` explains how to write one.

## Deploy

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `main`, at https://bluedoc.ai. In the GitHub repo, **Settings → Pages** has **Source** set to **GitHub Actions** and the custom domain `bluedoc.ai`.

The URL comes from `astro.config.mjs` (`site: 'https://bluedoc.ai'`, `base: '/'`), and `public/CNAME` holds the domain. The sitemap, `robots.txt`, canonical URL and social image URLs follow these settings.

DNS (Namecheap): four A records on `@` to `185.199.108.153`, `.109`, `.110` and `.111`, and a CNAME on `www` to `andreiverdes.github.io.`; GitHub redirects `www.bluedoc.ai` to `bluedoc.ai`.

Any static host works too: upload `dist/` after `npm run build`.

## What runs in the browser

The page is static HTML and CSS. One small script (`src/scripts/site.ts`) handles the theme toggle, the nav's glass background, copy buttons, the install tabs, the scroll reveals and the clips (each plays only while in view). The parallax and the product shot's tilt are CSS scroll-driven animations, where the browser supports them. Every animation stops under `prefers-reduced-motion`; a clip then shows its poster and a play button.

## Credits

- bluedoc, its banners, logo and screenshots: MIT, from the [bluedoc repository](https://github.com/andreiverdes/bluedoc). The screenshots show bluedoc's HorizonUI build (Apache-2.0).
- Fonts, self-hosted via Fontsource: Lexend, Inter, JetBrains Mono and Silkscreen, all SIL Open Font License 1.1.
- Icons: [Lucide](https://lucide.dev) (ISC).
