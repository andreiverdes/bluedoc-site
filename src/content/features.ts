// Copy for the six data-driven feature pages (/features/<id>/), laid out by src/pages/features/[feature].astro, in
// the order the nav's Features menu lists them (Revisions, the fourth, has its own page: atlasRevisions in atlas.ts).
// Clip copy comes from types.ts, so a clip reads the same here as on /features/ and the type pages.
import type { PixelIconName } from '../lib/pixel-icons';
import { every, featuresPage, films, typePages, type ClipCopy, type TypePageCopy } from './types';

export type FeaturePageCopy = {
  id: 'comments' | 'questions' | 'approve' | 'sharing' | 'charts' | 'home';
  /** the label in the Features menu */
  name: string;
  /** one line under the name in the menu, ≤ 70 characters */
  pitch: string;
  icon: PixelIconName;
  /** page <title> and meta description */
  metaTitle: string;
  metaDescription: string;
  /** the small label over the title */
  kicker: string;
  /** rich markup (src/lib/rich.ts): [pixel blue], {soft}, \n */
  title: string;
  lead: string;
  /** the clip in the big frame; a film (film-*) has the same 16:10 frame */
  hero: ClipCopy & { url?: string };
  sections: { id: string; kicker: string; title: string; lead: string; clips: ClipCopy[] }[];
  /** "How the agent reads it", the same shape as a type page's */
  agent?: TypePageCopy['agent'];
  /** the agent section's small label; else atlasFeaturePageLabels.agentKicker */
  agentKicker?: string;
  /** the agent section's heading, rich markup; else atlasFeaturePageLabels.agentTitle */
  agentTitle?: string;
};

// a clip a type page shows, its hero or one of its features
function typeClip(type: keyof typeof typePages, clip: string): ClipCopy {
  const page = typePages[type];
  const found = [page.hero, ...page.features].find((f) => f.clip === clip);
  if (!found) throw new Error(`features.ts: no clip ${clip} on the ${type} page`);
  return found;
}

const plansAgent = typePages.plans.agent;

// ---- Comments ----

const comments: FeaturePageCopy = {
  id: 'comments',
  name: 'Comments',
  pitch: 'Pin, box, select or draw a comment on any part of the page.',
  icon: 'markup',
  metaTitle: 'Comments: pin, box, select or draw on any part of a page · bluedoc',
  metaDescription:
    'Comment on any part of a bluedoc page with Element, Region, Text and Pen. Each comment names the part it is about, from a diff line to a button on a screen, and is a conversation with the agent until it is resolved.',
  kicker: 'Feature · Comments',
  title: 'Comment on any part.\n[The agent knows which.]',
  lead: 'Element, Region, Text and Pen sit in the dock at the foot of every page. Each comment is filed under the part it is about, so the agent knows what to edit.',
  hero: { ...every.pin, url: '127.0.0.1 / acme-orders' },
  sections: [
    {
      id: 'tools',
      kicker: 'Four tools',
      title: 'Pin it, box it, select it or draw it.',
      lead: 'Element (C) pins, Region (M) boxes, Text (T) selects and Pen (D) draws. A note about the whole doc goes at the foot of the Comments panel.',
      clips: [every.select, every.draw, every.general, every.marks],
    },
    {
      id: 'every-type',
      kicker: 'On every doc type',
      title: 'The comment names what it is about.',
      lead: 'On a diff it names the file and the line; on a screen, a slide or a live page, the element. The agent knows exactly where to edit.',
      clips: [typeClip('reviews', 'review-line'), typeClip('designs', 'design-point'), typeClip('presentations', 'pres-point'), typeClip('websites', 'web-point')],
    },
    {
      id: 'conversations',
      kicker: 'Conversations',
      title: 'Talk it through, then see it resolved.',
      lead: 'Each comment is a conversation with the agent. Request changes sends them in one go, and the agent’s next revision says which ones it dealt with.',
      clips: [every.itemComment, every.conversation, every.attach, every.request, every.panel],
    },
  ],
  agentKicker: featuresPage.agentKicker,
  agentTitle: featuresPage.agentTitle,
  agent: featuresPage.agent,
};

// ---- Questions ----

const questions: FeaturePageCopy = {
  id: 'questions',
  name: 'Questions',
  pitch: 'Pick the starred answer, write your own, or ask for more.',
  icon: 'decide',
  metaTitle: 'Questions: answer the agent on one card, its pick starred · bluedoc',
  metaDescription:
    'When the agent can’t settle something alone, bluedoc puts the question on the page: its answers with the recommendation starred, Other for your own words, Tell me more, and a conversation per question.',
  kicker: 'Feature · Questions',
  title: 'The agent asks.\n[You answer on one card.]',
  lead: 'Each question the agent can’t settle alone is an answer card: its answers with the recommendation starred, Other for your own words, and Tell me more when you need to know more first.',
  hero: films.questions,
  sections: [
    {
      id: 'card',
      kicker: 'The answer card',
      title: 'Pick one, several, or ask for more.',
      lead: 'More details opens the question’s own detail, and picking an answer opens its explanation. Accept recommended takes every starred answer in a list at once.',
      clips: [every.optionRows, every.accept, every.more, typeClip('plans', 'plan-details')],
    },
    {
      id: 'every-type',
      kicker: 'On every doc type',
      title: 'The same card wherever the agent asks.',
      lead: 'A plan’s open questions, a review’s findings, a design’s brief, a website’s versions and a status page’s decision all answer the same way.',
      clips: [typeClip('reviews', 'review-decide'), typeClip('designs', 'design-theme'), typeClip('websites', 'web-versions'), every.sendAnswers],
    },
    {
      id: 'conversation',
      kicker: 'One conversation per question',
      title: 'Say why, and read the agent’s reply.',
      lead: 'A comment in an answer’s field is about that answer; the reply field is about the whole question. The agent answers in the same conversation, marked with its rev.',
      clips: [every.itemComment, every.conversation, every.attach],
    },
  ],
  agentKicker: 'How the agent asks',
  agentTitle: 'A question in the JSON.\n{Your answer back through serve.py wait.}',
  agent: {
    lead: 'The agent writes each choice it can’t make alone as a question with `choices` and a `recommend`. Tell me more comes back with Request changes; the agent answers with `--reply` and sharpens the answers in its next revision.',
    commands: [
      'python3 <skill>/scripts/serve.py wait docs/plans/saved-carts.bluedoc.json --kind any',
      'python3 <skill>/scripts/build.py patch docs/plans/saved-carts.bluedoc.json item:decisions/prices --reply "The notice flags each line whose price changed since the cart was saved." --change "Said what the price notice shows."',
    ],
    files: [
      plansAgent.files[1],
      {
        name: 'what serve.py wait prints',
        lang: 'md',
        code: `--- bluedoc change request (reply 3, rev 1, 2026-10-12T10:32:15+00:00) ---
# Change requests: Acme Shop: saved carts (rev 1), 2026-10-12

## Decisions
- How long does a saved cart stay after its last use? \`item:decisions/retention\` → **180 days** (\`d180\`)
- What does a restored cart charge when a price changed? \`item:decisions/prices\` → **Tell me more**
  > What does the notice say, and where does it show?
  Reply: \`build.py patch saved-carts.bluedoc.json item:decisions/prices --reply "…"\`
- Who can save a cart? \`item:decisions/guests\` → **Personal accounts**, **Business accounts**
--- end ---`,
      },
    ],
    note: 'Other comes back in your own words, and the agent treats it as your decision. While a question asks for more, Approve stays grey and says why.',
  },
};

// ---- Send and approve ----

const approve: FeaturePageCopy = {
  id: 'approve',
  name: 'Send and approve',
  pitch: 'Approve a revision, or send it back with your notes.',
  icon: 'approve',
  metaTitle: 'Send and approve: one send dialog for notes, picks and approval · bluedoc',
  metaDescription:
    'Plans, designs and websites wait for your approval of the current revision. Request changes, Send answers and Approve share one send dialog in bluedoc, and Claude Code’s plan mode waits for it.',
  kicker: 'Feature · Send and approve',
  title: 'Approve it,\n[or send it back.]',
  lead: 'Plans, designs and websites wait for your approval of the current revision. Request changes, Send answers and Approve share one send dialog, so you see what goes before it goes.',
  hero: films.planHook,
  sections: [
    {
      id: 'sending',
      kicker: 'The send dialog',
      title: 'See what goes, then send it.',
      lead: 'Your picks as chips, your comments in a timeline, then a one-line note with Attach. Text you typed but didn’t save goes too. A review’s key names its next step.',
      clips: [films.sendBack, every.request, every.sendAnswers, typeClip('reviews', 'review-send'), typeClip('presentations', 'pres-approve'), typeClip('store-listings', 'listing-approve')],
    },
    {
      id: 'approving',
      kicker: 'Approval',
      title: 'An approval belongs to one revision.',
      lead: 'The status chip reads Awaiting approval, Changes requested, then Approved. Marking steps done keeps the approval; any other edit asks for it again.',
      clips: [every.approve, typeClip('plans', 'plan-status'), typeClip('websites', 'web-approve'), every.carry, typeClip('plans', 'plan-details')],
    },
  ],
  agentKicker: 'How the agent waits',
  agentTitle: 'The agent waits for your send.\n{Then it acts on that revision.}',
  agent: {
    lead: 'With the plugin installed, every plan Claude Code finishes in plan mode opens as a page, and Claude waits with `serve.py wait`. On Request changes it patches the doc into a new revision; on Approve it leaves plan mode with your decisions.',
    commands: [
      'python3 <skill>/scripts/serve.py wait docs/plans/saved-carts.bluedoc.json --kind any',
      'python3 <skill>/scripts/build.py patch docs/plans/saved-carts.bluedoc.json step:steps/0/sweeper --set "md=Runs on the existing jobs queue." --change "The sweeper runs on the jobs queue." --resolves cmgp2r8v0d3k',
    ],
    files: [
      {
        name: 'what serve.py wait prints on Approve',
        lang: 'md',
        code: `--- bluedoc approval (reply 4, rev 1, 2026-10-12T10:41:07+00:00) ---
# Plan approved: Acme Shop: saved carts (rev 1), 2026-10-12

## Decisions
- How long does a saved cart stay after its last use? \`item:decisions/retention\` → **180 days** (\`d180\`)
- What does a restored cart charge when a price changed? \`item:decisions/prices\` → **Today's price + notice** (\`notice\`)
- Who can save a cart? \`item:decisions/guests\` → **Personal accounts**, **Business accounts**, **Guests, by email link** (recommended: Personal accounts, Business accounts)

## Notes with the approval
1. **03 Steps › Implementation order › 6. Schedule the nightly sweeper** (pin) \`step:steps/0/sweeper\` (cmwo2mn7pjare)
   > Schedule the nightly sweeper
   Note: Run it on the existing jobs queue
--- end ---`,
      },
    ],
    note: 'The Plan mode opens plans here switch in Settings, or `BLUEDOC_PLAN_HOOK=0`, turns the plan-mode hook off. Codex gets the same through its plugin’s `Stop` hook.',
  },
};

// ---- Share and export ----

const sharing: FeaturePageCopy = {
  id: 'sharing',
  name: 'Share and export',
  pitch: 'A view-only bluedoc.ai link, or an HTML, PDF or Markdown file.',
  icon: 'share',
  metaTitle: 'Share and export: a view-only link, or HTML, PDF and Markdown · bluedoc',
  metaDescription:
    'Share puts a bluedoc page in a secret gist on your own GitHub, behind a bluedoc.ai link that opens view-only in any browser; a reader with bluedoc can make a copy and pull your updates. Export saves it as HTML, PDF or Markdown.',
  kicker: 'Feature · Share and export',
  title: 'Share a link.\n[Or export a file.]',
  lead: 'Share puts the current revision in a secret gist on your own GitHub, behind a bluedoc.ai link that opens view-only in any browser. Export saves it as one HTML file, a PDF or Markdown.',
  hero: { ...every.share, url: '127.0.0.1 / acme-saved-carts-plan' },
  sections: [
    {
      id: 'link',
      kicker: 'The shared page',
      title: 'Read it anywhere. Copy it with bluedoc.',
      lead: 'The reader needs nothing installed. Your picks, ticks and sent comments go with the link as far as Include my answers lets them; no file path leaves your machine.',
      clips: [every.sharedPage, every.copyPull],
    },
    {
      id: 'export',
      kicker: 'Export',
      title: 'One file, from any page.',
      lead: 'Every page exports the revision you’re viewing. Decks and listings have their own key, Export to…; a design’s icon sheet saves every PNG size.',
      clips: [every.export, typeClip('store-listings', 'listing-export'), typeClip('designs', 'design-icon-export')],
    },
  ],
  agentKicker: 'From the terminal',
  agentTitle: 'Your agent can share and export too.',
  agent: {
    lead: '`serve.py share` puts the doc in its gist and prints the link; run again, it updates the same gist. A colleague’s agent copies it with `serve.py import`, and `build.py -o` writes the offline HTML file.',
    commands: [
      'python3 <skill>/scripts/serve.py share docs/plans/saved-carts.bluedoc.json --answers picks,ticks,comments',
      'python3 <skill>/scripts/serve.py import https://bluedoc.ai/g/<id>',
      'python3 <skill>/scripts/build.py docs/plans/saved-carts.bluedoc.json -o saved-carts.html',
    ],
    files: [],
    note: 'A secret gist is unlisted and not searchable, but anyone with the link can read it: check the doc for secrets first. `serve.py unshare` deletes the gist.',
  },
};

// ---- Charts ----

const charts: FeaturePageCopy = {
  id: 'charts',
  name: 'Charts',
  pitch: 'Stat cards, lines, bars and a donut, drawn in the page.',
  icon: 'chart',
  metaTitle: 'Charts: numbers drawn in the page, in dark and light · bluedoc',
  metaDescription:
    'A bluedoc chart block holds the numbers and the page draws them: stat cards, lines and areas, bars, ranked bars, a donut and progress rows, in dark and light, with the values on hover.',
  kicker: 'Feature · Charts',
  title: 'The agent writes numbers.\n[The page draws them.]',
  lead: 'A chart is a block of numbers in the doc, never an image. The page draws it in light and dark, with the values on hover, and the next revision marks the ones that moved.',
  hero: { ...typeClip('other', 'other-chart'), url: '127.0.0.1 / acme-status' },
  sections: [
    {
      id: 'status',
      kicker: 'Status pages',
      title: 'The answer first, then the numbers.',
      lead: 'A status page opens on one number and its TL;DR, then the numbers with a chart. The home page shows that number on the doc’s card.',
      clips: [typeClip('other', 'other-status'), typeClip('other', 'other-hero-stat'), every.homeStats],
    },
    {
      id: 'revisions',
      kicker: 'Week after week',
      title: 'Ask about a number. Compare next week.',
      lead: 'Box a table with Pen and the agent gets the part’s key. Next week’s update is a new revision of the same page, and compare marks what moved.',
      clips: [every.draw, every.panel, typeClip('other', 'other-week')],
    },
  ],
  agentKicker: 'How the agent writes a chart',
  agentTitle: 'Numbers in the JSON.\n{The page draws them.}',
  agent: {
    lead: 'Numbers go in a `chart` block: stat cards, lines and areas, bars side by side or stacked, ranked bars, a donut or progress rows. `build.py schema chart` prints the format.',
    commands: ['python3 <skill>/scripts/build.py schema chart', 'python3 <skill>/scripts/build.py docs/status/week-41.bluedoc.json'],
    files: [
      {
        name: 'acme-status.bluedoc.json · a line chart',
        lang: 'json',
        code: `{
  "type": "chart",
  "kind": "line",
  "title": "Orders per day",
  "unit": "orders",
  "x": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "series": [
    { "id": "w41", "label": "Week 41", "values": [2510, 2630, 2702, 2588, 2790, 2810, 2390], "area": true },
    { "id": "w40", "label": "Week 40", "values": [2440, 2480, 2530, 2470, 2650, 2660, 2150], "tone": "muted" }
  ],
  "caption": "Thursday's dip is the 18-minute pricing slowdown. Source: orders dashboard."
}`,
      },
      {
        name: 'acme-status.bluedoc.json · a stat card',
        lang: 'json',
        code: `{
  "type": "chart",
  "kind": "stat",
  "title": "Refund rate",
  "sub": "weeks 34 to 41",
  "x": ["Week 34", "Week 35", "Week 36", "Week 37", "Week 38", "Week 39", "Week 40", "Week 41"],
  "stats": [
    {
      "label": "Refunds", "value": 1.2, "unit": "%", "delta": "0.0 pt", "good": "down",
      "spark": [1.4, 1.3, 1.3, 1.2, 1.3, 1.2, 1.2, 1.2]
    }
  ]
}`,
      },
    ],
    note: 'Colours come from ten theme tones, never hex. The build checks that every x label has one value and every number is finite.',
  },
};

// ---- Home and Settings ----

const home: FeaturePageCopy = {
  id: 'home',
  name: 'Home and Settings',
  pitch: 'Every doc on one page: search, filters, statistics and Settings.',
  icon: 'home',
  metaTitle: 'Home and Settings: every doc on one home page · bluedoc',
  metaDescription:
    'The bluedoc home page lists every doc across your projects: one search, Type, Status and Project menus, Cards or Rows, Statistics over 7 to 90 days, and one Settings page.',
  kicker: 'Feature · Home and Settings',
  title: 'Every doc,\n[on one home page.]',
  lead: 'The local server lists every doc with its type, status and revision, across your projects. Pin a project, hide one, give it a name and an icon. The gear opens Settings.',
  hero: { ...every.homeCards, url: '127.0.0.1:8740' },
  sections: [
    {
      id: 'find',
      kicker: 'Find a doc',
      title: 'Search it, filter it, archive it.',
      lead: 'One search covers every doc’s text. The menus narrow the list, the sidebar lists your projects with the pinned ones first, and a finished doc goes to Archived.',
      clips: [every.homeSearch, every.homeFilters, every.homeArchive],
    },
    {
      id: 'statistics',
      kicker: 'Statistics',
      title: 'What waits on you, and on the agent.',
      lead: 'Statistics counts edits and decisions by project and type. A status page’s hero stat shows on its card.',
      clips: [every.homeStats, typeClip('other', 'other-hero-stat')],
    },
    {
      id: 'settings',
      kicker: 'Settings and theme',
      title: 'One Settings page, one theme switch.',
      lead: 'Settings holds the folders, code links, the plan-mode hook’s switch and the GitHub account each project shares as. The ☀/☾ switch carries from the home page to every doc.',
      clips: [every.settings, every.theme, every.width],
    },
  ],
};

export const featurePages: FeaturePageCopy[] = [comments, questions, approve, sharing, charts, home];
