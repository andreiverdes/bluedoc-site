// Copy for the Atlas variant of the home page (/variants/atlas/): the layout of atlas.insanearts.io in bluedoc's
// colours, type and square geometry. Facts come from site.ts, so the two pages never disagree; only the
// arrangement and the short connecting lines are new here.
import type { PixelIconName } from '../lib/pixel-icons';
import { base } from '../lib/paths';
import { docTypes, faq, features, install, meta, repoUrl, why } from './site';
import { every, films, typePages, type ClipCopy } from './types';
import { clipSeconds } from '../lib/clip-length';

const feature = (icon: string) => features.items.find((f) => f.icon === icon)!;
const question = (q: string) => faq.items.find((f) => f.q === q)!;

// The variant's home and its doc type pages (src/pages/variants/atlas/): anchors carry the home's path, so they work
// from a type page too.
export const atlasBase = `${base}variants/atlas/`;
export const atlasTypeHref = (id: string) => `${atlasBase}${id}/`;
export const atlasRevisionsHref = `${atlasBase}revisions/`;
const pluginAgents = install.tabs.filter((t) => t.id !== 'skills');

export const atlasMeta = {
  title: `${meta.title} · Atlas variant`,
  description: meta.description,
};

export const atlasNav = {
  // Doc types opens a menu of the type pages; the other two are anchors on the home
  types: {
    label: 'Doc types',
    pages: docTypes.items.map((t) => ({ id: t.id as PixelIconName, name: t.name, pitch: t.pitch, href: atlasTypeHref(t.id) })),
    all: { label: 'All doc types', href: `${atlasBase}#doc-types` },
  },
  links: [
    { label: 'How it works', href: `${atlasBase}#how-it-works` },
    { label: 'Revisions', href: atlasRevisionsHref },
    { label: 'FAQ', href: `${atlasBase}#faq` },
  ],
  github: { label: 'GitHub', href: repoUrl },
  install: { label: 'Install', href: '#install' },
};

export const atlasHero = {
  headline: 'Plan, document, design and more.\nA [visual] reply to your verbose agent.',
  subline:
    'bluedoc turns what your agent writes into pages: plans, docs, reviews, designs and decks. You answer on the page; it reads every answer.',
  // the Plans hook film (clips/scenarios/film-plan-hook.mjs): Claude Code beside the bluedoc page
  clip: {
    name: 'film-plan-hook',
    label:
      'Claude Code beside the bluedoc page. Without bluedoc, a plan scrolls by as a wall of text. With it, plan mode opens the saved carts plan as a page; the reader accepts the recommendations, adds guests, pins a note on the sweeper step and approves, and the terminal prints the approval the agent was waiting for.',
    width: 1600,
    height: 1000,
  },
  ask: '“Let shoppers save a cart and come back to it later.”',
};

// One tab per doc type: its ask film (the request typed in Claude Code beside the page it opens, clips/scenarios/
// ask-<type>.mjs) and the request itself. While the tabs move on by themselves, each stays for its film's length.
const typeClips: Record<string, { clip: string; label: string; ask: string }> = {
  docs: {
    clip: 'ask-docs',
    label: 'Claude Code maps the Acme order path and opens it in bluedoc as a blueprint; a double-click flies into orders-api, a pinch opens pricing inside it, and the Order path crumb brings the whole drawing back.',
    ask: '“Map the Acme order path as a doc I can zoom into.”',
  },
  plans: {
    clip: 'ask-plans',
    label: 'Claude Code writes and opens the saved carts plan; bluedoc scrolls to its Approach canvas, where the new Saved carts panel, saved_carts table and sweeper are drawn amber and dashed as the Save a cart flow runs through them.',
    ask: '“Plan saved carts and show me what’s new.”',
  },
  reviews: {
    clip: 'ask-reviews',
    label: 'Claude Code reviews the pricing PR and opens the findings in bluedoc’s Merged view, each under its lines in tiers.ts, then opens the explanation of the tierFor blocker’s recommended Fix in PR option.',
    ask: '“Review the pricing PR and pin each finding to its line.”',
  },
  designs: {
    clip: 'ask-designs',
    label: 'The Acme Fit design board opens fitted, then glides into the round watch face, up to the Sign in, Today and Activity phone screens, and down to the browser Dashboard.',
    ask: '“Mock up Acme Fit for watch, phone and web.”',
  },
  presentations: {
    clip: 'ask-presentations',
    label: 'The Acme Fit Q3 deck opens as a board of slides, then Present plays it in the page, stepping from the title to What shipped and what moved and to Weekly actives, each with its speaker notes.',
    ask: '“Turn the Q3 launch review into a deck with speaker notes.”',
  },
  websites: {
    clip: 'ask-websites',
    label: 'Claude Code puts the Acme Fit site on a bluedoc board: the Home and Blog pages load live from the dev server, then the board zooms into Home’s hero and pans across to the Blog’s posts.',
    ask: '“Put the Acme Fit site on a board, live from the dev server.”',
  },
  'store-listings': {
    clip: 'ask-listings',
    label: 'Claude Code writes the Acme Fit store listing and opens it in bluedoc on Google Play’s Wear OS, phone and tablet screenshot sets, then the App Store switch shows the Apple Watch, iPhone and iPad sets.',
    ask: '“Write the Acme Fit listing for Google Play and the App Store.”',
  },
  other: {
    clip: 'ask-other',
    label: 'Claude Code writes the week 41 status page and opens it in bluedoc: the TL;DR, the Numbers table, the pricing incident, and the open decision on the saved carts rollout with its recommended date.',
    ask: '“Write this week’s status page.”',
  },
};

export const atlasTypes = {
  id: 'doc-types',
  title: 'Inside your [agent].',
  lead: 'Ask for a doc the way you always do. Pick a type and see the page it opens.',
  pagesLabel: 'Every type has its own page',
  tabs: docTypes.items.map((t) => {
    const c = typeClips[t.id];
    return { id: t.id as PixelIconName, name: t.name, href: atlasTypeHref(t.id), ...c, seconds: clipSeconds(c.clip) };
  }),
  note: `Installs as a plugin in ${pluginAgents.map((t) => t.label).join(', ')}.`,
};

export const atlasSetup = {
  id: 'how-it-works',
  title: 'Install once.\n{Then answer on a page.}',
  steps: [
    {
      title: 'Install once.',
      body: 'One command adds the skill to your agent. It needs Python 3.9 or later and nothing to host.',
      clip: { name: 'every-home-overview', label: 'The bluedoc home page: the Decisions, Waiting on agent and By type widgets above the doc cards.' },
    },
    {
      title: 'Ask in plain words.',
      body: 'Ask for a plan, a review, a design or a deck, as you would anyway. It opens as a page on the local server.',
      clip: { name: 'docs-blocks', label: 'The Acme orders doc scrolled past its terms, three cards on ways to test fulfilment, a caution callout and the troubleshooting table.' },
    },
    {
      title: 'Answer on the page.',
      body: 'Point at a part, pick an option, approve. The agent reads every answer and revises.',
      clip: { name: 'every-option-rows', label: 'On the Acme saved carts plan, one option’s explanation opens, then two options are ticked and the question reads 2 picked.' },
    },
  ],
  support: [
    { lead: 'Plan mode too.', body: 'In plan mode the plan opens as a page, and the agent waits for Approve before it writes code.' },
    { lead: 'One JSON file per doc.', body: 'The server renders the page from it on every request, so an edit and a reload is the whole build.' },
  ],
};

// Chat versus page: the same five things you do with an agent's answer, and how each one goes.
export const atlasCompare = {
  title: 'A chat asks you to reply {in prose.}',
  lead: why.lead,
  columns: { act: 'What you do', chat: 'In a chat', page: 'On a bluedoc page' },
  chat: { name: 'A chat reply', tag: 'Prose in, prose out' },
  page: { name: 'A bluedoc page', tag: 'Point, pick, approve' },
  rows: [
    { act: 'Point at one part', chat: 'Quote it back in prose', page: 'Pin a comment on it' },
    { act: 'Choose between options', chat: 'Type “go with option 2”', page: 'Pick a row; the recommendation is starred' },
    { act: 'See what changed', chat: 'Reread the whole reply', page: 'Compare two revisions, word by word' },
    { act: 'Sign off', chat: 'Say “looks good”', page: 'Approve the current revision' },
    { act: 'Keep your answers', chat: 'Scrolled away in the transcript', page: 'Kept in ~/.bluedoc/state.db' },
  ],
  stats: why.stats,
  footnote: `Counted from the lists on this site, so they stay true when a type or an agent is added. Agent plugins: ${pluginAgents
    .map((t) => t.label)
    .join(', ')}; any other agent installs through the skills CLI.`,
};

export const atlasAnswering = {
  id: 'features',
  title: features.title,
  lead: 'Three things you do on every page, and two you never have to think about.',
  cards: [feature('comment'), feature('star'), feature('compare')],
  local: {
    ...feature('local'),
    facts: [
      { label: 'Address', value: '127.0.0.1' },
      { label: 'Accounts', value: '0' },
      { label: 'Your answers', value: 'state.db' },
    ],
  },
  approve: {
    ...feature('approve'),
    facts: [
      { label: 'Waits for', value: 'Approve' },
      { label: 'Sends back', value: 'Request changes' },
      { label: 'Each build', value: 'a revision' },
    ],
  },
  more: features.more,
};

export type FaqArt = 'free' | 'agents' | 'data' | 'offline' | 'export' | 'licence';

export const atlasFaq = {
  id: 'faq',
  title: 'Questions, {answered.}',
  items: [
    { ...question('Is it free?'), art: 'free' as FaqArt },
    { ...question('Which agents does it work with?'), art: 'agents' as FaqArt },
    { ...question('Where does my data live?'), art: 'data' as FaqArt },
    { ...question('Does it need an internet connection?'), art: 'offline' as FaqArt },
    { ...question('Can I export a doc?'), art: 'export' as FaqArt },
    { ...question('What licence is it under?'), art: 'licence' as FaqArt },
  ],
  agents: install.tabs.map((t) => ({ label: t.label, how: t.id === 'skills' ? 'any agent' : 'plugin' })),
};

export const atlasCta = {
  id: 'install',
  title: 'Answer your agent\non a [page].',
  body: 'Pick your agent. Each one installs the same skill from the GitHub repository.',
  tabs: install.tabs,
  primary: { label: 'Read the README', href: `${repoUrl}#readme` },
  secondary: { label: 'Star on GitHub', href: repoUrl },
  requirements: install.requirements,
};

export const atlasFooter = {
  tagline: 'Point, pick, approve.\nYour agent does the rest.',
  links: [
    { label: 'Doc types', href: `${atlasBase}#doc-types` },
    { label: 'How it works', href: `${atlasBase}#how-it-works` },
    { label: 'Revisions', href: atlasRevisionsHref },
    { label: 'Features', href: `${base}features/` },
    { label: 'FAQ', href: `${atlasBase}#faq` },
    { label: 'GitHub', href: repoUrl },
    { label: 'Credits and privacy', href: `${base}legal/` },
  ],
  current: { label: 'Current design', href: base },
};

// The revisions page (/variants/atlas/revisions/): what a revision is, how each doc type compares two, the onion
// skin, and the films where a revision lands. Clip copy comes from types.ts wherever a type page already shows the
// clip, so the two never describe it differently.
const typeClip = (type: keyof typeof typePages, clip: string): ClipCopy => typePages[type].features.find((f) => f.clip === clip)!;

export const atlasRevisions = {
  metaTitle: 'Revisions: compare any two, side by side or as an onion skin · bluedoc · Atlas variant',
  metaDescription:
    'Every bluedoc build records a revision with the agent’s note on what changed. Mark the changes word by word, put two screens side by side, or fade one over the other.',
  kicker: 'Feature · Revisions',
  headline: 'Every revision, kept.\n[Compare any two.]',
  subline:
    'Each build records a revision with the agent’s note on what changed. Open an earlier one, mark what changed word by word, or lay the new screen over the old one and fade between them.',
  hero: {
    clip: 'rev-onion',
    title: 'Fade one design into the next',
    body: 'Open a changed screen from the Revisions panel and switch to Onion skin. Drag the slider and the new dashboard fades in over the old one, so every moved card shows in place.',
    shows:
      'On acme-fit-design, the Revisions panel lists Dashboard as changed in rev D; its compare opens, Onion skin lays rev D over rev C, and the opacity slider fades the light indigo dashboard into a dark redesign and back, then rests half way.',
  } satisfies ClipCopy,
  loop: {
    kicker: 'How a revision works',
    title: 'The agent revises.\n{You see exactly what moved.}',
    steps: [
      {
        title: 'The agent records it',
        body: 'Every build records a revision in the doc’s history file, next to the doc, with one to four lines from the agent on what changed and why.',
      },
      {
        title: 'The page tells you',
        body: 'Open the doc after the agent revised it and a strip reads Updated since you last opened it: 1 → 2, with a Show what changed button.',
      },
      {
        title: 'Changes are marked in place',
        body: 'New, changed and removed parts are marked where they are, words struck and added, beside the agent’s note. Any two revisions compare.',
      },
      {
        title: 'Your comments close',
        body: 'A comment the agent dealt with moves to Resolved, with Resolved by the agent in rev 2. An approval holds across progress, never across new content.',
      },
    ],
  },
  byType: {
    kicker: 'On every doc type',
    title: 'Compare the way {the doc reads.}',
    lead: 'Prose is marked word by word, a drawing lights up the parts that are new or changed, a review shows where a recommendation moved, and screens and slides go side by side or as an onion skin.',
    tabs: [
      {
        id: 'docs' as PixelIconName,
        name: 'Docs',
        clip: {
          clip: 'docs-compare',
          title: 'See what changed since you last read',
          body: 'Updated since you last opened it offers Show what changed. The drawing marks the new part green and the changed one amber, and the text shows struck and added words.',
          shows:
            'On acme-orders, the reader opens rev 2 and presses Show what changed; Next change goes to the architecture canvas, where notify-worker glows green and orders DB amber, zooms in on them, then goes to the Known issues callout with its words struck and added.',
        } satisfies ClipCopy,
      },
      { id: 'plans' as PixelIconName, name: 'Plans', clip: typeClip('plans', 'plan-revise') },
      {
        id: 'reviews' as PixelIconName,
        name: 'Reviews',
        clip: {
          clip: 'review-compare',
          title: 'A finding’s recommendation, before and after',
          body: 'Changes from 1 marks the finding the agent moved to a ticket: the star now sits on Ticket, and What changed shows Fix in PR struck and Ticket added.',
          shows:
            'On acme-review-findings, compare view scrolls to the docs/pricing.md finding, marked Changed, with Ticket now Recommended and What changed listing Recommended going from Fix in PR to Ticket.',
        } satisfies ClipCopy,
      },
      { id: 'designs' as PixelIconName, name: 'Designs', clip: typeClip('designs', 'design-compare') },
      { id: 'presentations' as PixelIconName, name: 'Presentations', clip: typeClip('presentations', 'pres-compare') },
      { id: 'websites' as PixelIconName, name: 'Websites', clip: typeClip('websites', 'web-compare') },
    ].map((t) => ({ ...t, href: atlasTypeHref(t.id) })),
  },
  onion: {
    kicker: 'Onion skin',
    title: 'One screen over {the other.}',
    body: 'On a design or a presentation, compare puts a screen at two revisions side by side. Onion skin stacks them instead: the newer one over the older, with an opacity slider between them. Slide it and a nudged number, a dropped tab or a new layout shows where it moved, not in a list.',
    points: ['Side by side or Onion skin, remembered per browser', 'Links marked New, Removed or Changed', 'Any two revisions, not just the last two'],
    clip: typeClip('designs', 'design-onion'),
  },
  films: {
    kicker: 'A revision, start to finish',
    title: 'Ask for a change.\n{Watch it land.}',
    items: [films.design, films.sendBack],
  },
  more: {
    kicker: 'And the rest of it',
    title: 'Nothing is lost {between revisions.}',
    items: [every.revisions, every.compare, every.panel, every.conversation, every.carry, typeClip('websites', 'web-snapshot')],
  },
};
