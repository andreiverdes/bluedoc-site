// Ask, Plans (the Atlas home's "Inside your agent" tab): Claude Code beside the bluedoc page. The prompt is typed,
// the agent reads the cart code, writes the plan, builds it (real build.py output) and opens it (a real serve.py open);
// the page slides in and the reader scrolls to the Approach canvas: the new parts amber and dashed, the Save a cart
// flow running through them.

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-saved-carts-plan';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = "Plan saved carts and show me what's new.";
const CV = '#cv-arch';
const node = (key) => `${CV} .bp-node[data-key="${key}"]`;
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };

/** a script's output lines, folded as Claude Code folds long output */
const fold = (lines, n) => [
  ...lines.slice(0, n),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

export default {
  stage: true,
  // for the site's <Clip label>: what the video shows, for screen readers
  label: 'Claude Code writes and opens the saved carts plan; bluedoc scrolls to its Approach canvas, where the new Saved carts panel, saved_carts table and sweeper are drawn amber and dashed as the Save a cart flow runs through them.',
  posterAt: -1.2,
  cursor: [1300, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    // the page rendered 1100 px wide and scaled 0.8 into the browser window (the stage's default is 1240 at 0.71):
    // bluedoc's narrow layout, its column edge to edge, so the canvas fills the window
    await s.tab.ev(`Object.assign(document.getElementById('frame').style, { width: '1100px', height: '1023px', transform: 'scale(0.8)' })`);
    // the page loaded and settled in the browser window, off stage until the agent opens it
    await s.layout('tandem');
    await c.goto(DOC);
    await c.waitForSelector(CV);
    await c.ev(`BP.sidebar({ open: false })`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(400);
    await s.layout('solo');
    await t.title('acme-shop — claude');
    await t.block([WELCOME]);
  },

  async run(c) {
    const s = c.stage, t = s.term;

    // ---- the ask ----
    await c.pause(800);
    await t.type(PROMPT, 32);
    await c.pause(250);
    await t.submit();
    await t.gap();
    await t.spin('Planning');
    let id = await t.tool('Read', 'web/src/cart/cartStorage.ts');
    await c.pause(400);
    await t.done(id, ['Read 84 lines']);
    id = await t.tool('Read', 'services/orders-api/src/carts.ts');
    await c.pause(400);
    await t.done(id, ['Read 212 lines']);
    await t.say('I’ll put the plan on one page, the new parts marked.');

    // ---- the doc: written, built, opened ----
    id = await t.tool('Write', REL);
    await c.pause(450);
    await t.done(id, [`Wrote 1 lines to ${REL}`]);
    id = await t.tool('Bash', `build.py ${REL}`);
    const built = await s.py('build.py', REL);
    await t.done(id, fold(built.out.split('\n').filter((l) => l.trim()).map((l) => s.tidy(l)), 2));
    id = await t.tool('Bash', `serve.py open ${REL} --to "Claude Code"`);
    const opened = await s.py('serve.py', 'open', REL, '--to', 'Claude Code');
    const lines = opened.out.split('\n').filter((l) => l.trim()).map((l) => (/^https?:\/\//.test(l.trim()) ? `http://${s.shown(l.trim())}` : s.tidy(l)));
    await t.done(id, fold(lines, 2));
    await t.spin(null);
    await s.layout('tandem');

    // ---- the page: the Approach canvas, what's new amber and dashed, the flow running through it ----
    await c.pause(900);
    await c.moveTo([1120, 700], { ms: 700 });
    await c.pause(200);
    await c.wheel(await c.ev(`document.querySelector('${CV}').getBoundingClientRect().top - 70`), { ms: 1200 });
    await c.pause(700);
    await c.moveTo({ sel: node('panel'), x: 0.5, y: 0.55 }, { ms: 800 });
    await c.pause(1100);
    await c.moveTo({ sel: node('savedtbl'), x: 0.5, y: 0.55 }, { ms: 900 });
    await c.pause(1100);
    await c.moveTo({ sel: node('sweeper'), x: 0.75, y: 1, dy: 40 }, { ms: 800 });
    await c.pause(1800);
  },
};
