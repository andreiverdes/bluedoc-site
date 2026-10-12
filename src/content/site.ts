// Every piece of copy on the page lives here. Edit text, links and images in this one file;
// the components in src/components only lay it out.
import type { ImageMetadata } from 'astro';

import homeShot from '../assets/shots/home-hero.webp';
import docsShot from '../assets/shots/docs-hero.webp';
import planShot from '../assets/shots/plan-hero.webp';
import reviewShot from '../assets/shots/review-hero.webp';
import designShot from '../assets/shots/design-hero.webp';
import presentationShot from '../assets/shots/presentation-hero.webp';
import otherShot from '../assets/shots/other-hero.webp';

export const repoUrl = 'https://github.com/andreiverdes/bluedoc';

export const meta = {
  title: 'bluedoc: your agent’s work, on a page you can decide on',
  description:
    'An agent skill for docs, plans, code reviews, UI designs, slide decks and app icons. The agent writes one JSON file; a local server renders it as a page you comment on, decide and approve.',
  ogImageAlt: 'bluedoc: a pixel-art night bay with a ringed planet, the bluedoc logo and the headline “Your agent’s work, on a page you can decide on.”',
};

export const nav = {
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Doc types', href: '#doc-types' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Install', href: '#install' },
  ],
  github: { label: 'GitHub', href: repoUrl },
};

export const hero = {
  kicker: 'Agent skill · Local · MIT',
  headline: 'Your agent’s work, on a page you can decide on.',
  subline:
    'bluedoc turns plans, code reviews, architecture docs, UI designs and slide decks into interactive pages. Comment on any element, pick an option, approve. Your agent reads the answers and gets on with it.',
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
};

export const docTypes = {
  id: 'doc-types',
  kicker: 'Doc types',
  title: 'Six kinds of page, one way to answer them.',
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
    },
    {
      id: 'plans',
      name: 'Plans',
      tag: 'plan',
      pitch: 'A plan you approve or send back before the agent writes code.',
      bullets: ['Steps, files, risks and checks on one page', 'Open questions with the recommendation starred', 'The agent waits for Approve plan'],
      image: planShot,
      alt: 'The Acme saved carts plan: three open questions with the recommended options starred, and Approve plan in the bottom tray.',
    },
    {
      id: 'reviews',
      name: 'Reviews',
      tag: 'review',
      pitch: 'Review findings pinned to their lines from git, one decision per finding.',
      bullets: ['Diffs expanded from git on each render', 'Fix in PR, Ticket or Decline, with a reason', 'GitHub review threads imported as findings'],
      image: reviewShot,
      alt: 'The Acme review findings: a finding card under the lines of createOrder.ts it is about, with Fix in PR picked.',
    },
    {
      id: 'designs',
      name: 'Designs',
      tag: 'design',
      pitch: 'UI screens on a pan-and-zoom board, and app icons.',
      bullets: ['Watch, phone, tablet, desktop and browser frames', 'Screens link to each other; Present follows the taps', 'App icon sheets with PNG export'],
      image: designShot,
      alt: 'The Acme Fit design board: the Today phone screen selected, with its links drawn as right-angle connectors to other screens.',
    },
    {
      id: 'presentations',
      name: 'Presentations',
      tag: 'presentation',
      pitch: 'Slide decks with speaker notes, played in Present.',
      bullets: ['16:9 HTML slides in deck order', '← → to step, N for notes, Esc to leave'],
      image: presentationShot,
      alt: 'The Acme Fit Q3 launch review deck: five slides stacked in one column, with the Present key in the toolbar.',
    },
    {
      id: 'other',
      name: 'Other',
      tag: 'other',
      pitch: 'Status pages, incident reports, inventories, meeting notes and comparisons.',
      bullets: ['A TL;DR, then one section per question', 'A hero stat that sums the page up'],
      image: otherShot,
      alt: 'The Acme weekly status page for week 41: the TL;DR and the week-over-week numbers table.',
    },
  ] satisfies DocType[],
};

export type FeatureIcon = 'comment' | 'star' | 'compare' | 'approve' | 'local' | 'agents';

export const features = {
  id: 'features',
  kicker: 'Features',
  title: 'Built for answering, not just reading.',
  lead: 'A wall of text in a chat asks you to reply in prose. A bluedoc page asks you the questions and keeps your answers.',
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
      body: 'Plans, designs and decks wait for approval on the current revision. Request changes sends them back.',
    },
    {
      icon: 'local',
      title: 'Your input stays on your machine',
      body: 'Ticks, picks and comments live in a local SQLite file the server owns, never in the repo. Screens run sandboxed, with no network.',
    },
    {
      icon: 'agents',
      title: 'Works with your agent',
      body: 'Claude Code, Codex, pi and omp install it as a plugin. Any other agent gets it through the skills CLI.',
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
      note: 'Restart Codex. The skill is listed as bluedoc:bluedoc; mention it with $bluedoc or let Codex pick it from your request.',
    },
    {
      id: 'pi',
      label: 'pi',
      commands: ['pi install git:github.com/andreiverdes/bluedoc'],
      note: 'Restart pi. Run it as /skill:bluedoc or let pi pick it from your request.',
    },
    {
      id: 'omp',
      label: 'omp',
      commands: ['omp plugin marketplace add andreiverdes/bluedoc', 'omp plugin install bluedoc@bluedoc'],
      note: 'Run /reload-plugins in an open session, or start a new one.',
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
      a: 'Claude Code, Codex, pi and omp install it as a plugin. Any other agent that reads skills can get it with the skills CLI (npx skills add andreiverdes/bluedoc) or a copy of the skill folder.',
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
      q: 'Can I export a doc as HTML?',
      a: 'Yes. Add -o name.html to the build command and bluedoc writes a standalone HTML file you can send to someone.',
    },
    {
      q: 'What licence is it under?',
      a: 'bluedoc’s own code is MIT. The vendored HorizonUI build is Apache-2.0, and the fonts it ships are SIL OFL 1.1. The repository’s README lists every third-party licence.',
    },
  ],
};

export const finalCta = {
  kicker: 'Approved · rev 1',
  title: 'Ship decisions, not walls of text.',
  body: 'Install the skill, ask your agent for a plan, and answer it on a page.',
  primary: { label: 'Star on GitHub', href: repoUrl },
  secondary: { label: 'Install', href: '#install' },
};

export const footer = {
  tagline: 'An agent skill for docs, plans, reviews, designs and decks you can decide on.',
  licence: { label: 'MIT licence', href: `${repoUrl}/blob/main/LICENSE` },
  links: [
    { label: 'GitHub', href: repoUrl },
    { label: 'Doc types', href: '#doc-types' },
    { label: 'Install', href: '#install' },
    { label: 'FAQ', href: '#faq' },
  ],
  credits: [
    'Fonts: Lexend, Inter, JetBrains Mono and Silkscreen, under the SIL Open Font License 1.1, self-hosted.',
    'Pixel-art banners and screenshots from the bluedoc repository (MIT). The screenshots show bluedoc’s HorizonUI build (Apache-2.0).',
    'Icons: Lucide (ISC).',
  ],
};
