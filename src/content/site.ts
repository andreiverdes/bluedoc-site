// The facts every page shares: the doc types, the features, the install commands, the FAQ and the legal page.
// atlas.ts arranges most of them for the pages; the type, Features and legal pages read some directly.
import type { PixelIconName } from '../lib/pixel-icons';
import { base } from '../lib/paths';

// Headings use a small markup that src/lib/rich.ts renders: [words] in the blue pixel face, {words} in the soft
// second ink, and a line break where the text has one.

export const repoUrl = 'https://github.com/andreiverdes/bluedoc';

export const meta = {
  title: 'bluedoc: a visual reply to your verbose agent',
  description:
    'An agent skill for docs, plans, code reviews, UI designs, slide decks, app icons and store listings. The agent writes one JSON file; a local server renders it as a page you comment on, decide and approve.',
  ogImageAlt: 'bluedoc: a pixel-art night bay with a ringed planet, the bluedoc logo and the headline “Plan, document, design and more. A visual reply to your verbose agent.”',
};

// The type pages link to the Features page from their shared clips.
export const nav = {
  typesMenu: {
    features: { href: `${base}features/` },
  },
};

type DocType = {
  id: PixelIconName;
  name: string;
  tag: string;
  pitch: string;
};

export const docTypes = {
  kicker: 'Doc types',
  title: 'Eight kinds of page, {one way to answer them.}',
  lead: 'Each type has its own layout and its own decisions. Comments, revisions and approval work the same on all of them.',
  items: [
    {
      id: 'docs',
      name: 'Docs',
      tag: 'docs',
      pitch: 'Architecture pages, walkthroughs, runbooks, setup guides and change proposals.',
    },
    {
      id: 'plans',
      name: 'Plans',
      tag: 'plan',
      pitch: 'A plan you approve or send back before the agent writes code.',
    },
    {
      id: 'reviews',
      name: 'Reviews',
      tag: 'review',
      pitch: 'Review findings pinned to their lines from git, one decision per finding.',
    },
    {
      id: 'designs',
      name: 'Designs',
      tag: 'design',
      pitch: 'UI screens on a pan-and-zoom board, and app icons.',
    },
    {
      id: 'presentations',
      name: 'Presentations',
      tag: 'presentation',
      pitch: 'Slide decks with speaker notes, played in Present.',
    },
    {
      id: 'websites',
      name: 'Websites',
      tag: 'website',
      pitch: 'A site’s pages on a board, live from its dev server.',
    },
    {
      id: 'store-listings',
      name: 'Store listings',
      tag: 'storelisting',
      pitch: 'An app’s Google Play and App Store listing, checked against the stores’ rules.',
    },
    {
      id: 'other',
      name: 'Other',
      tag: 'other',
      pitch: 'Status pages, incident reports, inventories, meeting notes and comparisons.',
    },
  ] satisfies DocType[],
};

type FeatureIcon = 'comment' | 'star' | 'compare' | 'approve' | 'local' | 'agents';

export const features = {
  title: 'Built for answering, {not just reading.}',
  more: { label: 'See every feature', href: `${base}features/` },
  items: [
    {
      icon: 'comment',
      title: 'Comments that become conversations',
      body: 'Pin a comment on an element, box a region, select a passage or draw with the pen, and attach a file when words aren’t enough. Each comment is a thread the agent replies in, its replies signed with its model’s name.',
    },
    {
      icon: 'star',
      title: 'One answer card per question',
      body: 'Each answer explains itself in a line, and More details opens the agent’s reasoning. Pick one, or several where a question allows, write your own under Other, or ask it to Tell me more. Each list’s Accept recommended takes every starred answer.',
    },
    {
      icon: 'compare',
      title: 'Revisions you can compare',
      body: 'Every build is a revision. Changes from N, on each row of the Revisions panel, marks new, changed and removed parts in place, word by word.',
    },
    {
      icon: 'approve',
      title: 'Approve, and the agent proceeds',
      body: 'Plans, designs and websites wait for approval on the current revision. Approve and Request changes open one send dialog: what goes, a note, then the send key.',
    },
    {
      icon: 'local',
      title: 'Your input stays on your machine',
      body: 'Ticks, picks and comments live in a local SQLite file the server owns, never in the repo. Screens run sandboxed, with no network. A doc leaves only when you press Share.',
    },
    {
      icon: 'agents',
      title: 'Works with your agent, plan mode too',
      body: 'Claude Code, Codex, Copilot CLI, Antigravity CLI, pi and omp install it as a plugin, with /bluedoc-* commands. In plan mode, the plan-mode hook opens the plan as a page and waits for your approval.',
    },
  ] satisfies { icon: FeatureIcon; title: string; body: string }[],
};

export const install = {
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
  requirements: ['Python 3.9 or later on PATH', 'git, for code reviews', 'gh, only for GitHub review threads and Share'],
};

// What a page gives you that a chat reply doesn't, in four counts. Each `count` is worked out from the lists above,
// so it stays true when a type or an agent is added.
const pluginAgents = install.tabs.filter((t) => t.id !== 'skills');
export const why = {
  lead: 'Agents answer in walls of text and wait for a reply in prose. A bluedoc page asks you the questions and keeps your answers.',
  stats: [
    { count: docTypes.items.length, label: 'Doc types', body: 'Docs, plans, reviews, designs, decks, sites, store listings and more.' },
    { count: pluginAgents.length, label: 'Agent plugins', body: `${pluginAgents.map((t) => t.label).join(', ')}. Any other through the skills CLI.` },
    { count: 1, label: 'JSON file per doc', body: 'The server renders the page from it; no HTML to keep in sync.' },
    { count: 0, label: 'Accounts', body: 'No bluedoc account and no hosted service: it runs on 127.0.0.1, MIT.' },
  ],
};

export const faq = {
  items: [
    {
      q: 'Is it free?',
      a: 'Yes. bluedoc is open source under the MIT licence. There is no account, no subscription and no hosted service.',
    },
    {
      q: 'Which agents does it work with?',
      a: 'Claude Code, Codex, Copilot CLI, Antigravity CLI, pi and omp install it as a plugin, with a plan-mode hook and /bluedoc-* commands. Any other agent that reads skills can get it with the skills CLI (npx skills add andreiverdes/bluedoc) or a copy of the skill folder.',
    },
    {
      q: 'Where does my data live?',
      a: 'On your machine. Ticks, picks, comments and replies live in ~/.bluedoc/state.db, a SQLite file the local server owns, never in the repo; the Settings page keeps its switches in ~/.bluedoc/settings.json. Only a browser that opened a link from the server can save. A doc leaves only when you press Share.',
    },
    {
      q: 'Does it need an internet connection?',
      a: 'No. The server runs on 127.0.0.1 and serves its fonts, styles and UI kits itself. Design screens run sandboxed with no network. Only Share, importing GitHub review threads, or diffing a PR whose repo isn’t checked out calls gh.',
    },
    {
      q: 'Can I export a doc?',
      a: 'Yes. The app bar’s ⋮ → Export saves the revision you’re viewing as an HTML file that opens without the server, a PDF, or Markdown. Decks and store listings have their own Export to…: decks as PDF, store listings as a fastlane ZIP, a plain-folders ZIP, a PDF or HTML.',
    },
    {
      q: 'Can I share a doc with someone?',
      a: 'Yes. Share puts the doc’s current revision in a secret gist on your own GitHub account, through gh, and copies a bluedoc.ai/g/ link that opens in any browser with nothing to install. The page there is view-only: the reader reads it, downloads it, or makes a copy in their own bluedoc. Update sends a new revision to the same link; Stop sharing deletes the gist. Anyone with the link can read it, so check the doc first.',
    },
    {
      q: 'What licence is it under?',
      a: 'bluedoc’s own code is MIT. The vendored HorizonUI build is Apache-2.0, and the fonts it ships are SIL OFL 1.1. The repository’s README lists every third-party licence.',
    },
  ],
};

export const footer = {
  licence: { label: 'MIT licence', href: `${repoUrl}/blob/main/LICENSE` },
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
        '**bluedoc** keeps everything on your machine. Your comments, picks and approvals live in a SQLite file under `~/.bluedoc`, and the server only listens on 127.0.0.1. Nothing is sent anywhere unless your agent sends it, or you press **Share**: then the doc’s current revision, with the answers you leave switched on under Include my answers, goes to a secret gist on your own GitHub account, through `gh`. Anyone with its link can read it; Stop sharing deletes it.',
        '**This site** sets no cookies, loads no analytics or trackers, and has no forms. It opens in the dark theme; if you switch to light, that choice is kept in your browser’s session storage until you close the tab and never leaves it. A shared doc at bluedoc.ai/g/ is fetched by your browser straight from GitHub’s gist API, and keeps only its view settings (theme, panel open and width) in your browser’s local storage. The site is hosted on GitHub Pages, which keeps server logs under [GitHub’s privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement); the same statement covers those gist requests.',
      ],
    },
    {
      id: 'credits',
      title: 'Credits',
      body: [
        '**Fonts:** Geist, Geist Mono and Geist Pixel, under the SIL Open Font License 1.1, served from this site.',
        '**Icons:** [Lucide](https://lucide.dev), under the ISC licence.',
        '**Animation:** [Motion](https://motion.dev), under the MIT licence.',
        '**Art and recordings:** the pixel-art banners and the clips come from the [bluedoc repository](' + repoUrl + ') (MIT), recorded from its Acme examples. They show bluedoc’s HorizonUI build (Apache-2.0).',
      ],
    },
  ],
};
