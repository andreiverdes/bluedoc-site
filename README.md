# bluedoc-site

The marketing site for [bluedoc](https://github.com/andreiverdes/bluedoc), built with Astro, Tailwind CSS v4 and [Motion](https://motion.dev): a ruled page in bluedoc's blues, with its pixel-art night bay, a landing page, and one showcase page per doc type (`/docs/`, `/designs/`, `/websites/`) that shows each feature in a short looping clip.

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

All text, links and the screenshots each section of the landing page shows live in **`src/content/site.ts`**: the nav, hero, the why band, product shot, the loop steps, the doc types, the features, the JSON snippet, the install commands, the FAQ, the closing band and the footer. The components in `src/components/` only lay it out, so most edits never touch them.

Headings use a small markup that `src/lib/rich.ts` renders: `[words]` in the blue pixel face, `{words}` in the soft second ink, and `\n` for a line break.

The page is a column between two hairline rails. Each section is a numbered row (`Row.astro`): a rule across the top, its number in the left gutter, and `band` to set it apart in a tinted band (deep night blue in the dark theme, pale blue in the light one). A row's kicker, title and lead come from `SectionHead.astro`.

| Row | Section | Component | Copy in `site.ts` |
|---|---|---|---|
| | Nav, with the Doc types menu | `Nav.astro` | `nav`; the menu lists each type in `docTypes` that has an `href` |
| 01–02 | Version strip, headline and install tabs for every agent, over the night bay (blurred, dithered out on every side) | `Hero.astro` | `hero`; the tabs are the agents and commands in `install` |
| 03 | Why a page, with four counts | `Why.astro` | `why` |
| 04 | Framed screenshot | `ProductShot.astro` | `productShot` |
| 05 | The loop: a pinned row with a bar of the five steps that fills as you scroll, over each step's clip at full column width | `Loop.astro` (icons in `PixelIcon.astro`) | `loop` |
| 06 | Doc types viewer, with autoplaying tabs | `DocTypes.astro` | `docTypes`; each type's `href` is its page |
| 07 | Feature cells | `Features.astro` | `features` |
| 08 | JSON and the rendered page | `CodePeek.astro` | `codePeek` |
| 09 | Install tabs, notes and requirements | `Install.astro` | `install` |
| 10 | FAQ | `Faq.astro` | `faq` |
| 11 | Closing band | `FinalCta.astro` | `finalCta` |
| | Footer, links and the pixel wordmark | `Footer.astro` | `footer`, after a link to each type page |

Page title and description: `meta` in `site.ts`. Colours, fonts and shared styles (rails, rows, buttons, kickers, `.band`): `src/styles/global.css`, with CSS variables per theme (`[data-theme='dark']`, `[data-theme='light']`) and each theme's band palette under `.band`. Pixel icons are 12 × 12 maps in `src/lib/pixel-icons.ts`.

### Type pages

`src/pages/docs.astro`, `designs.astro` and `websites.astro` each render `src/layouts/TypePage.astro` with one entry of **`src/content/types.ts`**, as numbered rows: the hero and its clip (`TypeHero.astro`), What it's for, a feature row per clip (`FeatureRow.astro`), the shared clips under Works on every doc, How the agent uses it (`AgentSnippet.astro`, highlighted at build time by `src/lib/highlight.ts`), the install tabs and the other types (`TypeLinks.astro`). A clip is named by its id in the showcase plan. `Clip.astro` looks for its files at build time: a clip with no MP4 yet shows its poster, and one with no poster either shows a card with its title, so a page builds before its clips are recorded. To add a type page, add its entry to `types.ts`, an `href` to its card in `docTypes`, and a page file like `docs.astro`.

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

The page is static HTML and CSS plus one bundle of two scripts. `src/scripts/site.ts` handles what works without motion: the theme toggle, the nav's glass background, the menus, copy buttons, tabs and the clips (each plays only while in view). `src/scripts/motion.ts` uses Motion for everything that moves as you scroll: reveals, counters, the typed command, the banner's parallax, the product shot's tilt, the pinned loop, the doc types autoplay and the footer's scan; the hero's own entrance is CSS (`.enter`), so it doesn't wait for the script. Under `prefers-reduced-motion` none of it runs: `<html>` gets no `.motion` class, everything shows in place, and a clip shows its poster and a play button.

## Credits

- bluedoc, its banners, logo and screenshots: MIT, from the [bluedoc repository](https://github.com/andreiverdes/bluedoc). The screenshots show bluedoc's HorizonUI build (Apache-2.0).
- Fonts, self-hosted via Fontsource: Geist, Geist Mono and Geist Pixel, all SIL Open Font License 1.1. The social card (`scripts/og/og.html`) still uses Lexend, Inter and Silkscreen.
- Animation: [Motion](https://motion.dev) (MIT).
- Icons: [Lucide](https://lucide.dev) (ISC).
