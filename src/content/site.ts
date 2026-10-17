// Every piece of copy on the page lives here. Edit text, links and images in this one file;
// the components in src/components only lay it out.
import type { ImageMetadata } from 'astro';
import { base } from '../lib/paths';

import homeShot from '../assets/shots/home-hero.webp';
import docsShot from '../assets/shots/docs-hero.webp';
import planShot from '../assets/shots/plan-hero.webp';
import reviewShot from '../assets/shots/review-hero.webp';
import designShot from '../assets/shots/design-hero.webp';
import presentationShot from '../assets/shots/presentation-hero.webp';
import otherShot from '../assets/shots/other-hero.webp';
import websiteShot from '../assets/shots/website-hero.webp';
import storeListingShot from '../assets/shots/storelisting-hero.webp';

export const repoUrl = 'https://github.com/andreiverdes/bluedoc';

export const meta = {
  title: 'bluedoc: point, pick, approve. Your agent does the rest.',
  description:
    'An agent skill for docs, plans, code reviews, UI designs, slide decks, app icons and store listings. The agent writes one JSON file; a local server renders it as a page you comment on, decide and approve.',
  ogImageAlt: 'bluedoc: a pixel-art night bay with a ringed planet, the bluedoc logo and the headline “Point, pick, approve. Your agent does the rest.”',
};

// Anchors on the home page carry the base path, so they work from the type pages too.
export const nav = {
  links: [
    { label: 'Features', href: `${base}#features` },
    { label: 'How it works', href: `${base}#how-it-works` },
    { label: 'Install', href: `${base}#install` },
  ],
  // The Doc types menu lists every type in docTypes, then the Features page; it sits after Features.
  typesMenu: {
    label: 'Doc types',
    features: {
      label: 'Features on every type',
      pitch: 'Comments, decisions, approval and revisions.',
      href: `${base}features/`,
    },
    all: { label: 'All doc types', href: `${base}#doc-types` },
  },
  github: { label: 'GitHub', href: repoUrl },
};

export const hero = {
  kicker: 'Beta · Agent skill · Local · MIT',
  headline: 'Point, pick, approve. Your agent does the rest.',
  subline:
    'bluedoc turns plans, code reviews, architecture docs, UI designs, slide decks and store listings into interactive pages. Comment on any element, pick an option, approve. Your agent reads the answers and gets on with it.',
  primaryCta: { label: 'Install', href: '#install' },
  secondaryCta: { label: 'View on GitHub', href: repoUrl },
  bannerAlt:
    'Pixel art of a bay at night: a ringed planet over the water, ships with engine trails, and a city whose rooftop billboard reads “bluedoc”.',
  bannerAltLight: 'Pixel art of the same bay by day: a ringed planet in a blue sky, ships, clouds and the city’s “bluedoc” billboard.',
};

export const productShot = {
  kicker: 'One home for every doc',
  title: 'Every doc your agent writes, in one place.',
  body: 'The local server lists each doc with its type, status and revision. Filter by type or status, browse projects in the sidebar, and open a doc to read, comment and decide.',
  url: '127.0.0.1 / bluedoc',
  image: homeShot,
  alt: 'The bluedoc home page in dark mode: the pixel-art banner behind the title and search field, filter chips by type and status, the sidebar of projects and the doc cards.',
};

export type LoopIcon = 'write' | 'markup' | 'decide' | 'revise' | 'approve';

export const loop = {
  id: 'how-it-works',
  kicker: 'How it works',
  title: 'One loop, from draft to approved.',
  lead: 'The agent writes, you answer on the page, the agent revises. Each round is a revision you can compare with the last.',
  steps: [
    { icon: 'write', title: 'Agent writes', body: 'One JSON file. The local server renders it as a page; no HTML to keep in sync.' },
    { icon: 'markup', title: 'You mark up', body: 'Pin a comment on any element, a selected passage or a box you draw.' },
    { icon: 'decide', title: 'You decide', body: 'Pick an option per question. The agent’s recommendation is starred.' },
    { icon: 'revise', title: 'Agent revises', body: 'It edits one part at a time and marks the comments it resolved.' },
    { icon: 'approve', title: 'You approve', body: 'Approve the current revision; the agent waits for it before it writes code.' },
  ] satisfies { icon: LoopIcon; title: string; body: string }[],
};

export type DocType = {
  id: string;
  name: string;
  tag: string;
  pitch: string;
  bullets: string[];
  image: ImageMetadata;
  alt: string;
  /** the type's showcase page */
  href: string;
};

export const docTypes = {
  id: 'doc-types',
  kicker: 'Doc types',
  title: 'Eight kinds of page, one way to answer them.',
  lead: 'Each type has its own layout and its own decisions. Comments, revisions and approval work the same on all of them.',
  items: [
    {
      id: 'docs',
      name: 'Docs',
      tag: 'docs',
      pitch: 'Architecture pages, walkthroughs, runbooks, setup guides and change proposals.',
      bullets: [
        'A zoomable blueprint canvas, nested up to 3 levels',
        'Animated flows: a request, an event, a data path',
        'Checklists whose ticks the local server keeps',
      ],
      image: docsShot,
      alt: 'The Acme orders doc: the order path canvas zoomed into the orders-api system, playing step 3 of a flow.',
      href: `${base}docs/`,
    },
    {
      id: 'plans',
      name: 'Plans',
      tag: 'plan',
      pitch: 'A plan you approve or send back before the agent writes code.',
      bullets: ['Steps, files, risks and checks on one page', 'Open questions with the recommendation starred', 'The agent waits for Approve plan'],
      image: planShot,
      alt: 'The Acme saved carts plan: three open questions with the recommended options starred, and Approve plan in the bottom tray.',
      href: `${base}plans/`,
    },
    {
      id: 'reviews',
      name: 'Reviews',
      tag: 'review',
      pitch: 'Review findings pinned to their lines from git, one decision per finding.',
      bullets: ['Diffs expanded from git on each render', 'Fix in PR, Ticket or Decline, with a reason', 'GitHub review threads imported as findings'],
      image: reviewShot,
      alt: 'The Acme review findings: a finding card under the lines of createOrder.ts it is about, with Fix in PR picked.',
      href: `${base}reviews/`,
    },
    {
      id: 'designs',
      name: 'Designs',
      tag: 'design',
      pitch: 'UI screens on a pan-and-zoom board, and app icons.',
      bullets: ['Watch, phone, tablet, desktop and browser frames', 'Screens link to each other; Present follows the taps', 'App icon sheets with PNG export'],
      image: designShot,
      alt: 'The Acme Fit design board: the Today phone screen selected, with its links drawn as right-angle connectors to other screens.',
      href: `${base}designs/`,
    },
    {
      id: 'presentations',
      name: 'Presentations',
      tag: 'presentation',
      pitch: 'Slide decks with speaker notes, played in Present.',
      bullets: ['16:9 HTML slides in deck order', '← → to step, N for notes, Esc to leave'],
      image: presentationShot,
      alt: 'The Acme Fit Q3 launch review deck: five slides stacked in one column, with the Present key in the toolbar.',
      href: `${base}presentations/`,
    },
    {
      id: 'websites',
      name: 'Websites',
      tag: 'website',
      pitch: 'A site’s pages on a board, live from its dev server.',
      bullets: [
        'Live pages from localhost, hot reload included',
        'Comments that name the source file to edit',
        'Versions of a section, picked in place',
      ],
      image: websiteShot,
      alt: 'The Acme Fit site board: the Home mockup at 1440 px with its hero’s A, B and C versions, and the Blog live from the dev server at 390 px with a pin on a post title.',
      href: `${base}websites/`,
    },
    {
      id: 'store-listings',
      name: 'Store listings',
      tag: 'storelisting',
      pitch: 'An app’s Google Play and App Store listing, checked against the stores’ rules.',
      bullets: [
        'Screenshots per device at each store’s sizes',
        'Store text per locale, with live counters',
        'Store checks, variants, ads and a fastlane ZIP',
      ],
      image: storeListingShot,
      alt: 'The Acme Fit store listing on Google Play: the Text tab with the caption Typography and the store text with its counters, the toolbar’s platform switch, locale menu and Export to…, and the Wear OS and phone screenshot sets.',
      href: `${base}store-listings/`,
    },
    {
      id: 'other',
      name: 'Other',
      tag: 'other',
      pitch: 'Status pages, incident reports, inventories, meeting notes and comparisons.',
      bullets: ['A TL;DR, then one section per question', 'A hero stat that sums the page up'],
      image: otherShot,
      alt: 'The Acme weekly status page for week 41: the TL;DR and the week-over-week numbers table.',
      href: `${base}other/`,
    },
  ] satisfies DocType[],
};

export type FeatureIcon = 'comment' | 'star' | 'compare' | 'approve' | 'local' | 'agents';

export const features = {
  id: 'features',
  kicker: 'Features',
  title: 'Built for answering, not just reading.',
  lead: 'A wall of text in a chat asks you to reply in prose. A bluedoc page asks you the questions and keeps your answers.',
  more: { label: 'See every feature', href: `${base}features/` },
  items: [
    {
      icon: 'comment',
      title: 'Comments on any element',
      body: 'Point at an element, select a passage or draw a box. Notes collect as Pending, Open and Resolved.',
    },
    {
      icon: 'star',
      title: 'Decision pills, recommendation starred',
      body: 'Pick one option per question, or press Accept recommended to take every starred option at once.',
    },
    {
      icon: 'compare',
      title: 'Revisions you can compare',
      body: 'Every build is a revision. Compare any two: new, changed and removed parts are marked in place, word by word.',
    },
    {
      icon: 'approve',
      title: 'Approve, and the agent proceeds',
      body: 'Plans, designs, decks and store listings wait for approval on the current revision. Request changes sends them back.',
    },
    {
      icon: 'local',
      title: 'Your input stays on your machine',
      body: 'Ticks, picks and comments live in a local SQLite file the server owns, never in the repo. Screens run sandboxed, with no network.',
    },
    {
      icon: 'agents',
      title: 'Works with your agent, plan mode too',
      body: 'Claude Code, Codex, Copilot CLI, Antigravity CLI, pi and omp install it as a plugin, with /bluedoc-* commands. In plan mode, the plan opens as a page and waits for your approval.',
    },
  ] satisfies { icon: FeatureIcon; title: string; body: string }[],
};

export const codePeek = {
  kicker: 'JSON in, page out',
  title: 'The agent writes JSON. You get a page.',
  lead: 'Agents never write page HTML. The server renders each doc from its JSON on every request, so an edit and a reload is the whole build.',
  fileName: 'saved-carts.bluedoc.json',
  // Shown with a typing animation. Keep it short: about 20 lines fit the editor.
  snippet: `{
  "title": "Acme Shop: saved carts",
  "meta": { "type": "plan", "rev": "1" },
  "sections": [{
    "title": "Open questions",
    "blocks": [{
      "type": "checklist",
      "id": "decisions",
      "items": [{
        "id": "retention",
        "text": "How long does a saved cart stay?",
        "recommend": "d180",
        "choices": [
          { "id": "d90", "label": "90 days" },
          { "id": "d180", "label": "180 days" },
          { "id": "forever", "label": "Until deleted" }
        ]
      }]
    }]
  }]
}`,
  resultLabel: 'Rendered by the local server',
  image: planShot,
  alt: 'The rendered Acme saved carts plan: the retention question with 90 days, 180 days (starred) and Until deleted as pills.',
};

export const install = {
  id: 'install',
  kicker: 'Install',
  title: 'Pick your agent.',
  lead: 'Each one installs the same skill from the GitHub repository.',
  tabs: [
    {
      id: 'claude',
      label: 'Claude Code',
      commands: ['claude plugin marketplace add andreiverdes/bluedoc', 'claude plugin install bluedoc@bluedoc'],
      note: 'Inside a session the same commands are /plugin marketplace add andreiverdes/bluedoc and /plugin install bluedoc@bluedoc. Start a new session to load the skill.',
    },
    {
      id: 'codex',
      label: 'Codex',
      commands: ['codex plugin marketplace add andreiverdes/bluedoc', 'codex plugin add bluedoc@bluedoc'],
      note: 'Restart Codex. Mention the skill with $bluedoc or let Codex pick it from your request. Plan mode (/plan) opens the plan as a page; the README has the sandbox lines that skip the approval prompts.',
    },
    {
      id: 'pi',
      label: 'pi',
      commands: ['pi install git:github.com/andreiverdes/bluedoc'],
      note: 'Restart pi. /bluedoc-plan-mode turns on plan mode, and the plan opens as a page for your approval.',
    },
    {
      id: 'omp',
      label: 'omp',
      commands: ['omp plugin marketplace add andreiverdes/bluedoc', 'omp plugin install bluedoc@bluedoc'],
      note: 'Run /reload-plugins in an open session, or start a new one. omp’s plan reviews open as pages: Approve runs the plan, Request changes refines it.',
    },
    {
      id: 'copilot',
      label: 'Copilot CLI',
      commands: ['copilot plugin install andreiverdes/bluedoc'],
      note: 'Start a new session. When Copilot leaves plan mode, its plan opens as a page and waits for your approval.',
    },
    {
      id: 'antigravity',
      label: 'Antigravity CLI',
      commands: ['git clone https://github.com/andreiverdes/bluedoc.git', 'agy plugin install bluedoc/antigravity'],
      note: 'Restart agy. In plan mode (agy --mode plan or /plan), the implementation plan opens as a page for your approval.',
    },
    {
      id: 'skills',
      label: 'skills CLI',
      commands: ['npx skills add andreiverdes/bluedoc'],
      note: 'For any other agent that reads skills. Or clone the repository and link skills/bluedoc into your agent’s skills folder.',
    },
  ],
  requirements: ['Python 3.9 or later on PATH', 'git, for code reviews', 'gh, only to import GitHub review threads'],
};

export const faq = {
  id: 'faq',
  kicker: 'FAQ',
  title: 'Questions, answered.',
  items: [
    {
      q: 'Is it free?',
      a: 'Yes. bluedoc is open source under the MIT licence. There is no account, no subscription and no hosted service.',
    },
    {
      q: 'Which agents does it work with?',
      a: 'Claude Code, Codex, Copilot CLI, Antigravity CLI, pi and omp install it as a plugin, with a plan-mode gate and /bluedoc-* commands. Any other agent that reads skills can get it with the skills CLI (npx skills add andreiverdes/bluedoc) or a copy of the skill folder.',
    },
    {
      q: 'Where does my data live?',
      a: 'On your machine. Ticks, picks, comments and replies live in ~/.bluedoc/state.db, a SQLite file the local server owns, never in the repo. Only a browser that opened a link from the server can save.',
    },
    {
      q: 'Does it need an internet connection?',
      a: 'No. The server runs on 127.0.0.1 and serves its fonts, styles and UI kits itself. Design screens run sandboxed with no network. Only importing GitHub review threads, or diffing a PR whose repo isn’t checked out, calls gh.',
    },
    {
      q: 'Can I export a doc?',
      a: 'Yes. Add -o name.html to the build command for a standalone HTML file you can send to someone. Decks also export as PDF, and store listings as a fastlane ZIP, a plain-folders ZIP, a PDF or HTML.',
    },
    {
      q: 'What licence is it under?',
      a: 'bluedoc’s own code is MIT. The vendored HorizonUI build is Apache-2.0, and the fonts it ships are SIL OFL 1.1. The repository’s README lists every third-party licence.',
    },
  ],
};

export const finalCta = {
  kicker: 'Approved · rev 1',
  title: 'Answer your agent on a page.',
  body: 'Install the skill, ask your agent for a plan, and answer it on a page.',
  primary: { label: 'Star on GitHub', href: repoUrl },
  secondary: { label: 'Install', href: '#install' },
};

export const footer = {
  tagline: 'An agent skill for docs, plans, reviews, designs, decks and store listings you can decide on.',
  // the columns after the brand: the doc types (from docTypes, with Features) and the site's own links
  typesTitle: 'Doc types',
  siteTitle: 'bluedoc',
  links: [
    { label: 'How it works', href: `${base}#how-it-works` },
    { label: 'Install', href: `${base}#install` },
    { label: 'FAQ', href: `${base}#faq` },
    { label: 'GitHub', href: repoUrl },
  ],
  licence: { label: 'MIT licence', href: `${repoUrl}/blob/main/LICENSE` },
  legal: { label: 'Credits and privacy', href: `${base}legal/` },
};

// /legal/: what the site and bluedoc collect (nothing), and the licences of what the site is built from
export const legal = {
  metaTitle: 'Credits and privacy · bluedoc',
  metaDescription: 'bluedoc is MIT-licensed and runs on your machine. This site sets no cookies and has no analytics. The fonts, icons and art it uses, and their licences.',
  kicker: 'Credits and privacy',
  title: 'No accounts, no tracking, no terms to sign.',
  lead: 'bluedoc is open source and runs on your own machine, so there is no service to agree terms for. This page says what the site stores and where its parts come from.',
  sections: [
    {
      id: 'licence',
      title: 'Licence',
      body: [
        'bluedoc is free software under the [MIT licence](' + `${repoUrl}/blob/main/LICENSE` + '): use it, change it and share it, at work too. It comes with no warranty.',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy',
      body: [
        '**bluedoc** keeps everything on your machine. Your comments, picks and approvals live in a SQLite file under `~/.bluedoc`, and the server only listens on 127.0.0.1. Nothing is sent anywhere unless your agent sends it.',
        '**This site** sets no cookies, loads no analytics or trackers, and has no forms. Your light or dark choice is kept in your browser’s local storage and never leaves it. The site is hosted on GitHub Pages, which keeps server logs under [GitHub’s privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).',
      ],
    },
    {
      id: 'credits',
      title: 'Credits',
      body: [
        '**Fonts:** Lexend, Inter, JetBrains Mono and Silkscreen, under the SIL Open Font License 1.1, served from this site.',
        '**Icons:** [Lucide](https://lucide.dev), under the ISC licence.',
        '**Art and recordings:** the pixel-art banners, the screenshots and the clips come from the [bluedoc repository](' + repoUrl + ') (MIT), recorded from its Acme examples. They show bluedoc’s HorizonUI build (Apache-2.0).',
      ],
    },
  ],
};
