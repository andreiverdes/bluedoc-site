# bluedoc-site

The marketing site for [bluedoc](https://github.com/andreiverdes/bluedoc), built with Astro, Tailwind CSS v4 and [Motion](https://motion.dev): bluedoc's blues and pixel-art night bay, rounded cards and pills, a landing page, a page per doc type (`/docs/`, `/plans/`, `/designs/`…), a revisions page, a features page and credits. Every feature is shown in a short looping clip or a film of the agent's terminal beside the page.

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

Page copy lives in three files; the components only lay it out.

- **`src/content/atlas.ts`**: the home (`atlasHero`, `atlasTypes`, `atlasSetup`, `atlasCompare`, `atlasAnswering`, `atlasFaq`, `atlasCta`), the nav and footer (`atlasNav`, `atlasFooter`) and the revisions page (`atlasRevisions`). It takes its facts from the two files below, so no two pages disagree.
- **`src/content/site.ts`**: the facts: page title and description (`meta`), the doc types, features, install commands per agent, the FAQ and the credits (`legal`).
- **`src/content/types.ts`**: each doc type's page (`typePages`), the clips every type shares (`every`), the films (`films`) and the features page (`featuresPage`).

Headings use a small markup that `src/lib/rich.ts` renders: `[words]` in the blue pixel face, `{words}` in the soft second ink, and `\n` for a line break.

### Pages

| Page | File | Built from |
|---|---|---|
| `/` | `src/pages/index.astro` | the nav, the hero over the night bay (`HeroBay.astro`) with the install tabs and the plan hook film sized to fit a laptop screen, the doc types (each tab plays its ask film for its length), setup, chat versus page, what you do on a page, the FAQ, the install band and the footer; sections in `src/components/atlas/` |
| `/<type>/` | `src/pages/[type].astro` | one entry of `typePages`: its films in the big frame, what it's for, its clips as cards, the shared clips, how the agent uses it (`AgentSnippet.astro`), the other types |
| `/revisions/` | `src/pages/revisions.astro` | `atlasRevisions`: the onion skin, how a revision works, a compare per doc type, the films where a revision lands |
| `/features/` | `src/pages/features.astro` | `featuresPage`: the clips grouped by what the reader does |
| `/legal/` | `src/pages/legal.astro` | `legal`: licence, privacy, credits |

Shared layout styles (hero, sections, cards, segmented pickers, the install terminal, and the Shape block that sets every corner radius) are in `src/styles/atlas.css`; colours per theme (`[data-theme='dark']`, `[data-theme='light']`), fonts and base styles in `src/styles/global.css`. Every card grid uses `.fill-grid` with `fillGrid` (`src/lib/fill-grid.ts`), so no grid ends on a half-empty row. Pixel icons are 12 × 12 maps in `src/lib/pixel-icons.ts`. `Clip.astro` looks for its files at build time: a clip with no MP4 yet shows its poster, and one with no poster either shows a card with its title, so a page builds before its clips are recorded; a `zoom` clip opens larger in the lightbox (`ClipLightbox.astro`).

### Design experiments

Try a new design under `src/pages/variants/<name>/` (it renders at `/variants/<name>/` in `npm run dev`). The folder is gitignored: experiments are never committed or deployed. When one wins, move it into `src/pages/` and delete what it replaces.

## Change the images

- **Hero banners** are `src/assets/hero/hero-dark.webp` and `hero-light.webp` (1672 × 523), drawn by `src/components/HeroBay.astro`. The ships that drift are small cut-outs of the banner in `src/assets/hero/ships/`, placed at the source-pixel boxes listed there; with a new banner, cut new ones (or remove the `ships` list).
- **Clips and films** are in `public/clips/`, recorded by `npm run clips` from `clips/scenarios/` (see `clips/README.md`). Clips show one page at 1280 × 800; films (`film-*`, `ask-*`, 1600 × 1000) put the agent's terminal beside the page, and `film-*` also come out as 16:9 and 1:1 MP4s in `clips/social/` for posts (gitignored). The home's hero plays `film-plan-hook`.
- **Logo**: `src/components/Logo.astro` (the mark and the outlined wordmark). The favicon is `public/favicon.svg`, with `favicon.ico` and `apple-touch-icon.png` rendered from it.
- **Social card**: `public/og.png` (1200 × 630) is rendered from `scripts/og/og.html`. Edit the HTML, then run `npm run og` (needs Google Chrome or Chromium; set `CHROME_PATH` if it isn't found).
- **Clips**: `public/clips/` holds short looping recordings of bluedoc (mp4, webm and a poster each), shown with `src/components/Clip.astro`. Run `npm run clips` to record them again from the scenarios in `clips/scenarios/` (needs Chrome, ffmpeg and the bluedoc repo next to this one); `clips/README.md` explains how to write one.

## Deploy

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `main`, at https://bluedoc.ai. In the GitHub repo, **Settings → Pages** has **Source** set to **GitHub Actions** and the custom domain `bluedoc.ai`.

The URL comes from `astro.config.mjs` (`site: 'https://bluedoc.ai'`, `base: '/'`), and `public/CNAME` holds the domain. The sitemap, `robots.txt`, canonical URL and social image URLs follow these settings.

DNS (Namecheap): four A records on `@` to `185.199.108.153`, `.109`, `.110` and `.111`, and a CNAME on `www` to `andreiverdes.github.io.`; GitHub redirects `www.bluedoc.ai` to `bluedoc.ai`.

Any static host works too: upload `dist/` after `npm run build`.

## What runs in the browser

The page is static HTML and CSS plus one bundle of two scripts. `src/scripts/site.ts` handles what works without motion: the theme toggle, the nav's glass background and menus, copy buttons, tabs, and the clips (each plays only while in view; a big one shows the browser's controls on hover, a thumbnail opens in the lightbox). `src/scripts/motion.ts` uses Motion for what moves as you scroll: reveals, counters, the banner's parallax and the doc types autoplay; the hero's own entrance is CSS (`.enter`), so it doesn't wait for the script. Under `prefers-reduced-motion` none of it runs: `<html>` gets no `.motion` class, everything shows in place, and a clip shows its poster and a play button.

## Credits

- bluedoc, its banners, logo and recordings: MIT, from the [bluedoc repository](https://github.com/andreiverdes/bluedoc). The recordings show bluedoc's HorizonUI build (Apache-2.0).
- Fonts, self-hosted via Fontsource: Geist, Geist Mono and Geist Pixel, all SIL Open Font License 1.1. The social card (`scripts/og/og.html`) still uses Lexend, Inter and Silkscreen.
- Animation: [Motion](https://motion.dev) (MIT).
- Icons: [Lucide](https://lucide.dev) (ISC).
