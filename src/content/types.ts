// Copy and clip lists for the seven type pages (/docs/ … /other/) and the Features page (/features/). TypePage.astro
// lays out one type page; src/pages/features.astro lays out featuresPage.
// Each clip is named by its id in the showcase plan; its files are public/clips/<clip>.{mp4,webm,poster.webp}.
// A clip whose files aren't recorded yet shows as a card with its title (see Clip.astro).
import { repoUrl } from './site';

export type ClipCopy = {
  /** file name in public/clips/, without extension */
  clip: string;
  /** the heading next to the clip, and the title on its card until it is recorded */
  title: string;
  /** 1–2 sentences beside the clip */
  body: string;
  /** what the clip shows, read to screen readers */
  shows: string;
};

export type CodeFile = { name: string; lang: 'json' | 'html' | 'md'; code: string };

export type TypePageCopy = {
  /** the doc type's id in docTypes (site.ts) */
  type: string;
  name: string;
  /** the page's large heading, at the top of its hero */
  display: string;
  /** page <title> and meta description */
  metaTitle: string;
  metaDescription: string;
  title: string;
  pitch: string;
  /** the Acme example the clips are recorded from */
  example: { id: string; about: string; href: string };
  hero: ClipCopy & { url: string };
  forTitle: string;
  forLead: string;
  kinds: { label: string; body: string }[];
  features: ClipCopy[];
  /** shared clips from the Every doc list */
  shared: ClipCopy[];
  agent: { lead: string; commands: string[]; files: CodeFile[]; note: string };
};

const exampleHref = (file: string) => `${repoUrl}/blob/main/skills/bluedoc/examples/${file}`;

// ---- shared clips: features every doc type has; all of them are on /features/, a few on each type page ----

const every = {
  pin: {
    clip: 'every-pin',
    title: 'Pin a comment on any element',
    body: 'Point at a node, a row or a button and write a note. The pin stays on the element.',
    shows: 'On acme-orders, Point mode is on, the cursor clicks the orders-api node, a note is typed and saved, and the pin stays on the node.',
  },
  select: {
    clip: 'every-select',
    title: 'Comment on a passage',
    body: 'Select a sentence and say what should change.',
    shows: 'On acme-orders, a TL;DR sentence is selected and a change is written about it and saved.',
  },
  draw: {
    clip: 'every-draw',
    title: 'Draw around a part and comment on it',
    body: 'Draw mode takes a pen colour and a freehand stroke. Box a table or a group of rows, and the note covers each part inside.',
    shows: 'On acme-status, Draw mode is on, the amber pen is picked, the numbers table is boxed by hand and a note is written and saved.',
  },
  marks: {
    clip: 'every-marks',
    title: 'Hide and show comment marks',
    body: 'The eye key fades pins, marked passages and drawings out, so you can read the page clean, and brings them back.',
    shows: 'On acme-orders, the eye key fades a pin, a marked phrase and a drawing out, then brings them back.',
  },
  general: {
    clip: 'every-general',
    title: 'Write a general comment',
    body: 'A note about the whole doc rather than one spot goes in the field at the foot of the Comments panel. It lists first.',
    shows: 'On acme-status, a general comment is written at the foot of the Comments panel and saved; it lists first, above the comments on single spots.',
  },
  itemComment: {
    clip: 'every-item-comment',
    title: 'Comment on one item',
    body: 'Each step, question and finding has its own comment box. An item comment counts toward Request changes on its own.',
    shows: 'On acme-saved-carts-plan, a comment is written in a question’s comment box and saved; the item shows a comment mark and Request changes counts it.',
  },
  pills: {
    clip: 'every-pills',
    title: 'Pick an option from decision pills',
    body: 'Each open question shows its options as pills, the agent’s recommendation starred. Pick one and the question counts as decided.',
    shows: 'On acme-saved-carts-plan, the cursor hovers the starred option, then picks another; the dot fills and Decisions reads 1/3.',
  },
  accept: {
    clip: 'every-accept',
    title: 'Accept every recommendation at once',
    body: 'Accept recommended picks every starred option in one go. Change the ones you disagree with afterwards.',
    shows: 'On acme-saved-carts-plan, Accept recommended picks all three starred options; Decisions reads 3/3 and the key’s count drops to 0.',
  },
  more: {
    clip: 'every-more',
    title: 'Ask for more details',
    body: 'Need more details marks a question and asks the agent what is missing before you pick.',
    shows: 'On acme-saved-carts-plan, Need more details turns a decision’s dot amber and asks what is missing; Approve greys out.',
  },
  request: {
    clip: 'every-request',
    title: 'Send change requests to the agent',
    body: 'Request changes previews your notes as Markdown, then sends them in one go.',
    shows: 'On acme-saved-carts-plan, Request changes opens the Markdown preview, Send is pressed, and the status chip reads Changes requested.',
  },
  sendAnswers: {
    clip: 'every-send-answers',
    title: 'Send ticks and picks without approval',
    body: 'Pages with no approval step, such as a status report or a review, send your ticks, picks and comments with Send answers.',
    shows: 'On acme-status, a task is ticked and the rollout date picked; Send answers turns green and opens a dialog with what goes to the agent.',
  },
  approve: {
    clip: 'every-approve',
    title: 'Approve the current revision',
    body: 'Approve lists your picks and records the approval against this revision. The agent waits for it.',
    shows: 'On acme-saved-carts-plan, Approve plan lists the picks, Approve is pressed, and the chip turns Approved · rev 1.',
  },
  panel: {
    clip: 'every-panel',
    title: 'Follow a comment to Resolved',
    body: 'Notes go from Pending to Open when sent, and to Resolved when the agent’s revision says it dealt with them.',
    shows: 'On acme-status, Request changes turns two notes Open; at rev 2 one of them reads Resolved by the agent.',
  },
  revisions: {
    clip: 'every-revisions',
    title: 'Open an earlier revision',
    body: 'The Revisions tab lists each revision with the agent’s note on what changed. An earlier one opens read-only.',
    shows: 'On acme-review-findings, the Revisions tab lists each revision with its note on what changed, and rev 1 opens read-only.',
  },
  compare: {
    clip: 'every-compare',
    title: 'Compare two revisions word by word',
    body: 'New, changed and removed parts are marked in place, with words struck and added.',
    shows: 'On acme-review-findings, Changes from rev 1 marks new, changed and removed parts, with words struck and added.',
  },
  carry: {
    clip: 'every-carry',
    title: 'Keep an approval across progress',
    body: 'A revision that only marks steps done keeps the approval. Any other edit asks for approval again.',
    shows: 'On acme-saved-carts-plan, rev 1 is approved; rev 2 only marks a step done and the chip reads Approved · rev 1 · progress in rev 2; rev 3 edits the content and the chip turns to Changes since approved rev 1.',
  },
  homeSearch: {
    clip: 'every-home-search',
    title: 'Search every doc from the home page',
    body: 'One search covers every doc’s titles, sections, findings and paths, best match first.',
    shows: 'On the bluedoc home page, “carts” is typed in the search; the cards narrow to the two that match, the plan on top, with the words marked.',
  },
  homeFilters: {
    clip: 'every-home-filters',
    title: 'Filter by status and type',
    body: 'Chips for each status and each type show their counts. Pick one and the cards narrow to match.',
    shows: 'On the home page, Awaiting approval narrows the cards to the website, the design and the plan; then the Plans chip leaves the plan alone.',
  },
  homeCards: {
    clip: 'every-home-cards',
    title: 'Browse docs as a grid, a list or a board',
    body: 'Each card draws its doc. Lay them out as a grid, a list, or a board with Needs you, Waiting on agent, In progress and Done.',
    shows: 'On the home page, hovering the docs card plays its flow; then the cards switch from a grid to a list to a board of status columns.',
  },
  homeOverview: {
    clip: 'every-home-overview',
    title: 'Read the overview',
    body: 'Decisions counts what is decided across the docs, Waiting on agent lists what you sent, and By type splits the docs and filters them.',
    shows: 'On the home page, the Decisions, Waiting on agent and By type widgets; a By type row filters the cards below.',
  },
  theme: {
    clip: 'every-theme',
    title: 'Switch between light and dark',
    body: 'The theme key flips the home page and every doc. The pick carries from one page to the next.',
    shows: 'On the home page, the theme key swaps the night city for the day one; acme-orders opens in light, and its own key flips it back to dark.',
  },
  width: {
    clip: 'every-width',
    title: 'Drag the content width',
    body: 'Drag the column’s edge to make the text wider or narrower. It stays centred; a double-click resets it.',
    shows: 'On acme-orders, the column’s right edge is dragged in; both edges move so the column stays centred, a chip shows the width, and a double-click resets it.',
  },
} satisfies Record<string, ClipCopy>;

// ---- Docs ----

const docs: TypePageCopy = {
  type: 'docs',
  display: 'Documentation',
  name: 'Docs',
  metaTitle: 'Docs: architecture pages, runbooks and walkthroughs · bluedoc',
  metaDescription:
    'A bluedoc docs page explains a system that exists: a zoomable blueprint canvas nested 3 levels deep, animated data flows, and runbook checklists whose ticks the local server keeps.',
  title: 'A system on one page, with a drawing you can open.',
  pitch:
    'A docs page explains a system that exists. The system is a blueprint canvas you zoom into, flows play across it step by step, and procedures are checklists whose ticks the local server keeps.',
  example: {
    id: 'acme-orders',
    about: 'the Acme order path from checkout to pick ticket, with a runbook for the local stack',
    href: exampleHref('acme-orders.bluedoc.json'),
  },
  hero: {
    clip: 'docs-nested-zoom',
    title: 'Zoom three levels into the order path and back',
    body: 'A node with children is a system. Double-click it, or zoom in, to see its parts on their own sheet; Esc and the crumbs go back up.',
    shows: 'On acme-orders, the cursor double-clicks orders-api, zooms into pricing to its discount rules and tax table, then climbs back up with the crumbs.',
    url: '127.0.0.1 / acme-orders',
  },
  forTitle: 'One page per system, in five shapes.',
  forLead: 'The agent picks the kind when it starts the page; each has its own order of sections.',
  kinds: [
    { label: 'Architecture', body: 'The system on a canvas, its terms, its parts and the decisions behind them.' },
    { label: 'Walkthrough', body: 'One flow per scenario on the canvas, then each step explained.' },
    { label: 'Runbook', body: 'Procedures as checklists, with verification and a troubleshooting table.' },
    { label: 'Setup', body: 'Prerequisites, the stack you are building and the steps to get it running.' },
    { label: 'Change', body: 'Proposed and removed parts on the canvas, what changes and the rollout.' },
  ],
  features: [
    {
      clip: 'docs-canvas',
      title: 'Pan and zoom the blueprint canvas',
      body: 'The system is a drawing you drag and zoom. Edges run at right angles, routed around the nodes, and their labels don’t overlap.',
      shows: 'On acme-orders, the cursor drags and wheel-zooms over the order path canvas; edges keep right angles around the nodes.',
    },
    {
      clip: 'docs-flows',
      title: 'Watch a data flow run across the systems',
      body: 'A flow plays one step per edge: a token rides the edge with its payload, and the caption reads the step and counts Step n of m.',
      shows: 'On acme-orders, the Production path flow plays; a token with its payload rides each edge and the caption counts the steps.',
    },
    {
      clip: 'docs-flow-pick',
      title: 'Pick a flow and step through it',
      body: 'Each level has its own flows. Pick one in the canvas header, pause it, and step with ‹ › one hop at a time.',
      shows: 'On acme-orders, the Local stack path flow is picked, paused, then stepped through with the previous and next keys.',
    },
    {
      clip: 'docs-node-detail',
      title: 'Open a node’s notes and source anchors',
      body: 'Click a node to read its notes and where it lives in the repo, as path:line references.',
      shows: 'On acme-orders, the cursor clicks fulfilment-worker and the panel shows its notes and file references.',
    },
    {
      clip: 'docs-kinds',
      title: 'Read edge kinds and node states',
      body: 'Edges show what moves: data, control calls, async events. A node marked unverified, local or proposed looks different from the live parts.',
      shows: 'On acme-orders, async event edges show violet and dotted, control calls dashed, PayCo as unverified and the seeder as local only.',
    },
    {
      clip: 'docs-fullscreen',
      title: 'Open the drawing full screen',
      body: 'Full screen gives the canvas the whole window, Fit frames the drawing, and Esc returns to the page.',
      shows: 'On acme-orders, Full screen fills the window with the canvas, Fit frames the drawing, and Esc returns to the page.',
    },
    {
      clip: 'docs-checklist',
      title: 'Tick a runbook step',
      body: 'Each procedure is a checklist. A step opens to its command and its check; tick it and the progress bar moves. The local server keeps the ticks.',
      shows: 'On acme-orders, the Start the fulfilment worker step opens, its command is copied, it is ticked and the progress bar moves.',
    },
    {
      clip: 'docs-checklist-ref',
      title: 'Jump from a checklist step to its node',
      body: 'A step or a table cell can name a node. Its ref key flies the canvas there.',
      shows: 'On acme-orders, a checklist step’s ref key moves the canvas to the consume step inside fulfilment-worker.',
    },
    {
      clip: 'docs-copy-progress',
      title: 'Copy checklist progress as Markdown',
      body: 'Copy progress exports the ticks as a Markdown checklist, for a PR or an issue.',
      shows: 'On acme-orders, Copy progress is pressed and a card shows the copied Markdown with its ticked items.',
    },
    {
      clip: 'docs-blocks',
      title: 'Terms, cards, callouts and tables',
      body: 'Around the drawing, the page is built from blocks: terms, cards, callouts and tables, each one a thing you can comment on.',
      shows: 'On acme-orders, the page scrolls past the terms, three cards on ways to test fulfilment, a caution callout and the troubleshooting table.',
    },
  ],
  shared: [every.pin, every.select, every.compare],
  agent: {
    lead: 'The agent starts from a skeleton and fills it in. A node with `children` is a system you can open; each level has its own flows.',
    commands: [
      'python3 <skill>/scripts/build.py new docs docs/orders/order-path.bluedoc.json --title "Order path" --kind Architecture',
      'python3 <skill>/scripts/build.py docs/orders/order-path.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/orders/order-path.bluedoc.json',
    ],
    files: [
      {
        name: 'acme-orders.bluedoc.json · a canvas node',
        lang: 'json',
        code: `{
  "id": "api",
  "label": "orders-api",
  "sub": "Node · Fastify",
  "md": "Validates, prices and charges the order.",
  "refs": ["\`services/orders-api/src/routes/createOrder.ts:18-96\`"],
  "children": {
    "nodes": [
      { "id": "auth", "label": "auth hook", "sub": "JWT check", "col": 0, "row": 0 },
      { "id": "validate", "label": "validate", "sub": "zod schema", "col": 1, "row": 0 }
    ],
    "edges": [
      { "from": "@left", "to": "auth", "label": "POST /orders" },
      { "from": "auth", "to": "validate" }
    ],
    "flows": [{
      "id": "create",
      "label": "Create one order",
      "steps": [
        { "edge": "@left->auth", "label": "The auth hook checks the JWT.", "payload": "JWT" }
      ]
    }]
  }
}`,
      },
    ],
    note: 'build.py validates the doc, lints it and records the revision; serve.py prints the page’s URL.',
  },
};

// ---- Plans ----

const plans: TypePageCopy = {
  type: 'plans',
  display: 'Plans',
  name: 'Plans',
  metaTitle: 'Plans: approve or send back before the agent writes code · bluedoc',
  metaDescription:
    'A bluedoc plan puts the goal, the proposed design, the steps, the files, the risks and the checks on one page, with open questions to pick. The agent waits for Approve plan before it writes code.',
  title: 'A plan you approve before any code is written.',
  pitch:
    'The agent writes its plan as a page: the goal, the proposed design on a canvas, the steps and the files each one touches, then the open questions with its recommendation starred. Approve it, or send it back with your notes.',
  example: {
    id: 'acme-saved-carts-plan',
    about: 'a 7-step plan for saved carts in the Acme shop, with three open questions',
    href: exampleHref('acme-saved-carts-plan.bluedoc.json'),
  },
  hero: {
    clip: 'plan-status',
    title: 'Watch the status chip follow the review',
    body: 'The chip at the top reads Awaiting approval, then Changes requested once you send notes, then Approved once you approve the agent’s next revision.',
    shows: 'On acme-saved-carts-plan, the status chip goes from Awaiting approval to Changes requested; the agent’s rev 2 loads, Approve plan is pressed and the chip reads Approved · rev 2.',
    url: '127.0.0.1 / acme-saved-carts-plan',
  },
  forTitle: 'Every plan has the same eight parts.',
  forLead: 'The agent starts from a skeleton and fills each part from the code it read, so plans read the same from one task to the next.',
  kinds: [
    { label: 'Goal', body: 'What ships, for whom, in how many steps, and how many questions need a pick.' },
    { label: 'Context', body: 'The current state and why it has to change, with file and line anchors.' },
    { label: 'Approach', body: 'The proposal on a canvas, new parts marked proposed; before/after panes and mockups.' },
    { label: 'Steps', body: 'One reviewable change each, in order, with its effort and the files it touches.' },
    { label: 'Files', body: 'Every path the plan adds, edits, deletes or moves, and why.' },
    { label: 'Open questions', body: 'One per choice you make, the agent’s recommendation starred.' },
    { label: 'Risks', body: 'Likelihood, impact and mitigation, in a table.' },
    { label: 'Verification', body: 'The checks that show the plan worked, with their commands.' },
  ],
  features: [
    {
      clip: 'plan-tour',
      title: 'Read a plan from top to bottom',
      body: 'One page holds it all: the goal, the proposed design, before and after, the mockup, the steps, the files and the risks.',
      shows: 'On acme-saved-carts-plan, the page scrolls from the header and TL;DR past the proposed canvas, the before/after panes over the wireframe, the steps and the files, to the risks.',
    },
    {
      clip: 'plan-proposed',
      title: 'Tell proposed parts from live ones',
      body: 'On the Approach canvas, parts the plan adds are drawn amber and dashed, apart from what runs today. A flow runs through them to show how they fit.',
      shows: 'On acme-saved-carts-plan, the Approach canvas draws the new parts amber and dashed, and its flow plays through them.',
    },
    {
      clip: 'plan-compare-media',
      title: 'Compare before and after, then open the mockup',
      body: 'A compare block puts what changes side by side, here the API response. A mockup opens full size in a lightbox.',
      shows: 'On acme-saved-carts-plan, the API response before and after sits side by side; the wireframe is clicked and opens in a lightbox.',
    },
    {
      clip: 'plan-steps-files',
      title: 'Follow a step to the files it touches',
      body: 'Each step lists its files. Click one and the files table flashes its row; the row’s step link jumps back.',
      shows: 'On acme-saved-carts-plan, a step opens, one of its file chips is clicked and the files row flashes; its step link jumps back to the step.',
    },
    {
      clip: 'plan-revise',
      title: 'Read what the agent changed after a request',
      body: 'When the agent’s next revision lands, Show what changed marks it against the one you saw: its notes on the changes, the question it reworked, the step it rewrote.',
      shows: 'On acme-saved-carts-plan, rev 2 opens and Show what changed compares it with rev 1: the author’s notes up top, the sweeper step’s text marked word by word and the retention question’s recommendation moved to 90 days.',
    },
  ],
  shared: [every.pills, every.accept, every.more, every.request, every.approve, every.carry],
  agent: {
    lead: 'The agent fills in the steps and the files, then turns each choice it can’t make alone into an open question with a `recommend`. It waits for your answer before it writes code.',
    commands: [
      'python3 <skill>/scripts/build.py new plan docs/plans/saved-carts.bluedoc.json --title "Saved carts"',
      'python3 <skill>/scripts/build.py docs/plans/saved-carts.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/plans/saved-carts.bluedoc.json',
      'python3 <skill>/scripts/serve.py wait docs/plans/saved-carts.bluedoc.json --kind any',
    ],
    files: [
      {
        name: 'acme-saved-carts-plan.bluedoc.json · a step',
        lang: 'json',
        code: `{
  "id": "repo",
  "title": "Write \`SavedCartRepo\` with the 20-cart limit",
  "effort": "M",
  "status": "todo",
  "md": "Saving a 21st cart throws \`SavedCartLimit\`.",
  "files": [
    "services/orders-api/src/carts/savedCartRepo.ts",
    "services/orders-api/src/carts/savedCartRepo.test.ts"
  ],
  "refs": ["arch/api/repo"]
}`,
      },
      {
        name: 'acme-saved-carts-plan.bluedoc.json · an open question',
        lang: 'json',
        code: `{
  "id": "retention",
  "text": "How long does a saved cart stay after its last use?",
  "sub": "Recommend 180 days: covers half-yearly reorders.",
  "recommend": "d180",
  "choices": [
    { "id": "d90", "label": "90 days" },
    { "id": "d180", "label": "180 days" },
    { "id": "forever", "label": "Until deleted" }
  ]
}`,
      },
    ],
    note: '`serve.py wait` returns when you approve or request changes. Marking steps done after an approval keeps it; any other edit asks for approval again.',
  },
};

// ---- Reviews ----

const reviews: TypePageCopy = {
  type: 'reviews',
  display: 'Reviews',
  name: 'Reviews',
  metaTitle: 'Reviews: code review findings pinned to their lines · bluedoc',
  metaDescription:
    'A bluedoc review pins each finding to its lines in a diff read from git, with Fix in PR, Ticket or Decline to pick and the agent’s recommendation starred. GitHub review threads come in as findings.',
  title: 'Review findings next to the code, one decision each.',
  pitch:
    'A review page shows each finding under the lines it is about, in a diff the server reads from git. Each finding offers Fix in PR, Ticket or Decline with the agent’s pick starred; you choose, and send your answers back.',
  example: {
    id: 'acme-review-findings',
    about: '11 findings on two acme-shop pull requests, over two revisions',
    href: exampleHref('acme-review-findings.bluedoc.json'),
  },
  hero: {
    clip: 'review-merged',
    title: 'Read findings next to their code',
    body: 'The Merged view shows each commented range of the diff with its finding right under it, in code order. Show more lines widens the excerpt.',
    shows: 'On acme-review-findings, the Merged view of #412 scrolls past each finding under its lines, and Show more lines widens one excerpt.',
    url: '127.0.0.1 / acme-review-findings',
  },
  forTitle: 'For any review that ends in decisions.',
  forLead: 'Peer reviews, an agent’s own review and open PR threads all become findings with options to pick.',
  kinds: [
    { label: 'By pull request', body: 'One section per PR: its findings, then the diff of the files they are about.' },
    { label: 'By area', body: 'Your own review grouped by area or concern, diffed from the last release you reviewed.' },
    { label: 'GitHub threads', body: 'A PR’s open review threads, brought in as findings with their diff comments.' },
    { label: 'Agent review', body: 'An agent’s findings, each with the evidence it read and the fix it proposes.' },
  ],
  features: [
    {
      clip: 'review-views',
      title: 'Switch between Merged, Checklist and Diff',
      body: 'A bar under each PR’s title picks how its findings show. A pick made in one view shows in the others.',
      shows: 'On acme-review-findings, Fix in PR is picked in Merged, then shows as picked in Checklist and on the finding’s card in Diff.',
    },
    {
      clip: 'review-diff',
      title: 'Step through findings in the diff',
      body: 'The Diff view shows the change file by file, each finding a card under its lines. A file with several counts them and steps between them.',
      shows: 'On acme-review-findings, the Diff view goes file by file, and the count pill steps to the next finding below.',
    },
    {
      clip: 'review-excerpt',
      title: 'Open a finding’s code excerpt',
      body: 'In Checklist, a finding opens to its file, the lines around the comment and the card, with Open in Diff view to jump there.',
      shows: 'On acme-review-findings, a finding is expanded in Checklist to its file, lines and card; Open in Diff view jumps to it in the diff.',
    },
    {
      clip: 'review-decide',
      title: 'Decide each finding',
      body: 'Each finding has a size, from blocker to nit, and its options: Fix in PR, Ticket, Decline, or the real alternatives. The card and the checklist row stay in step.',
      shows: 'On acme-review-findings, Ticket is picked on a minor finding and the card and the row agree; the findings show sizes from blocker to nit.',
    },
    {
      clip: 'review-send',
      title: 'Send picks that differ from the recommendation',
      body: 'Accept recommended takes every starred option; change the ones you disagree with. Send answers marks each pick that differs from the agent’s.',
      shows: 'On acme-review-findings, Accept recommended is pressed and one pick changed; the Send answers preview reads → Ticket (recommended: Fix in PR).',
    },
    {
      clip: 'review-summary',
      title: 'Jump from the summary table to a finding',
      body: 'The summary lists every finding with its size and recommendation. Click one to scroll to it.',
      shows: 'On acme-review-findings, a finding is clicked in the summary table; the page scrolls to its row and flashes it.',
    },
    {
      clip: 'review-threads',
      title: 'Bring in GitHub review threads',
      body: 'ghthreads.py turns a PR’s open review threads into findings, each with the reviewer’s point, the agent’s reasoning and the reply it would post.',
      shows: 'On acme-review-findings, #415 shows its PR link and where its findings came from; a finding opens on Reviewer, My reasoning and Reply I’d post.',
    },
    {
      clip: 'review-line',
      title: 'Comment on a diff line',
      body: 'Point at any line of the diff. The comment’s key names the diff, the file and the line, so the agent knows exactly where.',
      shows: 'On acme-review-findings, the cursor points at line 17 of tiers.ts and writes a note; Request changes previews it under its key, line:diff-412/src/pricing/tiers.ts:17.',
    },
  ],
  shared: [every.accept, every.more, every.compare],
  agent: {
    lead: 'The agent writes each finding as a decision item, then `gitdiff.py` adds a `diff` block of the files they are about, one comment per finding. The doc stores only the repo and the commits; the server reads the diff from git.',
    commands: [
      'python3 <skill>/scripts/build.py new review docs/reviews/pr-412.bluedoc.json --title "Review: #412"',
      'python3 <skill>/scripts/gitdiff.py --repo . --base 89efd8e --head 62ccc86 --id diff-412 --title "acme-shop #412" --paths src/pricing/tiers.ts --comments /tmp/c412.json --into docs/reviews/pr-412.bluedoc.json --section pr-412 --after-block 0',
      'python3 <skill>/scripts/build.py docs/reviews/pr-412.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/reviews/pr-412.bluedoc.json',
    ],
    files: [
      {
        name: 'acme-review-findings.bluedoc.json · a finding',
        lang: 'json',
        code: `{
  "id": "tier-boundary",
  "text": "\`tierFor\` gives no tier at exactly 10 or 50 units",
  "sub": "Recommend fix in PR: \`>\` drops both thresholds. One character.",
  "state": "blocker",
  "stateKind": "risk",
  "choices": [
    { "id": "fix", "label": "Fix in PR" },
    { "id": "ticket", "label": "Ticket" },
    { "id": "decline", "label": "Decline" }
  ],
  "recommend": "fix"
}`,
      },
      {
        name: 'acme-review-findings.bluedoc.json · its diff',
        lang: 'json',
        code: `{
  "type": "diff",
  "id": "diff-412",
  "title": "acme-shop #412",
  "repo": "acme-shop",
  "base": "89efd8e",
  "head": "62ccc86",
  "paths": ["src/pricing/tiers.ts", "test/tiers.test.ts"],
  "comments": [
    { "at": "src/pricing/tiers.ts:17", "item": "t412/tier-boundary" }
  ]
}`,
      },
    ],
    note: '`ghthreads.py --repo acme/acme-shop --pr 415 --checklist t415` turns a PR’s open review threads into findings and diff comments the same way.',
  },
};

// ---- Designs ----

const designs: TypePageCopy = {
  type: 'designs',
  display: 'Designs',
  name: 'Designs',
  metaTitle: 'Designs: UI screens on a board you click through · bluedoc',
  metaDescription:
    'A bluedoc design is a pan-and-zoom board of HTML screens in device frames: linked screens you tap through in Present, app icon sheets with PNG export, and side-by-side revision compare.',
  title: 'App screens on a board you can tap through.',
  pitch:
    'A design is a board of UI screens in device frames, from a round watch to a browser. Screens link to each other, Present plays them as an app, and each comment names the element it is about.',
  example: {
    id: 'acme-fit-design',
    about: 'the Acme Fit activity tracker: a round watch, eight linked phone screens, an app icon and a web dashboard, over three revisions',
    href: exampleHref('acme-fit-design.bluedoc.json'),
  },
  hero: {
    clip: 'design-present',
    title: 'Tap through the app in Present',
    body: 'Present plays the screens full-window and follows the taps, with a back stack and each link’s transition.',
    shows: 'On acme-fit-design, Present opens on Today; the cursor taps Start workout, goes Back, then taps the Activity tab.',
    url: '127.0.0.1 / acme-fit-design',
  },
  forTitle: 'Screens for every device you ship on.',
  forLead: 'The agent starts the board with its targets; each screen is a small HTML file in a device frame.',
  kinds: [
    { label: 'Watch', body: 'Round and square watch faces.' },
    { label: 'Mobile', body: 'Phone screens linked into a flow, with tabs, pushes and modals.' },
    { label: 'Tablet', body: 'Tablet screens at their own size.' },
    { label: 'Desktop', body: 'App windows for desktop software.' },
    { label: 'Web', body: 'Pages and dashboards in a browser frame.' },
    { label: 'App icons', body: 'An icon sheet for iOS and Android, with PNG export.' },
  ],
  features: [
    {
      clip: 'design-board',
      title: 'Pan across a board of device frames',
      body: 'Each screen sits in its device frame, side by side on a board you pan and zoom.',
      shows: 'On acme-fit-design, the board pans and zooms from the round watch to the phones, the icon sheet and the browser dashboard.',
    },
    {
      clip: 'design-links',
      title: 'Select a screen to light its links',
      body: 'Links between screens are drawn as right-angle connectors. Select a screen to brighten its arrows in and out and count them; Flows shows every link.',
      shows: 'On acme-fit-design, the cursor selects Today; its connectors to four screens light up with the count → 4 · ← 5, then Flows shows every link.',
    },
    {
      clip: 'design-move',
      title: 'Move a screen and watch its links reroute',
      body: 'Drag a screen and it snaps to the others’ edges; its connectors reroute around the screens. The move is a draft the agent gets with your changes.',
      shows: 'On acme-fit-design, the Workout screen is dragged, snaps to an edge, and its connectors reroute at right angles.',
    },
    {
      clip: 'design-link-edit',
      title: 'Re-point a link as a draft',
      body: 'In Link mode (L), drag an arrow’s end onto another screen. The board and Present follow the draft at once.',
      shows: 'On acme-fit-design, in Link mode an arrow’s end is dragged from Profile to Settings, and Present follows the new link.',
    },
    {
      clip: 'design-tidy',
      title: 'Tidy up the board',
      body: 'Tidy up lays the screens out in layers with no overlaps and no crossings. Request changes sends the layout with the command that writes it into the doc.',
      shows: 'On acme-fit-design, Tidy up rearranges the screens in layers; Request changes then lists a layout:main item.',
    },
    {
      clip: 'design-icons',
      title: 'Inspect the app icon sheet',
      body: 'One sheet shows the icon as iOS light, dark and tinted, Android’s masks and themed icon, the store icons and four home screens.',
      shows: 'On acme-fit-design, the app icon sheet: iOS light, dark and tinted icons, Android masks, the store icon and four home screens.',
    },
    {
      clip: 'design-icon-export',
      title: 'Export the PNG icon sets',
      body: 'Export PNG sets renders every PNG size with Contents.json and the adaptive-icon XML, and saves them beside the doc.',
      shows: 'On acme-fit-design, Export PNG sets is pressed, the page reports Saved 32 files to acme-fit-design.icons/app-icon, and a card lists the folder’s files.',
    },
    {
      clip: 'design-compare',
      title: 'Compare a screen with an earlier revision',
      body: 'The Revisions tab puts a screen at two revisions side by side and marks its links New, Removed or Changed.',
      shows: 'On acme-fit-design, compare from rev C to rev D puts Today at both revisions side by side, with its links marked New, Removed or Changed.',
    },
    {
      clip: 'design-onion',
      title: 'Overlay two revisions as an onion skin',
      body: 'Or lay the newer screen over the older one and slide the opacity between them.',
      shows: 'On acme-fit-design, Onion skin lays Today at rev D over rev C and the opacity slider is dragged between them.',
    },
    {
      clip: 'design-variants',
      title: 'Line up a screen and its variants',
      body: 'A variant is another take on a screen. Variants puts a screen and its variants side by side at one zoom.',
      shows: 'On acme-fit-design, Sign in is selected and Variants puts the passkey-first variant beside it.',
    },
    {
      clip: 'design-sketch',
      title: 'Redraw every screen as a sketch',
      body: 'Sketch redraws every screen hand-drawn, with wobbly lines and a hand font. As drawn shows each at its own fidelity again.',
      shows: 'On acme-fit-design, Sketch turns every screen hand-drawn, then As drawn restores them.',
    },
    {
      clip: 'design-theme',
      title: 'Re-skin every screen with a theme pick',
      body: 'The brief lists themes as sets of tokens. Pick one and every screen re-skins at once.',
      shows: 'On acme-fit-design, the Forest theme is picked in the brief and every frame changes colour at once.',
    },
    {
      clip: 'design-kits',
      title: 'Mix kits and frameworks on one board',
      body: 'Screens use the plain kit, its wireframe boxes, HorizonUI, HeroUI or Tailwind, all built in and offline, or your project’s own CSS. One board can mix them.',
      shows: 'On acme-fit-design, the board shows plain-kit phone screens, a wireframe variant and the HorizonUI dashboard, then the brief’s framework pick.',
    },
    {
      clip: 'design-point',
      title: 'Comment on a button inside a screen',
      body: 'Point at an element in a screen. The comment’s key names the screen and the element, so the agent edits that element in that file.',
      shows: 'On acme-fit-design, the cursor points at the Start workout button on Today, writes a note, and the comment is filed as start-workout · Board › Today.',
    },
    {
      clip: 'design-frame',
      title: 'Draw a frame to ask for a new screen',
      body: 'In Frame mode (R), drag a frame onto the board and label boxes inside it. It goes to the agent as a request for a new screen.',
      shows: 'On acme-fit-design, in Frame mode a phone frame is dragged out and labelled boxes are drawn inside it.',
    },
  ],
  shared: [every.request, every.panel, every.approve],
  agent: {
    lead: 'The agent lists the artboards in the doc and writes each screen as an HTML fragment. `data-nav` on an element links it to another screen.',
    commands: [
      'python3 <skill>/scripts/build.py new design docs/design/acme-fit.bluedoc.json --title "Acme Fit" --target watch,mobile,web --icons',
      'python3 <skill>/scripts/build.py docs/design/acme-fit.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/design/acme-fit.bluedoc.json',
    ],
    files: [
      {
        name: 'acme-fit-design.bluedoc.json · the board',
        lang: 'json',
        code: `{
  "type": "board",
  "id": "main",
  "targets": ["watch", "mobile", "web"],
  "framework": "plain",
  "entry": ["login"],
  "artboards": [
    { "id": "today", "title": "Today", "device": "phone", "fidelity": "hifi" },
    { "id": "workout", "title": "Workout", "device": "phone", "fidelity": "hifi" }
  ]
}`,
      },
      {
        name: 'acme-fit-design.design/today.html · a screen',
        lang: 'html',
        code: `<main class="screen safe stack gap-4" data-bd="today">
  <h1 class="title">Today</h1>
  <button class="btn primary block" data-bd="start-workout"
          data-nav="workout" data-nav-label="Tap Start workout">Start workout</button>
  <nav class="tabbar" data-bd="tabs">
    <a class="tab" data-bd="tab-activity" data-nav="tab:activity">Activity</a>
  </nav>
</main>`,
      },
    ],
    note: 'The server wraps each fragment in its kit, so the agent never writes <head>, framework links or tokens. Each screen runs sandboxed, with no network.',
  },
};

// ---- Presentations ----

const presentations: TypePageCopy = {
  type: 'presentations',
  display: 'Presentations',
  name: 'Presentations',
  metaTitle: 'Presentations: slide decks you rehearse and approve · bluedoc',
  metaDescription:
    'A bluedoc presentation is a deck of 16:9 HTML slides in one column, with speaker notes, played full-window in Present. Comment on any element of a slide, compare revisions and approve the deck.',
  title: 'A slide deck you rehearse, mark up and approve.',
  pitch:
    'A presentation is a deck of 16:9 HTML slides, stacked in the order they play. Present plays it full-window with the speaker notes one key away, and each comment names the element on the slide it is about.',
  example: {
    id: 'acme-fit-deck',
    about: 'a five-slide Q3 launch review of the Acme Fit apps, with speaker notes',
    href: exampleHref('acme-fit-deck.bluedoc.json'),
  },
  hero: {
    clip: 'pres-present',
    title: 'Present the deck full-window',
    body: 'Present plays the slides one at a time, each as large as the window allows. ← → step through them and Esc leaves.',
    shows: 'On acme-fit-deck, Present opens on the title slide, the arrow key steps to What shipped and Weekly actives with their speaker notes under them, and Esc returns to the board.',
    url: '127.0.0.1 / acme-fit-deck',
  },
  forTitle: 'Slides from a few plain shapes.',
  forLead: 'The plain kit’s slide classes cover most decks, and the theme pick colours every slide at once.',
  kinds: [
    { label: 'Kicker and title', body: 'An eyebrow line over the slide’s one point.' },
    { label: 'Body', body: '36 px text, with accent bullets on its lists.' },
    { label: 'Columns', body: 'Equal columns, one per child: points beside a number.' },
    { label: 'Big number', body: 'One stat, as large as the slide allows.' },
    { label: 'Quote', body: 'A member’s or a customer’s words, set large.' },
  ],
  features: [
    {
      clip: 'pres-board',
      title: 'Scroll the deck in one column',
      body: 'The board stacks the slides top to bottom in deck order, the order Present plays them, beside the brief.',
      shows: 'On acme-fit-deck, the board scrolls down five 16:9 slides stacked in deck order beside the brief.',
    },
    {
      clip: 'pres-notes',
      title: 'Show the speaker notes',
      body: 'Each slide’s notes are Markdown in the doc, never on the slide. In Present, N shows them under it.',
      shows: 'On acme-fit-deck, in Present on Weekly actives, the Notes key shows the speaker notes under the slide, then hides them.',
    },
    {
      clip: 'pres-theme',
      title: 'Re-skin the deck, then sketch it',
      body: 'The brief’s theme pick re-skins every slide at once. Sketch redraws the deck hand-drawn for a rough first pass.',
      shows: 'On acme-fit-deck, the Forest theme is picked and every slide changes colour; Sketch redraws the deck hand-drawn; then As drawn and Indigo put it back.',
    },
    {
      clip: 'pres-point',
      title: 'Comment on a number on a slide',
      body: 'Point at an element on a slide. The comment’s key names the slide and the element, so the agent edits that element in that file.',
      shows: 'On acme-fit-deck, the cursor points at 41,800 on Weekly actives and writes “Round this to 42k”; the comment is saved under the key el:actives/stat.',
    },
    {
      clip: 'pres-compare',
      title: 'Compare a slide with the last revision',
      body: 'The Revisions tab puts a slide at two revisions side by side, or lays one over the other as an onion skin.',
      shows: 'On acme-fit-deck, rev B rewords Weekly actives; compare puts rev A beside rev B, then Onion skin fades from one to the other.',
    },
    {
      clip: 'pres-approve',
      title: 'Approve the presentation',
      body: 'Approve presentation records the approval and your picks on this revision. An edit to any slide asks for approval again.',
      shows: 'On acme-fit-deck, Forest is picked in the brief; Approve presentation lists it beside the recommended Indigo, and after Approve the chip reads Approved · rev A.',
    },
  ],
  shared: [every.panel, every.request],
  agent: {
    lead: 'Each slide is a `slide` artboard in the doc and a small HTML fragment in the deck’s `.design` folder. Speaker notes go in the artboard’s `notes`, never on the slide.',
    commands: [
      'python3 <skill>/scripts/build.py new presentation docs/decks/q3-review.bluedoc.json --title "Acme Fit: Q3 launch review"',
      'python3 <skill>/scripts/build.py docs/decks/q3-review.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/decks/q3-review.bluedoc.json',
      'python3 <skill>/scripts/serve.py wait docs/decks/q3-review.bluedoc.json --kind any',
    ],
    files: [
      {
        name: 'acme-fit-deck.bluedoc.json · a slide',
        lang: 'json',
        code: `{
  "id": "actives",
  "title": "Weekly actives",
  "device": "slide",
  "fidelity": "hifi",
  "notes": "This is the number to remember: **41,800** members active every week, up from 19,900 in June."
}`,
      },
      {
        name: 'acme-fit-deck.design/actives.html · the slide',
        lang: 'html',
        code: `<section class="slide center" data-bd="actives">
  <p class="slide-kicker" data-bd="kicker">Weekly active members</p>
  <p class="slide-big" data-bd="stat">41,800</p>
  <p class="slide-body muted" data-bd="context">Up from 19,900 in June, most of it from the watch app.</p>
  <footer class="slide-foot" data-n="3" data-bd="foot">Acme Fit · Q3 launch review</footer>
</section>`,
      },
    ],
    note: 'The server wraps each slide in the plain kit, so the agent never writes `<head>` or tokens. The build fails on any artboard that isn’t a slide.',
  },
};

// ---- Websites ----

const websites: TypePageCopy = {
  type: 'websites',
  display: 'Websites',
  name: 'Websites',
  metaTitle: 'Websites: review a live site on a board · bluedoc',
  metaDescription:
    'A bluedoc website shows a site’s pages on a board, live from its local dev server: comments that name the source file, versions of a section picked in place, breakpoints and snapshots per revision.',
  title: 'Your site, live on a board you can mark up.',
  pitch:
    'A website doc puts a site’s pages on a board, live from its local dev server. Comment on any element and the agent learns which source file to edit; pick between versions of a section in the real layout.',
  example: {
    id: 'acme-site',
    about: 'the Acme Fit marketing site: the home page as a mockup with hero and pricing versions, and the blog live from a dev server',
    href: exampleHref('acme-site.bluedoc.json'),
  },
  hero: {
    clip: 'web-versions',
    title: 'Pick a hero version in place',
    body: 'A section tied to a decision gets A B C keys beside it. Point at one to outline the section, pick it, and the page shows that version.',
    shows: 'On acme-site, the cursor points at the hero’s A, B and C version keys, each outlining the hero, then picks C, A and B in turn and the headline changes with each.',
    url: '127.0.0.1 / acme-site',
  },
  forTitle: 'For sites that already run, and pages that don’t yet.',
  forLead: 'One board can mix live pages from the dev server and mockups of pages still to build.',
  kinds: [
    { label: 'Live pages', body: 'Any dev server on a loopback port: Astro, Vite, Next and the rest, hot reload included.' },
    { label: 'Mockups', body: 'A page that doesn’t exist yet, as an HTML screen file.' },
    { label: 'Section picks', body: 'Two or three versions of a headline or a pricing table, shown in the real layout.' },
    { label: 'Breakpoints', body: 'Every page at desktop, tablet and mobile width.' },
  ],
  features: [
    {
      clip: 'web-live',
      title: 'Edit the site and watch the board update',
      body: 'A page with a localhost URL shows the running dev server through bluedoc’s proxy. Save a source file and hot reload updates the page on the board.',
      shows: 'On acme-site, the Acme Fit blog is live from its dev server; a post title is edited in the source and the board updates through hot reload.',
    },
    {
      clip: 'web-breakpoints',
      title: 'Switch every page between desktop, tablet and mobile',
      body: 'Desktop, Tablet and Mobile resize every page, and it reflows because it really is that wide. A page’s title-bar icons resize that page alone.',
      shows: 'On acme-site, Tablet and then Mobile are pressed and both pages reflow; then the Home page’s title-bar icon puts Home alone back at desktop width.',
    },
    {
      clip: 'web-fullpage',
      title: 'Toggle Full page and Viewport',
      body: 'Full page grows each page to its whole height, so you pan over it. Viewport shows it in a window of the device’s height that scrolls, for sticky bars and scroll effects.',
      shows: 'On acme-site, in Viewport the Blog page scrolls in a 900 px window with its nav stuck on top; then Full page shows it whole.',
    },
    {
      clip: 'web-sections',
      title: 'Jump to a section from the Pages panel',
      body: 'The Pages panel lists each page’s sections with the files they live in. Click one and the board pans to it.',
      shows: 'On acme-site, Pricing is clicked in the Pages panel, the board pans to it, and its source hints show under it.',
    },
    {
      clip: 'web-point',
      title: 'Comment on an element and get its source file',
      body: 'In Point mode, click anything on a page. The change request carries the element’s selector, its section, the source files and the width you were looking at.',
      shows: 'On acme-site, the cursor points at a post title and writes a note; the Request changes preview shows its source file and the width it was seen at.',
    },
    {
      clip: 'web-snapshot',
      title: 'Open an old revision as its snapshot',
      body: 'bluedoc keeps a static copy of each live page per revision and width. An earlier revision shows that snapshot, labelled as one, never the live site posing as old.',
      shows: 'On acme-site, rev A is opened and the page bar reads Snapshot · rev A while the page shows the site as it was.',
    },
    {
      clip: 'web-compare',
      title: 'Compare a page with an earlier revision',
      body: 'Compare puts the older revision left of the newer one at the same size; zoom and pan move both. A section whose content changed is outlined on both.',
      shows: 'On acme-site, Changes from rev A shows Rev A beside Rev B with the changed section outlined on both, then Single returns to one page.',
    },
    {
      clip: 'web-new-tab',
      title: 'Open a live page in its own tab',
      body: 'The external-link key opens a live page at its dev server’s own URL, with hot reload and devtools, to try it for real.',
      shows: 'On acme-site, the external-link key opens the live Blog page at its dev server’s own URL in a new tab, and the cursor hovers its post cards.',
    },
    {
      clip: 'web-approve',
      title: 'Approve the site with your picks',
      body: 'Approve website lists each pick beside the agent’s recommendation and records the approval on this revision. The agent waits for it, then writes the picks into the source.',
      shows: 'On acme-site, version C of the hero is picked, Approve website lists that pick, Coach first, beside the recommended Habit first, and after Approve the chip reads Approved · rev A.',
    },
  ],
  shared: [every.panel, every.more],
  agent: {
    lead: 'The agent reads the site, then adds one artboard per page with its sections, their selectors and source files. A section tied to a decision carries its `variants`.',
    commands: [
      'npm run dev',
      'python3 <skill>/scripts/build.py new website docs/site.bluedoc.json --title "Acme Fit site" --url http://localhost:4321/',
      'python3 <skill>/scripts/serve.py open docs/site.bluedoc.json',
    ],
    files: [
      {
        name: 'acme-site.bluedoc.json · a page',
        lang: 'json',
        code: `{
  "id": "home",
  "title": "Home",
  "device": "page",
  "source": "src/pages/index.astro",
  "sections": [
    {
      "id": "hero",
      "title": "Hero",
      "sel": "[data-bd=\\"hero\\"]",
      "source": ["src/content/home.ts#hero", "src/components/Hero.astro"],
      "decision": "hero-headline",
      "variants": {
        "a": [],
        "b": [{ "sel": "[data-bd=\\"headline\\"]", "text": "Build the habit, one week at a time." }]
      }
    }
  ]
}`,
      },
    ],
    note: 'A page with a localhost `url` is shown live; without one it is a mockup file. The build checks that each source file exists.',
  },
};

// ---- Other ----

const other: TypePageCopy = {
  type: 'other',
  display: 'Everything else',
  name: 'Other',
  metaTitle: 'Other: status pages, reports and inventories · bluedoc',
  metaDescription:
    'A bluedoc page for everything else: a status page, an incident report, an inventory, meeting notes or a comparison. A TL;DR, one section per question, and a hero stat the home page shows on its card.',
  title: 'Status pages and reports, with the number up top.',
  pitch:
    'Any page that isn’t a system doc, a plan, a review or a design: a status page, an incident report, an inventory. It opens with a TL;DR and one stat that sums it up; ticks, picks and comments work as on every type.',
  example: {
    id: 'acme-status',
    about: 'the Acme shop’s week 41 status: orders, uptime, one incident and next week’s tasks',
    href: exampleHref('acme-status.bluedoc.json'),
  },
  hero: {
    clip: 'other-status',
    title: 'Read a weekly status page',
    body: 'The TL;DR states the answer, then one section per question the reader brings: the numbers, the incident, next week’s tasks.',
    shows: 'On acme-status, the page scrolls from the TL;DR to the numbers table, the incident and the Week 42 tasks.',
    url: '127.0.0.1 / acme-status',
  },
  forTitle: 'One free layout, with its own label.',
  forLead: 'The agent names the kind of page; the label shows above the title and on the home card.',
  kinds: [
    { label: 'Status', body: 'The week’s numbers, what broke and what is next.' },
    { label: 'Incident report', body: 'What happened, when, the cause and the fix.' },
    { label: 'Inventory', body: 'Everything of one kind, one row each, with what to do about it.' },
    { label: 'Meeting notes', body: 'Decisions taken, open questions and the tasks that came out.' },
    { label: 'Comparison', body: 'Options side by side as cards, with a pick to make.' },
  ],
  features: [
    {
      clip: 'other-hero-stat',
      title: 'Spot the hero stat on the home card',
      body: 'One number sums the page up, with an icon and a label. The home page shows it on the doc’s card.',
      shows: 'On the bluedoc home page, the acme-status card shows 18,420 orders placed, week 41; a click opens the page, whose TL;DR leads with the same number.',
    },
    {
      clip: 'other-week',
      title: 'See what changed since last week',
      body: 'Next week’s update is a new revision of the same page. Compare the two and the title, the TL;DR and the table cells that moved are marked word by word.',
      shows: 'On acme-status, rev 2 for week 42 opens with Changes from rev 1; the title, subtitle, TL;DR, lead and the numbers table’s cells are marked word by word.',
    },
  ],
  shared: [every.sendAnswers, every.draw, every.general],
  agent: {
    lead: 'The agent fills the skeleton, including the `hero` stat: one number, an icon and a label. The `tldr` states the answer and agrees with it.',
    commands: [
      'python3 <skill>/scripts/build.py new other docs/status/week-41.bluedoc.json --title "Acme shop status, week 41" --kind Status',
      'python3 <skill>/scripts/build.py docs/status/week-41.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/status/week-41.bluedoc.json',
    ],
    files: [
      {
        name: 'acme-status.bluedoc.json · the top of the page',
        lang: 'json',
        code: `{
  "id": "acme-status",
  "title": "Acme shop status, week 41",
  "meta": { "org": "Acme Corp", "kind": "Status", "type": "other", "rev": "1" },
  "hero": {
    "icon": "box",
    "value": "18,420",
    "label": "orders placed, week 41"
  },
  "tldr": "The shop took 18,420 orders, 6% more than week 40. One decision is open: when to start the saved carts rollout."
}`,
      },
    ],
    note: '`meta.kind` is a free label: "Status", "Report", "Inventory". Without a `hero` the home card shows the section count.',
  },
};

export const typePages = { docs, plans, reviews, designs, presentations, websites, other } satisfies Record<string, TypePageCopy>;

export const typePageLabels = {
  forKicker: 'What it’s for',
  featuresKicker: 'Features',
  featuresTitle: 'Every feature, in a short clip.',
  featuresLeadPrefix: 'Each clip is recorded from',
  sharedKicker: 'Works on every doc',
  sharedTitle: 'Comments, revisions and approval, the same on every type.',
  sharedLink: 'See every shared feature',
  agentKicker: 'How the agent uses it',
  agentTitle: 'The agent writes JSON. The server draws the page.',
  otherKicker: 'Other doc types',
  otherTitle: 'Six more kinds of page.',
};

// ---- Features: the clips of what every doc type has, in groups ----

export type FeatureGroup = {
  /** the section's anchor on /features/ */
  id: string;
  kicker: string;
  title: string;
  lead: string;
  clips: ClipCopy[];
};

export const featuresPage = {
  metaTitle: 'Features on every doc type: comments, decisions, approval · bluedoc',
  metaDescription:
    'What every bluedoc page has, whatever its type: comments pinned, selected or drawn, decision pills, change requests, approval, revisions you compare word by word, and a home page for every doc. 22 short clips.',
  kicker: 'Every doc type',
  display: 'Features',
  title: 'Comment, decide and approve, on every page.',
  pitch:
    'Docs, plans, reviews, designs, decks, websites and status pages all answer the same way: you comment on any part, pick options, send your notes and approve. Each clip is recorded from one of the Acme examples.',
  hero: { ...every.pin, url: '127.0.0.1 / acme-orders' },
  groupsLabel: 'On this page',
  groups: [
    {
      id: 'commenting',
      kicker: 'Commenting',
      title: 'Comment on any part of the page.',
      lead: 'Point, select or draw. Each note is filed under the part it is about, so the agent knows what to edit. Pinning is the clip at the top of the page.',
      clips: [every.select, every.draw, every.general, every.itemComment, every.marks],
    },
    {
      id: 'deciding',
      kicker: 'Deciding',
      title: 'Pick an option, or ask for more.',
      lead: 'Open questions and findings show their options as pills, with the agent’s recommendation starred.',
      clips: [every.pills, every.accept, every.more],
    },
    {
      id: 'sending',
      kicker: 'Sending and approving',
      title: 'Send your notes, or approve.',
      lead: 'Plans, designs, presentations and websites wait for approval of the current revision. Reviews and other pages send answers instead.',
      clips: [every.request, every.sendAnswers, every.approve],
    },
    {
      id: 'revisions',
      kicker: 'Revisions',
      title: 'Every round is a revision you can compare.',
      lead: 'Each build records a revision, with the agent’s note on what changed and which of your comments it resolved.',
      clips: [every.panel, every.revisions, every.compare, every.carry],
    },
    {
      id: 'home',
      kicker: 'The home page',
      title: 'Every doc, on one dashboard.',
      lead: 'The local server lists every doc with its type, status and revision, across your projects.',
      clips: [every.homeSearch, every.homeFilters, every.homeCards, every.homeOverview],
    },
    {
      id: 'display',
      kicker: 'Themes and width',
      title: 'Light or dark, wide or narrow.',
      lead: 'Set the theme and the reading width to suit you.',
      clips: [every.theme, every.width],
    },
  ] satisfies FeatureGroup[],
  agentKicker: 'How the agent reads your notes',
  agentTitle: 'Your notes reach the agent as Markdown, keyed to the part.',
  agent: {
    lead: 'Request changes sends each note with the key of the part it is about and the note’s id. The agent edits that part with `build.py patch`, lists the id in `--resolves`, and the note turns Resolved on the next revision.',
    commands: [
      'python3 <skill>/scripts/serve.py wait docs/status/week-41.bluedoc.json --kind any',
      `python3 <skill>/scripts/build.py patch docs/status/week-41.bluedoc.json block:numbers/0 --append '["Average order value", "€41.20", "€42.10", "+2.2%"]' --change "Added average order value." --resolves cmgo7k2d1x4f`,
    ],
    files: [
      {
        name: 'the change request from acme-status',
        lang: 'md',
        code: `# Change requests: Acme shop status, week 41 (rev 1), 2026-10-12

1. **01 Numbers** (text) \`section:numbers\` (cmgo7jz4k2pa)
   > refunds held at 1.2%
   Change: Say why refunds held

2. **01 Numbers › Table › Row 4: Refund rate · 1.2%** (pin) \`row:numbers/0/3\` (cmgo7k2d1x4f)
   > Refund rate 1.2% 1.2% 0
   Change: Add average order value below this row`,
      },
    ],
    note: 'Picks, ticks and approvals reach the agent the same way, through `serve.py wait`. `build.py patch` takes each key as it is written.',
  } satisfies TypePageCopy['agent'],
};
