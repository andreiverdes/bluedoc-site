// Copy and clip lists for the eight type pages (/docs/ … /other/) and the Features page (/features/).
// src/pages/[type].astro lays out one type page; src/pages/features.astro lays out featuresPage.
// Each clip is named by its id in the showcase plan; its files are public/clips/<clip>.{mp4,webm,poster.webp}.
// A clip whose files aren't recorded yet shows as a card with its title (see Clip.astro).
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
  /** page <title> and meta description */
  metaTitle: string;
  metaDescription: string;
  title: string;
  pitch: string;
  hero: ClipCopy & { url: string };
  forTitle: string;
  forLead: string;
  kinds: { label: string; body: string }[];
  features: ClipCopy[];
  /** shared clips from the Every doc list */
  shared: ClipCopy[];
  agent: { lead: string; commands: string[]; files: CodeFile[]; note: string };
  /** films (clips/scenarios/film-*.mjs): the agent's terminal beside the page; the first opens the page in the big frame, the rest follow full width */
  films?: ClipCopy[];
};


// ---- shared clips: features every doc type has; all of them are on /features/, a few on each type page ----

export const every = {
  pin: {
    clip: 'every-pin',
    title: 'Pin a comment on any element',
    body: 'Element (C) pins a comment on a node, a row or a button. The pin stays on the element.',
    shows: 'On acme-orders, Element (C) is on, the cursor clicks the orders-api node, the change is written in the composer and saved, and the pin stays on the node while the comment waits in the Comments panel.',
  },
  select: {
    clip: 'every-select',
    title: 'Comment on a passage',
    body: 'Text (T): select a sentence and say what should change.',
    shows: 'On acme-orders, Text (T) is on, a TL;DR phrase is selected, the change is written and saved; the phrase stays marked and the comment waits in the Comments panel.',
  },
  draw: {
    clip: 'every-draw',
    title: 'Draw around a part and comment on it',
    body: 'Pen (D) draws freehand in a colour from the pill above the dock; Region (M) drags a box. Box a table or a group of rows, and the note covers each part inside.',
    shows: 'On acme-status, Pen (D) is on, the blue pen is picked in the pill above the dock, the numbers table is boxed by hand and a note is written and saved; the comment waits in the Comments panel.',
  },
  marks: {
    clip: 'every-marks',
    title: 'Hide and show comment marks',
    body: 'The eye key fades pins, marked passages and region boxes out, so you can read the page clean, and brings them back.',
    shows: 'On acme-status, the eye key fades a pin on the TL;DR, a marked phrase and a region box on the Refund rate row out, then brings them back.',
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
    body: 'Each opened answer has a one-line comment field, and each question and step a reply field. Enter or Save keeps the comment: it shows once in the conversation, not sent yet, and Request changes counts it.',
    shows: 'On acme-saved-carts-plan, a question is opened from its folded head, a comment is written in the reply field under its answers and saved; it lists in the question’s conversation, not sent yet, and Request changes counts it.',
  },
  conversation: {
    clip: 'every-conversation',
    title: 'Talk it through with the agent',
    body: 'Each question, pin and general comment is a conversation. A sent comment becomes a message tagged with its rev; the agent’s replies, signed with its model’s name, sit between yours, marked New until you see them.',
    shows: 'On acme-saved-carts-plan, the retention question shows your question at rev 1 and Claude’s reply at rev 2, marked New; a follow-up is sent with Request changes, lists as your message at rev 2, and the field empties.',
  },
  attach: {
    clip: 'every-attach',
    title: 'Attach a file to a comment',
    body: 'Every comment field has Attach: pick a file, drop one on the field or paste a screenshot. The server keeps a copy, and your comment gives the agent its full path, so it reads the file itself.',
    shows: 'On acme-saved-carts-plan, a reply is typed on the price question and a CSV is attached; its chip shows the name and size. Saved, Request changes’ send dialog lists the comment with its file chip, and the agent reads the server’s copy by its path.',
  },
  accept: {
    clip: 'every-accept',
    title: 'Accept every recommendation at once',
    body: 'Each decision list and findings section has Accept recommended in its toolbar: it picks every starred answer in one go. Change the ones you disagree with afterwards.',
    shows: 'On acme-saved-carts-plan, the Decisions list’s own Accept recommended picks every starred answer: the three folded questions each show their pick, and the list reads 3 of 3 · Answered.',
  },
  optionRows: {
    clip: 'every-option-rows',
    title: 'Pick an answer, or several',
    body: 'Each answer is a row with its label, ★ Recommended and one line; picking it opens the full explanation, and More details opens the question’s own. A question can take several answers; Other takes your own words, and Tell me more sits under the answers.',
    shows: 'On acme-saved-carts-plan, Who can save a cart? opens one answer’s explanation, then two answers are ticked and the question reads 2 picked.',
  },
  more: {
    clip: 'every-more',
    title: 'Ask the agent to tell you more',
    body: 'Tell me more, the pill under the answers, asks the agent what is missing before you pick, and moves you to the reply field to say what you need to know.',
    shows: 'On acme-saved-carts-plan, Tell me more under a question’s answers makes it read Asking for more, and the reply field asks What do you need to know?; Request changes counts 1 and Approve greys out until the agent answers.',
  },
  request: {
    clip: 'every-request',
    title: 'Send change requests to the agent',
    body: 'Request changes opens the send dialog: your comments in a timeline, a note, then Send hands them over in one go.',
    shows: 'On acme-saved-carts-plan, Request changes · 2 opens the send dialog with what the agent gets, the two comments and then the picks; Send is pressed, and the status chip reads Changes requested.',
  },
  sendAnswers: {
    clip: 'every-send-answers',
    title: 'Send ticks and picks without approval',
    body: 'Pages with no approval step, such as a status report, send your ticks, picks and step comments with Send answers. A review’s key names its next step: Apply decisions, Post review or Reply and fix.',
    shows: 'On acme-status, the rollout date is picked and a task ticked; Send answers turns green and opens the send dialog with what goes to the agent.',
  },
  approve: {
    clip: 'every-approve',
    title: 'Approve the current revision',
    body: 'Approve opens the send dialog with your picks and a note, and records the approval against this revision. The agent waits for it.',
    shows: 'On acme-saved-carts-plan, Approve opens the send dialog with the picks it approves, naming the recommendation beside the one that differs; Approve there, and the chip turns Approved · rev 1.',
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
    body: 'The Revisions panel lists each revision on one timeline with the agent’s note on what changed. View opens an earlier one read-only.',
    shows: 'On acme-review-findings, the Revisions key in the app bar opens the timeline, each revision with its note on what changed; View on rev 1 shows it read-only, with Go to current one click away in the dock.',
  },
  compare: {
    clip: 'every-compare',
    title: 'Compare two revisions word by word',
    body: 'New, changed and removed parts are marked in place, with words struck and added.',
    shows: 'On acme-review-findings, the current revision’s Changes from 3 in the Revisions panel marks what is new, changed and removed: a new paragraph in green, a removed note struck, then a finding’s lead with its words struck.',
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
    shows: 'On the bluedoc home page, in Cards, “carts” is typed in the search; the cards narrow to the two that match, the plan on top, with the words marked.',
  },
  homeFilters: {
    clip: 'every-home-filters',
    title: 'Filter by type, status and project',
    body: 'Type, Status and Project menus show their counts and narrow the docs. The sidebar finds a project and lists them All, Active, Pinned or Hidden.',
    shows: 'On the home page, the Status menu’s Awaiting approval narrows the docs to the website, the listing, the deck and the plan; then the Type menu’s Plans leaves the plan alone.',
  },
  homeCards: {
    clip: 'every-home-cards',
    title: 'Browse docs as cards or rows',
    body: 'Rows | Cards switches the view. Rows is a sortable table grouped Today, This week, This month and Older; a row opens in place with its summary and what’s left, and Cards draws each doc.',
    shows: 'On the home page, a row of the docs table opens in place with its summary, what’s left to decide and do, and Open and Archive; then Cards draws each doc as a card.',
  },
  homeStats: {
    clip: 'every-home-overview',
    title: 'Read the statistics',
    body: 'Statistics shows activity, decisions, docs by type, what waits on the agent, edits by project and the oldest open decisions, for one project or all, over 7, 14, 30 or 90 days.',
    shows: 'On the home page, Statistics in the sidebar shows Activity, Decisions with how many are decided, and Waiting on agent across the projects, and the range switches from 14 to 30 days.',
  },
  homeArchive: {
    clip: 'every-home-archive',
    title: 'Archive a doc that’s done',
    body: 'Archive it from its row or card on the home page, or from its page once everything is done. It leaves the views and counts, with Undo; the Status menu’s Archived finds it again.',
    shows: 'On the home page, acme-orders’ row opens in place and Archive takes it out of the list and every count, with Undo in the toast; then the Status menu’s Archived lists it alone, dimmed, with an Archived badge.',
  },
  theme: {
    clip: 'every-theme',
    title: 'Switch between light and dark',
    body: 'The ☀/☾ switch flips the home page and every doc. The pick carries from one page to the next.',
    shows: 'On the home page, the theme switch swaps the night city for the day one; acme-orders, opened from its row in the docs table, shows in light, and the ☀/☾ switch in its app bar flips it back to dark.',
  },
  width: {
    clip: 'every-width',
    title: 'Size the panes; the page fills the rest',
    body: 'Drag the edge between a docked pane and the page: the pane widens or narrows and the page reflows to fill the rest. A double-click resets it.',
    shows: 'On acme-orders, the Comments pane’s edge is dragged; the pane widens, the page reflows, a chip shows the width, and a double-click resets it.',
  },
  share: {
    clip: 'every-share',
    title: 'Share a read-only link',
    body: 'Share puts the doc in a secret gist on your own GitHub and copies its bluedoc.ai link. When the agent writes a new revision the key reads Update, and one press updates the same link.',
    shows: 'On acme-saved-carts-plan, the app bar’s Share opens the share sheet and Share copies the doc’s bluedoc.ai link; after the agent writes rev 2 the key reads Update 1 → 2, and Update puts rev 2 behind the same link.',
  },
  sharedPage: {
    clip: 'every-shared-page',
    title: 'Shared, view only',
    body: 'The link opens the doc read-only in any browser, with the sharer’s picks marked as theirs. Make a copy brings it into your own bluedoc.',
    shows: 'acme-review-findings opens from its bluedoc.ai link, Shared · view only with no dock, each finding acme-dev picked marked acme-dev answered; Make a copy then offers to open it in the reader’s own bluedoc.',
  },
  copyPull: {
    clip: 'every-copy-pull',
    title: 'Take the sharer’s updates',
    body: 'Your copy says when the sharer shares a newer revision. Compare shows theirs over yours, Pull merges it into a new revision, and Take theirs settles a part you both changed.',
    shows: 'A copy of acme-saved-carts-plan reads acme-dev updated this to rev 2; Compare draws their rev over the copy, Pull merges it into the copy’s rev 3 and keeps the copy’s Approach lead where both changed, and Take theirs under Review puts acme-dev’s in.',
  },
  export: {
    clip: 'every-export',
    title: 'Export to HTML, PDF or Markdown',
    body: '⋮ → Export saves the revision you’re viewing as one HTML file that works offline, a PDF, or Markdown.',
    shows: 'On acme-orders, the app bar’s ⋮ menu lists Export: HTML file, PDF and Markdown; Markdown saves acme-orders.md, made in the page from the doc as written, and the clip ends on the saved .md.',
  },
  settings: {
    clip: 'every-settings',
    title: 'One Settings page',
    body: 'The gear at the foot of the home sidebar opens Settings: the folders the home page lists, code links, the plan-mode hook’s switch and the GitHub account each project shares as. Changes save at once.',
    shows: 'On the Settings page, the folders the home page lists, then Agents, where the plan-mode hook’s switch turns plan mode off here, then Sharing, where acme-shop gets the GitHub account it shares as.',
  },
} satisfies Record<string, ClipCopy>;

// ---- films: the agent's terminal beside the page, the whole loop in one take (clips/scenarios/film-*.mjs) ----

export const films = {
  planHook: {
    clip: 'film-plan-hook',
    title: 'Approve a plan from plan mode',
    body: 'Claude Code in plan mode writes the plan; bluedoc’s plan-mode hook opens it as a page and the agent waits in the background. Your picks and notes reach it the moment you approve.',
    shows:
      'Without bluedoc, a plan scrolls by as a wall of text above Claude Code’s proceed picker. Then a fresh session in plan mode writes the saved carts plan, ExitPlanMode opens it in bluedoc and the agent waits. The reader takes the recommendations with Accept recommended in the questions’ toolbar, adds guests on the multi-answer card, pins a note on the sweeper step with Element and approves in the send dialog with the picks, the pin and a typed note; the page reads Approved · rev 1 and the terminal prints the approval as the agent starts.',
  },
  sendBack: {
    clip: 'film-send-back',
    title: 'Send a plan back instead of saying no',
    body: 'Request changes with a note. The agent patches rev 2 and resolves your note, the page marks the change word by word, and you approve that.',
    shows:
      'The saved carts plan is open beside Claude Code, its questions answered, and the agent waits. The reader pins “Run it on the existing jobs queue” on the sweeper step with Element and sends it with Request changes; the terminal prints the change request and the agent’s patch makes rev 2. The page reads Updated since you last opened it; Show what changed marks the step word by word, the Revisions panel says it resolves 1 comment, and the reader approves rev 2.',
  },
  review: {
    clip: 'film-review',
    title: 'Decide each finding on its line',
    body: 'The agent writes its review as findings under their diff lines. Fix in PR, Ticket, or Decline with a reason, then Reply and fix: the agent gets every decision and starts fixing.',
    shows:
      'Without bluedoc, eleven findings scroll by and the reader answers them by number in prose. Then Claude Code runs /bluedoc-review and opens the findings; the reader declines one, keeps one as Fix in PR, makes one a ticket, takes the rest with Accept recommended in #412’s findings toolbar and sends with Reply and fix, the decline’s reason as the dialog’s note; the terminal prints every decision and the agent starts on the fix.',
  },
  questions: {
    clip: 'film-questions',
    title: 'Answer the agent’s questions on one page',
    body: 'The questions the agent can’t settle alone become answer cards, its recommendation starred, with Other for an answer of your own. Send answers, and they reach it in one reply.',
    shows:
      'Without bluedoc, a long answer overflows Claude Code’s one-line question box. Then the agent puts its four rollout questions on one page; the reader picks the starred answers, writes a longer answer of their own under Other and sends from the Send answers dialog; the terminal prints the answers in one reply.',
  },
  design: {
    clip: 'film-design',
    title: 'Pin a change on a screen, see it revised',
    body: 'Pin a comment with Element on a mockup and say what should change. The agent revises that screen, and the board onion-skins the new revision over the old one.',
    shows:
      'Claude Code builds the Acme Fit board and opens it, then waits. The reader picks Today in the Screens pane, pins a comment with Element on Profile in its tab bar, asks to drop it, and sends it from the Request changes dialog; the terminal prints the request naming that element, the agent patches the screen to rev D, and the board onion-skins rev D over rev C.',
  },
} satisfies Record<string, ClipCopy>;

// ---- Docs ----

const docs: TypePageCopy = {
  type: 'docs',
  metaTitle: 'Docs: architecture pages, runbooks and walkthroughs · bluedoc',
  metaDescription:
    'A bluedoc docs page explains a system that exists: a zoomable blueprint canvas nested 3 levels deep, animated data flows, and runbook checklists whose ticks the local server keeps.',
  title: 'A system on one page, with a drawing you can open.',
  pitch:
    'A docs page explains a system that exists. The system is a blueprint canvas you zoom into, flows play across it step by step, and procedures are checklists whose ticks the local server keeps.',
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
      body: 'Each level has its own flows. Pick one from the Flow menu in the canvas’s toolbar, pause it, and step with ‹ › one hop at a time.',
      shows: 'On acme-orders, the Flow menu switches to the Local stack path, pause stops it, and the step keys walk it one hop at a time while the caption follows.',
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
      title: 'Copy a checklist’s progress as Markdown',
      body: 'Copy in a checklist’s toolbar (Expand · Copy · Reset) puts that checklist and its ticks on the clipboard as Markdown, for a PR or an issue.',
      shows: 'On acme-orders, Copy in the Local stack checklist’s toolbar copies its progress, and a card shows the copied Markdown with its ticked items.',
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
  metaTitle: 'Plans: approve or send back before the agent writes code · bluedoc',
  metaDescription:
    'A bluedoc plan puts the goal, the proposed design, the steps, the files, the risks and the checks on one page, with open questions to answer. The agent waits for your approval before it writes code.',
  title: 'A plan you approve before any code is written.',
  pitch:
    'The agent writes its plan as a page: the goal, the proposed design on a canvas, the steps and the files each one touches, then the open questions with its recommendation starred. Approve it, or send it back with your notes.',
  hero: {
    clip: 'plan-status',
    title: 'Watch the status chip follow the review',
    body: 'The chip at the top reads Awaiting approval, then Changes requested once you send notes, then Approved once you approve the agent’s next revision.',
    shows: 'On acme-saved-carts-plan, Request changes goes out from the send dialog and the status chip turns from Awaiting approval to Changes requested; the agent’s rev 2 loads, Approve is pressed in the send dialog and the chip reads Approved · rev 2.',
    url: '127.0.0.1 / acme-saved-carts-plan',
  },
  forTitle: 'Every plan has the same eight parts.',
  forLead: 'The agent starts from a skeleton and fills each part from the code it read, so plans read the same from one task to the next.',
  kinds: [
    { label: 'Goal', body: 'What ships, for whom, in how many steps, and how many questions need a pick.' },
    { label: 'Context', body: 'The current state and why it has to change, with file and line anchors.' },
    { label: 'Approach', body: 'The proposal on a canvas, new parts marked proposed; before/after panes and mockups.' },
    { label: 'Steps', body: 'One reviewable change each, in order, with its effort and the files it touches.' },
    { label: 'Files', body: 'Every path the plan adds, edits, deletes or moves, as a folder tree with each file’s reason and step.' },
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
      body: 'Each step lists its files. Click one and its row flashes in the files tree, an editor-style folder tree with A, M, D or R and a Step chip per file; click the row for its reason, and its Step chip jumps back.',
      shows: 'On acme-saved-carts-plan, step 3’s openapi.yaml chip scrolls to that row of the files tree and flashes it; a click on the row shows its reason, the src/ folder folds away, and the row’s Step 3 chip jumps back to the step.',
    },
    {
      clip: 'plan-revise',
      title: 'Read what the agent changed after a request',
      body: 'When the agent’s next revision lands, Show what changed marks it against the one you saw: its notes on the changes, the question it reworked, the step it rewrote.',
      shows: 'On acme-saved-carts-plan, rev 2 opens with Updated since you last opened it, and Show what changed opens the compare view against rev 1: the author’s notes up top, the sweeper step’s text marked word by word and the retention question’s recommendation moved to 90 days.',
    },
    {
      clip: 'plan-details',
      title: 'Approve once your questions are answered',
      body: 'While a question asks for more with Tell me more, Approve waits and says why. Send the question with Request changes; when the agent’s next revision answers it, approve.',
      shows: 'On acme-saved-carts-plan, Tell me more on the price question greys Approve; Request changes opens the send dialog carrying the question, rev 2 has the agent’s answer in the card’s conversation, the reader picks Today’s price + notice, and Approve makes it Approved · rev 2.',
    },
    {
      clip: 'plan-evidence',
      title: 'Spot a check the code has moved past',
      body: 'Proof the agent records for a step or a check is pinned to the commit it ran on. When a later commit touches the code it covers, the check reads Needs recheck and stops counting as done.',
      shows: 'On acme-saved-carts-plan, Run the orders-api tests is ticked, its test result pinned to a commit with a green chip; after a commit to savedCartRepo.ts the check reads Needs recheck, the Contents pane’s Tracker drops to 0 of 6 · 1 to recheck, and Stale lists the file that changed.',
    },
  ],
  shared: [every.optionRows, every.accept, every.more, every.request, every.approve, every.carry],
  films: [films.planHook, films.sendBack],
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
  metaTitle: 'Reviews: code review findings pinned to their lines · bluedoc',
  metaDescription:
    'A bluedoc review pins each finding to its lines in a diff read from git, with Fix in PR, Ticket or Decline to pick and the agent’s recommendation starred. GitHub review threads come in as findings.',
  title: 'Review findings next to the code, one decision each.',
  pitch:
    'A review page shows each finding under the lines it is about, in a diff the server reads from git. Each finding offers Fix in PR, Ticket or Decline with the agent’s pick starred; you choose, and send your answers back.',
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
      body: 'The toolbar under each PR’s title picks Checklist, Diff or Merged, and filters All, Open or Done. A pick made in one view shows in the others.',
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
      body: 'In Checklist, a finding’s More details opens its detail, then its file and the lines around the comment, with Open in Diff view to jump there.',
      shows: 'On acme-review-findings, More details on the bulkSavingsCents finding shows its detail and code, the lines around the comment; Open in Diff view jumps to it in the diff.',
    },
    {
      clip: 'review-decide',
      title: 'Decide each finding',
      body: 'Each finding has a size, from blocker to nit, and its options: Fix in PR, Ticket, Decline, or the real alternatives. Its head shows your pick, and the toolbar counts what’s done.',
      shows: 'On acme-review-findings, Ticket is picked on the minor tier-tests finding: the finding’s head reads ✓ Ticket and the toolbar’s Done count goes up.',
    },
    {
      clip: 'review-send',
      title: 'Send picks that differ from the recommendation',
      body: 'Accept recommended in the findings toolbar takes every starred answer; change the ones you disagree with. Reply and fix’s dialog marks each pick that differs from the agent’s.',
      shows: 'On acme-review-findings, #412’s toolbar Accept recommended picks its 7 starred answers (#415’s 4 were accepted before), and the tier tests are changed to Ticket; Reply and fix opens the send dialog listing all 11 picks, with Recommended: Fix in PR under the changed one.',
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
      shows: 'A terminal runs ghthreads.py for #415’s open threads; on acme-review-findings, #415’s PR link sits in the Contents pane under Related, and a finding’s More details opens on Reviewer, My reasoning and Reply I’d post.',
    },
    {
      clip: 'review-line',
      title: 'Comment on a diff line',
      body: 'Pin a comment with Element on any line of the diff. The comment names the diff, the file and the line, so the agent knows exactly where.',
      shows: 'On acme-review-findings, Element (C) picks line 17 of tiers.ts in #412’s diff, the change is written and saved; Request changes lists it in its send dialog under On acme-shop #412 › tiers.ts:17.',
    },
  ],
  shared: [every.accept, every.more, every.compare],
  films: [films.review],
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
  metaTitle: 'Designs: UI screens on a board you click through · bluedoc',
  metaDescription:
    'A bluedoc design is a pan-and-zoom board of HTML screens in device frames: linked screens you tap through in Present, app icon sheets with PNG export, and side-by-side revision compare.',
  title: 'App screens on a board you can tap through.',
  pitch:
    'A design is a board of UI screens in device frames, from a round watch to a browser. Screens link to each other, Present plays them as an app, and each comment names the element it is about.',
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
      clip: 'design-media',
      title: 'Play video in a screen',
      body: 'A screen can hold a video or audio file kept beside the doc. It plays in its frame on the board, and full-window in Present.',
      shows: 'On acme-fit-design, the browser Dashboard has a card playing a recording of the Q3 launch review; it plays on the board, then Present opens the screen full-window and the video keeps playing.',
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
      body: 'In Link mode (L), drag an arrow’s end onto another screen. Present follows the draft at once.',
      shows: 'On acme-fit-design, in Link mode (L) the end of Today’s Profile-tab arrow is dragged onto Settings and turns into a draft; in Present, Today’s Profile tab now opens Settings.',
    },
    {
      clip: 'design-tidy',
      title: 'Tidy up the board',
      body: 'Tidy up lays the screens out in layers with no overlaps and no crossings. Request changes sends the new layout to the agent as one draft.',
      shows: 'On acme-fit-design, Tidy up rearranges the phone screens in layers; Request changes opens the send dialog listing the layout draft, Move 7 screens.',
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
      body: 'Changes from an earlier revision marks a changed screen and its links New, Changed or Removed; the screen’s Compare key puts the two revisions side by side.',
      shows: 'On acme-fit-design, Changes from rev C marks Today changed and its links New, Changed and Removed in the Revisions panel; Today’s labelled Compare key opens rev C and rev D side by side, and Esc leaves.',
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
      body: 'The Brief, in the board’s left pane, lists themes as sets of tokens on an answer card, with Other and Tell me more. Pick one and every screen re-skins at once.',
      shows: 'On acme-fit-design, Forest is picked on the theme’s answer card in the left pane’s Brief and every frame turns green at once; Indigo, the recommendation, turns them back.',
    },
    {
      clip: 'design-kits',
      title: 'Mix kits and frameworks on one board',
      body: 'Screens use the plain kit, its wireframe boxes, HorizonUI, HeroUI or Tailwind, all built in and offline, or your project’s own CSS. One board can mix them.',
      shows: 'On acme-fit-design, beside the framework pick’s answer card in the left pane’s Brief, the board moves in on the passkey-first variant in the wireframe kit next to the plain-kit hi-fi screens, then over to the HorizonUI web dashboard.',
    },
    {
      clip: 'design-point',
      title: 'Comment on a button inside a screen',
      body: 'Element (C) picks an element in a screen. The comment’s key names the screen and the element, so the agent edits that element in that file.',
      shows: 'On acme-fit-design, the dock’s Element tool picks the Start workout button on Today and a note is written; the comment is saved as el:today/start-workout and listed in the Comments panel under Board › Today.',
    },
    {
      clip: 'design-frame',
      title: 'Draw a frame to ask for a new screen',
      body: 'In Frame mode (R), click the board to place a frame and drag labelled boxes inside it. It goes to the agent as a request for a new screen.',
      shows: 'On acme-fit-design, in Frame mode a click beside Settings places a phone frame, its editor asks what the screen should show, and drags inside it add labelled boxes.',
    },
  ],
  shared: [every.request, every.panel, every.approve],
  films: [films.design],
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
  metaTitle: 'Presentations: slide decks you rehearse and mark up · bluedoc',
  metaDescription:
    'A bluedoc presentation is a deck of 16:9 HTML slides in one column, with speaker notes, played full-window in Present. Comment on any element of a slide, compare revisions and send your notes back.',
  title: 'A slide deck you rehearse, mark up and present.',
  pitch:
    'A presentation is a deck of 16:9 HTML slides, stacked in the order they play. Present plays it full-window with the speaker notes one key away, and each comment names the element on the slide it is about.',
  hero: {
    clip: 'pres-present',
    title: 'Present the deck full-window',
    body: 'Present, the dock’s green key, plays the slides one at a time, each as large as the window allows. ← → step through them and Esc leaves.',
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
      shows: 'On acme-fit-deck, Forest in the toolbar’s Theme menu picks it in the brief and every slide turns green; Sketch redraws the deck hand-drawn; then As drawn and Indigo put it back.',
    },
    {
      clip: 'pres-point',
      title: 'Comment on a number on a slide',
      body: 'Element (C) picks an element on a slide. The comment’s key names the slide and the element, so the agent edits that element in that file.',
      shows: 'On acme-fit-deck, Element picks 41,800 on Weekly actives and “Round this to 42k” is written; the comment is saved under the key el:actives/stat.',
    },
    {
      clip: 'pres-compare',
      title: 'Compare a slide with the last revision',
      body: 'Compare puts a slide at two revisions side by side, or lays one over the other as an onion skin.',
      shows: 'On acme-fit-deck, rev B rewords Weekly actives; compare puts rev A beside rev B, then Onion skin fades from one to the other.',
    },
    {
      clip: 'pres-approve',
      title: 'Send the deck back with your picks',
      body: 'A deck isn’t approved: its dock ends in Request changes and Present. Your picks and comments go to the agent with Request changes.',
      shows: 'On acme-fit-deck, Forest is picked in the toolbar’s Theme menu: the Brief’s card reads ✓ Forest and the slides turn green; Request changes lists the pick, Which theme? Forest · Changed from Indigo, and Send reads Change request sent to the agent.',
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
  metaTitle: 'Websites: review a live site on a board · bluedoc',
  metaDescription:
    'A bluedoc website shows a site’s pages on a board, live from its local dev server: comments that name the source file, versions of a section picked in place, breakpoints and snapshots per revision.',
  title: 'Your site, live on a board you can mark up.',
  pitch:
    'A website doc puts a site’s pages on a board, live from its local dev server. Comment on any element and the agent learns which source file to edit; pick between versions of a section in the real layout.',
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
      body: 'A page’s title-bar icons resize that page alone; Desktop, Tablet and Mobile in the toolbar resize every page. Each reflows because it really is that wide.',
      shows: 'On acme-site, Home’s title-bar icon sets Home alone to Mobile and it reflows; then the toolbar’s Tablet and Desktop resize every page.',
    },
    {
      clip: 'web-fullpage',
      title: 'Toggle Full page and Viewport',
      body: 'Full page grows each page to its whole height, so you pan over it. Viewport shows it in a window of the device’s height; Present lets the wheel scroll it there, for sticky bars and scroll effects.',
      shows: 'On acme-site, Full page shows the whole Blog; Viewport puts it in a 900 px window, and in Present the wheel scrolls the page with its nav staying on top; out of Present, Full page again.',
    },
    {
      clip: 'web-sections',
      title: 'Jump to a section from the Pages pane',
      body: 'The left pane’s Pages tab lists each page’s sections with the files they live in. Click one and the board goes to it.',
      shows: 'On acme-site, Pricing is clicked in the Pages pane and the board goes to that section of the live Home page.',
    },
    {
      clip: 'web-point',
      title: 'Comment on an element of a live page',
      body: 'With Element (C), click anything on a page. The comment names its page section and element, so the agent knows what to edit.',
      shows: 'On acme-site, Element picks a post title on the live Blog and “Fit it on one line” is written; Request changes’ send dialog lists it as On Post list › h2, with the hero question as No pick.',
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
      body: 'Approve opens the send dialog with each pick against the agent’s recommendation, and records the approval on this revision. The agent waits for it, then writes the picks into the source.',
      shows: 'On acme-site, version C of the hero is picked; Approve’s send dialog lists that pick against the recommendation, and after Approve the key reads Approved.',
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

// ---- Store listings ----

const storeListings: TypePageCopy = {
  type: 'store-listings',
  metaTitle: 'Store listings: Google Play and App Store pages you check and approve · bluedoc',
  metaDescription:
    'A bluedoc store listing lays out an app’s Google Play and App Store pages: every device’s screenshots at their store sizes, the store text per locale with live counters, styles and colours, store checks, variants and ads, then a fastlane ZIP.',
  title: 'Both store pages, checked before you upload.',
  pitch:
    'A store listing lays out an app’s Google Play and App Store pages: the screenshots for every device, the icon and feature graphic, the store text in each locale. You check it against the stores’ rules, edit the text in place, send your drafts back, and get the fastlane folders to upload.',
  hero: {
    clip: 'listing-platforms',
    title: 'Switch between Google Play and the App Store',
    body: 'Each store has its own page: a Shared section, then a section per device row, each set with its count against the store’s maximum.',
    shows: 'On acme-fit-listing, Google Play’s page shows its Shared assets and its Wear OS, phone and tablet sets at 8 shots each; the App Store switch shows the Apple Watch, iPhone and iPad sets at 10, and Google Play switches back.',
    url: '127.0.0.1 / acme-fit-listing',
  },
  forTitle: 'Everything the two stores ask for, on one page.',
  forLead: 'One HTML file per shot renders at every set’s size, so a change lands in each set at once. Sizes and limits come from a dated rules file, never from the agent.',
  kinds: [
    { label: 'Screenshots', body: 'Watch, phone and tablet sets at each store’s sizes; TV, desktop, XR and car as optional rows.' },
    { label: 'Store text', body: 'The name, descriptions, keywords and release notes per locale, each with its limit.' },
    { label: 'Locales', body: 'Text, captions and captures per locale, with machine translations badged MT.' },
    { label: 'Variants', body: 'App Store custom pages and A/B tests, Play custom listings and experiments.' },
    { label: 'Ads', body: 'Google App campaign text and images, Apple Ads variations and the search asset.' },
  ],
  features: [
    {
      clip: 'listing-locales',
      title: 'Switch locales, with machine translations flagged',
      body: 'The locale menu switches the text, captions and captures, and counts each locale’s machine-translated strings. An MT string keeps its badge until you accept it.',
      shows: 'On acme-fit-listing, the locale menu lists en-US and es-ES · 15 MT; es-ES is picked, the phone captions turn Spanish, and the Short description shows its MT badge.',
    },
    {
      clip: 'listing-views',
      title: 'See the store preview and the ads',
      body: 'Sections shows every set by device. Store preview draws the product page and a search result at phone width, as a mock; Ads holds the campaign text and images.',
      shows: 'On acme-fit-listing, Store preview shows the Google Play product page and a search result; Ads shows the Google App campaign’s headlines, descriptions and images; Sections returns to the sets.',
    },
    {
      clip: 'listing-text',
      title: 'Edit the store text, then save it as a draft',
      body: 'Each store text and caption is a field with its counter, red past the store’s limit. Save turns the changed fields into drafts the agent writes into the doc.',
      shows: 'On acme-fit-listing, the end of the Short description is retyped while its counter follows against 80; Save tags the field Draft.',
    },
    {
      clip: 'listing-typography',
      title: 'Set the caption font',
      body: 'The Typography panel at the top of Text sets the captions’ font, weight, size, spacing and alignment, from the fonts installed on your machine.',
      shows: 'On acme-fit-listing, the caption weight goes from ExtraBold to Medium and the size to 120%; the phone captions re-render with each pick.',
    },
    {
      clip: 'listing-style',
      title: 'Pick a caption style and a layout',
      body: 'The Style tab offers five message styles (M1–M5) and five layouts (L1–L5) per platform, each with its evidence. A pick re-renders every shot live.',
      shows: 'On acme-fit-listing, L4 Dark hero is picked in the Style tab and every phone shot re-renders in it.',
    },
    {
      clip: 'listing-colors',
      title: 'Take the colours from an image',
      body: 'Drop an image on the Colors tab and its colours become the palette. Each text pair shows its contrast ratio against 4.5:1.',
      shows: 'On acme-fit-listing, a brand image is chosen on the Colors tab; its swatches fill the palette, the shots recolour, and the contrast pairs show their ratios.',
    },
    {
      clip: 'listing-checks',
      title: 'Check the listing against the stores’ rules',
      body: 'The build checks text limits, set counts, sizes, alpha, locales and mock-up UI against a dated rules file. The Checks tab lists each finding and shows the shot it is about.',
      shows: 'On acme-fit-listing, the toolbar’s Checks count opens the Listing pane’s Checks tab; the mock-up UI warning’s link scrolls the page to the Wear OS set.',
    },
    {
      clip: 'listing-variants',
      title: 'Compare a custom product page with the default',
      body: 'A tab per custom page or A/B test lists what it changes against the default page. Compare to default puts each set’s default shots beside the variant’s.',
      shows: 'On acme-fit-listing’s App Store page, the CPP: Runners tab lists its changes, then Compare to default shows each iPhone set’s default page beside the Runners page, which starts with Run route.',
    },
    {
      clip: 'listing-upload',
      title: 'Drop a real screenshot into a set',
      body: 'A set with room ends in a Drop PNG slot with its size. The page and the server check the PNG’s size and alpha; it stays a draft until the agent records it.',
      shows: 'On acme-fit-listing, a 1080×1920 PNG is chosen for the last slot of Play’s phone set and appears there as a draft.',
    },
    {
      clip: 'listing-export',
      title: 'Export the fastlane ZIP',
      body: 'Export to… writes the fastlane ZIP, the same files in plain folders, a PDF or an HTML file. The key counts the files as it renders each PNG at its store size.',
      shows: 'On acme-fit-listing, Export to… ZIP (fastlane) for Google Play in en-US counts 67 files on the key, then saves the ZIP: fastlane’s Android text and screenshot folders, the ad files, the Lifestyle variant and manifest.json.',
    },
    {
      clip: 'listing-undo',
      title: 'Undo and redo any draft',
      body: 'Every draft is a step of one undo history that a reload keeps: a Save of text, a style pick, a colour, an upload. Undo and Redo name the step.',
      shows: 'On acme-fit-listing, Undo names the L4 Dark hero pick and takes it back, then Redo puts it back.',
    },
    {
      clip: 'listing-approve',
      title: 'Send your drafts with Request changes',
      body: 'A listing isn’t approved: its drafts go to the agent with Request changes, whose dialog lists each one beside your note.',
      shows: 'On acme-fit-listing, two drafts wait (the L4 Dark hero style and a Short description edit); the dock’s Request changes shows 2, its dialog lists both, the note “Ship the dark hero on Play.” goes with them, and Send reads Change request sent to the agent.',
    },
  ],
  shared: [every.pin, every.panel],
  agent: {
    lead: 'The agent writes one shot file per screenshot, the store text per platform and locale, and the captions as strings. It never types a size or limit: those live in `assets/store-rules.json`.',
    commands: [
      'python3 <skill>/scripts/build.py new storelisting docs/store/acme-fit.bluedoc.json --title "Acme Fit: store listing"',
      'python3 <skill>/scripts/capture.py docs/store/acme-fit.bluedoc.json --dry-run',
      'python3 <skill>/scripts/build.py docs/store/acme-fit.bluedoc.json',
      'python3 <skill>/scripts/serve.py open docs/store/acme-fit.bluedoc.json',
      'python3 <skill>/scripts/build.py docs/store/acme-fit.bluedoc.json --listing acme-fit.zip',
    ],
    files: [
      {
        name: 'acme-fit-listing.bluedoc.json · a shot',
        lang: 'json',
        code: `{
  "id": "today",
  "title": "Today",
  "device": "shot",
  "fidelity": "hifi",
  "sets": ["play/phone", "play/tablet7", "play/tablet10", "appstore/iphone-69", "appstore/iphone", "appstore/ipad"],
  "recipe": { "targets": ["web"], "route": "today", "locales": ["en-US"] }
}`,
      },
      {
        name: 'acme-fit-listing.design/today.html · the shot',
        lang: 'html',
        code: `<main class="shot" data-bd="today">
  <h1 class="shot-cap" data-bd="cap" data-l10n="today.title">See your week at a glance</h1>
  <div class="shot-frame" data-bd="frame">
    <div class="shot-ui" data-bd="ui">
      <main class="screen safe stack gap-4" data-bd="screen">…</main>
    </div>
  </div>
</main>`,
      },
    ],
    note: 'The page renders the one file at every set’s frame. The caption is the string `today.title` in `listing.strings`, so each locale swaps it; the agent never uploads to a store.',
  },
};

// ---- Other ----

const other: TypePageCopy = {
  type: 'other',
  metaTitle: 'Other: status pages, reports and inventories · bluedoc',
  metaDescription:
    'A bluedoc page for everything else: a status page, an incident report, an inventory, meeting notes or a comparison. A TL;DR, one section per question, charts drawn in the page, and a hero stat the home page shows on its card.',
  title: 'Status pages and reports, with the number up top.',
  pitch:
    'Any page that isn’t a system doc, a plan, a review or a design: a status page, an incident report, an inventory. It opens with a TL;DR and one stat that sums it up; chart blocks draw the numbers in the page, and ticks, picks and comments work as on every type.',
  hero: {
    clip: 'other-status',
    title: 'Read a weekly status page',
    body: 'The TL;DR states the answer, then one section per question the reader brings: the numbers with a chart, the incident, next week’s decision.',
    shows: 'On acme-status, the page scrolls from the TL;DR through the numbers, where a row lights up, the orders-per-day chart with Thursday’s dip on hover, and the incident, to the open decision with its recommendation.',
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
      shows: 'On the bluedoc home page, in Cards, the acme-status card shows 18,420 orders placed, week 41; a click opens the page, whose TL;DR leads with the same number, then the numbers table and the orders-per-day chart.',
    },
    {
      clip: 'other-chart',
      title: 'Charts drawn in the page',
      body: 'A chart block holds the numbers and the page draws them, in light and dark. Hover for the values; a legend chip hides a series.',
      shows: 'On acme-status, hovering a day of Orders per day shows both weeks’ values, a legend chip hides Week 40 and brings it back, and the ☀/☾ switch redraws the chart in the light theme.',
    },
    {
      clip: 'other-week',
      title: 'See what changed since last week',
      body: 'Next week’s update is a new revision of the same page. Compare the two and the title, the TL;DR and the table cells that moved are marked word by word.',
      shows: 'On acme-status, rev 3 for week 42 opens; in the Revisions panel, Changes from 2 marks the title, dates and TL;DR word by word, then the numbers table cell by cell.',
    },
  ],
  shared: [every.sendAnswers, every.draw, every.general],
  films: [films.questions],
  agent: {
    lead: 'The agent fills the skeleton, including the `hero` stat: one number, an icon and a label. The `tldr` states the answer and agrees with it. Numbers go in a `chart` block, never an image: stat cards, lines and areas, bars, ranked bars, a donut or progress rows, drawn in the page in both themes.',
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
      {
        name: 'acme-status.bluedoc.json · a chart',
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
  ]
}`,
      },
    ],
    note: '`meta.kind` is a free label: "Status", "Report", "Inventory". Without a `hero` the home card shows the section count.',
  },
};

export const typePages = { docs, plans, reviews, designs, presentations, websites, 'store-listings': storeListings, other } satisfies Record<string, TypePageCopy>;

export const typePageLabels = {
  forKicker: 'What it’s for',
  featuresKicker: 'Features',
  featuresTitle: 'What you can do on the page.',
  sharedKicker: 'Works on every doc',
  sharedTitle: 'Comments, revisions and approval, the same on every type.',
  sharedLink: 'See every shared feature',
  agentKicker: 'How the agent uses it',
  agentTitle: 'The agent writes JSON. The server draws the page.',
  otherKicker: 'Other doc types',
  otherTitle: 'Seven more kinds of page.',
};

// ---- Features: the clips of what every doc type has, in groups ----

type FeatureGroup = {
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
    'What every bluedoc page has, whatever its type: comments pinned, boxed, selected or drawn, conversations with the agent, answer cards, one send dialog, approval, revisions you compare word by word, Export and Share, and a home page for every doc.',
  kicker: 'Every doc type',
  display: 'Features',
  title: 'Comment, decide and approve, on every page.',
  pitch:
    'Docs, plans, reviews, designs, decks, websites, store listings and status pages all answer the same way: you comment on any part, pick answers, send your notes and approve. Then export the doc, or share a view-only link.',
  hero: { ...every.pin, url: '127.0.0.1 / acme-orders' },
  groupsLabel: 'On this page',
  groups: [
    {
      id: 'commenting',
      kicker: 'Commenting',
      title: 'Comment on any part of the page.',
      lead: 'Element, Region, Text and Pen sit in the dock at the foot of every page. Each comment is filed under the part it is about, so the agent knows what to edit. Pinning is the clip at the top of the page.',
      clips: [every.select, every.draw, every.general, every.itemComment, every.conversation, every.attach, every.marks],
    },
    {
      id: 'deciding',
      kicker: 'Deciding',
      title: 'Pick an answer, or ask for more.',
      lead: 'Open questions and findings share one answer card: More details, the answers with the agent’s recommendation starred, Other, and Tell me more.',
      clips: [every.optionRows, every.accept, every.more],
    },
    {
      id: 'sending',
      kicker: 'Sending and approving',
      title: 'Send your notes, or approve.',
      lead: 'Plans, designs and websites wait for approval of the current revision. Approve, Request changes and Send answers share one send dialog; a review’s key names its next step.',
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
      id: 'sharing',
      kicker: 'Sharing and export',
      title: 'Send the doc to someone.',
      lead: 'Share puts the current revision in a secret gist on your own GitHub, behind a bluedoc.ai link that opens view-only in any browser. Export saves it as one HTML file, a PDF or Markdown.',
      clips: [every.share, every.sharedPage, every.copyPull, every.export],
    },
    {
      id: 'home',
      kicker: 'The home page',
      title: 'Every doc, on one home page.',
      lead: 'The local server lists every doc with its type, status and revision, across your projects: pin them, hide them, give them a name and an icon. Its gear opens Settings.',
      clips: [every.homeSearch, every.homeFilters, every.homeCards, every.homeStats, every.homeArchive, every.settings],
    },
    {
      id: 'display',
      kicker: 'Theme and panes',
      title: 'Light or dark, panes to suit.',
      lead: 'Set the theme, and size the panes beside the page. Every page also fits a phone, down to 320 px wide.',
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
