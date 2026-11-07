// Ask, Docs (the Atlas home's "Inside your agent" tab): Claude Code beside the bluedoc page. The request is typed,
// the agent reads two services, writes the acme-orders example, builds it and opens it (real build.py and
// serve.py open output), and the page slides in. The tour: the order path blueprint, nudged by a drag, a
// double-click flies into orders-api, a pinch opens pricing inside it, and the root crumb brings the whole drawing back.
import { readFileSync } from 'node:fs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-orders';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = 'Map the Acme order path as a doc I can zoom into.';
const CV = '#cv-orders';
const node = (key) => `${CV} .bp-node[data-key="${key}"]`;
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };

/** long output folded as Claude Code folds it */
const fold = (lines, n, cls = 'ink') => [
  ...lines.slice(0, n).map((l) => ({ text: l || ' ', cls })),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

export default {
  stage: true,
  posterAt: -3.2, // three levels deep: Order path › orders-api › pricing
  cursor: [1440, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    this.lines = readFileSync(this.path, 'utf8').trimEnd().split('\n').length;
    // the browser window renders the page 1100 px wide (scaled 0.8 into the same window, as at 113% zoom): bluedoc's
    // narrow-window layout, the column edge to edge and the contents rail a drawer, so the blueprint fills the pane
    await s.tab.ev(`Object.assign(document.getElementById('frame').style, { width: '1100px', height: '1023px', transform: 'scale(0.8)' })`);
    // the page loads once off stage (fonts, the blueprint's code), so the take's own load is quick
    await c.goto(DOC);
    await c.goto('home');
    await s.layout('solo');
    await t.title('acme-shop — claude');
    await t.block([WELCOME]);
  },

  async run(c) {
    const s = c.stage, t = s.term;
    const lines = (out) => out.split('\n').filter((l) => l.trim()).map((l) => s.tidy(l));

    // ---- the ask ----
    await c.pause(800);
    await t.type(PROMPT, 32);
    await c.pause(200);
    await t.submit();
    await t.gap();
    await t.spin('Mapping');
    let id = await t.tool('Read', 'services/orders-api/src/checkout.ts');
    await c.pause(400);
    await t.done(id, ['Read 148 lines']);
    id = await t.tool('Read', 'services/fulfilment-worker/src/pickTicket.ts');
    await c.pause(350);
    await t.done(id, ['Read 96 lines']);
    await t.say('I’ll draw it as a blueprint: each service opens into its own flow.');

    // ---- write, build, open ----
    id = await t.tool('Write', REL);
    await c.pause(450);
    await t.done(id, [`Wrote ${this.lines} lines to ${REL}`]);
    id = await t.tool('Bash', `build.py ${REL}`);
    const built = await s.py('build.py', REL);
    if (built.code !== 0) throw new Error(`build.py: ${built.out}`);
    await t.done(id, fold(lines(built.out), 2));
    id = await t.tool('Bash', `serve.py open ${REL} --to "Claude Code"`);
    const opened = await s.py('serve.py', 'open', REL, '--to', 'Claude Code');
    if (opened.code !== 0) throw new Error(`serve.py open: ${opened.out}`);
    // the page loads while the browser is still off stage; the details card under the drawing would shrink the stage
    // mid-zoom, and the how-to hint fades at the first touch
    await c.goto(DOC);
    await c.addStyle(`${CV} .bp-detail, ${CV} .bp-hint { display: none !important; }`);
    await c.ev('BP.sidebar({open: false})');
    await c.waitFor('!BP.sidebar().open');
    await t.done(id, lines(opened.out).map((l) => (/^https?:\/\//.test(l.trim()) ? `http://${s.shown(l.trim())}` : l)));
    await t.spin(null);
    await s.layout('tandem');

    // ---- the tour: the order path blueprint ----
    await c.moveTo({ sel: '#path h2', x: 0.5, y: 0.5 }, { ms: 500 });
    await c.wheel(await c.ev(`document.querySelector('${CV}').getBoundingClientRect().top - 70`), { ms: 650 });
    await c.waitFor(`BP.state('orders').tokens > 0`);
    await c.pause(200);

    // level 1: double-click orders-api; the drawing flies into it and its inner flow takes over
    await c.dblclick({ sel: node('api'), x: 0.42, y: 0.4 }, { ms: 600 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api'`, 3000);
    await c.pause(600);

    // level 2: pinch into pricing until its rules and tax open. A pinch keeps the point under the cursor still, so the
    // cursor goes to the point that lands pricing in the middle of the drawing
    const z = await c.ev(`(() => {
      const cv = BP.canvases.orders, n = cv.byKey['api/price'], a = n._abs, st = cv.stage.getBoundingClientRect();
      const f = 1.02 / n._childAbs.s / cv.k;
      const cx = st.left + cv.tx + (a.x + a.w / 2) * cv.k, cy = st.top + cv.ty + (a.y + a.h / 2) * cv.k;
      const vx = st.left + st.width / 2, vy = st.top + st.height / 2;
      return { x: (cx * f - vx) / (f - 1), y: (cy * f - vy) / (f - 1), deltaY: -Math.log(f) / 0.012 };
    })()`);
    const b = await c.frame.box();
    await c.moveTo([b.x + z.x * b.scale, b.y + z.y * b.scale], { ms: 450 });
    await c.pause(80);
    await c.wheel(z.deltaY, { ctrl: true, ms: 950 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api,api/price'`, 3000);
    await c.pause(1000);

    // the root crumb: the whole drawing again, at rest
    await c.click(`${CV} .bp-crumbs button:nth-of-type(1)`, { ms: 550 });
    await c.waitFor(`BP.state('orders').focus.length === 0`, 3000);
    await c.pause(200);
    await c.moveTo({ sel: `${CV} .bp-stage`, x: 0.93, y: 0.9 }, { ms: 500 });
    await c.pause(1000);
  },
};
