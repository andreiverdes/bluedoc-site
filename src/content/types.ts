// Copy and clip lists for the type pages (/docs/, /designs/, /websites/). TypePage.astro lays one entry out.
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

export type CodeFile = { name: string; lang: 'json' | 'html'; code: string };

export type TypePageCopy = {
  /** the doc type's id in docTypes (site.ts) */
  type: string;
  name: string;
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

// ---- shared clips: features every doc type has ----

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
  compare: {
    clip: 'every-compare',
    title: 'Compare two revisions word by word',
    body: 'New, changed and removed parts are marked in place, with words struck and added.',
    shows: 'On acme-review-findings, Changes from rev 1 marks new, changed and removed parts, with words struck and added.',
  },
  request: {
    clip: 'every-request',
    title: 'Send change requests to the agent',
    body: 'Request changes previews your notes as Markdown, then sends them in one go.',
    shows: 'On acme-saved-carts-plan, Request changes opens the Markdown preview, Send is pressed, and the status chip reads Changes requested.',
  },
  panel: {
    clip: 'every-panel',
    title: 'Follow a comment to Resolved',
    body: 'Notes go from Pending to Open when sent, and to Resolved when the agent’s revision says it dealt with them.',
    shows: 'On acme-status, Request changes turns two notes Open; at rev 2 one of them reads Resolved by the agent.',
  },
  approve: {
    clip: 'every-approve',
    title: 'Approve the current revision',
    body: 'Approve lists your picks and records the approval against this revision. The agent waits for it.',
    shows: 'On acme-saved-carts-plan, Approve plan lists the picks, Approve is pressed, and the chip turns Approved · rev 1.',
  },
  more: {
    clip: 'every-more',
    title: 'Ask for more details',
    body: 'Need more details marks a question and asks the agent what is missing before you pick.',
    shows: 'On acme-saved-carts-plan, Need more details turns a decision’s dot amber and asks what is missing; Approve greys out.',
  },
} satisfies Record<string, ClipCopy>;

// ---- Docs ----

const docs: TypePageCopy = {
  type: 'docs',
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

// ---- Designs ----

const designs: TypePageCopy = {
  type: 'designs',
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
      shows: 'On acme-fit-design, the cursor points at Start workout on Today and the comment’s key reads el:today/start-workout.',
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

// ---- Websites ----

const websites: TypePageCopy = {
  type: 'websites',
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

export const typePages = { docs, designs, websites } satisfies Record<string, TypePageCopy>;

export const typePageLabels = {
  forKicker: 'What it’s for',
  featuresKicker: 'Features',
  featuresTitle: 'Every feature, in a short clip.',
  featuresLeadPrefix: 'Each clip is recorded from',
  sharedKicker: 'Works on every doc',
  sharedTitle: 'Comments, revisions and approval, the same on every type.',
  agentKicker: 'How the agent uses it',
  agentTitle: 'The agent writes JSON. The server draws the page.',
  exampleLink: 'The example on GitHub',
  otherKicker: 'Other doc types',
  otherTitle: 'Six more kinds of page.',
  otherAll: 'See all doc types',
};
