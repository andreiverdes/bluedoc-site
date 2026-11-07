// Ask, Designs (the Atlas home's "Inside your agent" tab): Claude Code beside the bluedoc page. The request is typed,
// the agent reads the app's README and theme, writes the acme-fit-design example, builds it and opens it (real
// build.py and serve.py open output), and the board slides in, fitted: watch, phones, icon sheet and dashboard. The
// tour: the camera glides into the round watch, up to the phone screens and down to the browser dashboard, where it
// rests.
// The board mounts screens only once the camera rests and unmounts those far from that view (board.mjs), so it rests
// only at the fitted start, where every screen is live, and at the end; at the watch and the phones it keeps drifting.
import { readFileSync } from 'node:fs';
import { camera, panels, settled } from '../fixtures/acme-fit-design/board.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 27;

const DOC = 'acme-fit-design';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = 'Mock up Acme Fit for watch, phone and web.';
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };

/** long output folded as Claude Code folds it */
const fold = (lines, n, cls = 'ink') => [
  ...lines.slice(0, n).map((l) => ({ text: l || ' ', cls })),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const sine = (t) => (1 - Math.cos(Math.PI * t)) / 2;

/**
 * board.mjs's glide inside the film's browser window: board point (x, y) glides to the middle of the board while the
 * zoom eases to k (a long move dips the zoom on the way). The cursor is in stage px, so it maps into the page by the
 * frame's box; wheel deltas reach the page as sent. Each frame's pinch and pan land before the next are sent: with
 * more in flight the board strayed from the tracked camera. `ease: sine` with `dip: false` is a slow drift.
 */
async function glide(c, { x, y, k, ms = 1000, ease = inOut, dip = true }) {
  const b = await c.frame.box();
  const v = await camera(c);
  const W = v.w / 2, H = v.h / 2;
  const cx = (c.x - b.x) / b.scale - v.left, cy = (c.y - b.y) / b.scale - v.top; // the cursor in the board's stage
  const b0 = [(W - v.tx) / v.k, (H - v.ty) / v.k];
  const L0 = Math.log(v.k), L1 = Math.log(k);
  const kFit = (Math.min(v.w, v.h) * 0.9) / Math.max(1, Math.hypot(x - b0[0], y - b0[1]));
  const Lm = dip ? Math.min((L0 + L1) / 2, Math.log(kFit)) : (L0 + L1) / 2;
  const Lc = 2 * Lm - (L0 + L1) / 2;
  const send = (o) => c.tab.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: c.x, y: c.y, deltaX: 0, deltaY: 0, ...o });
  const t0 = performance.now();
  for (;;) {
    const p = Math.min(1, (performance.now() - t0) / ms), e = ease(p), u = 1 - e;
    const kt = Math.exp(u * u * L0 + 2 * e * u * Lc + e * e * L1);
    const bx = b0[0] + (x - b0[0]) * e, by = b0[1] + (y - b0[1]) * e;
    // the pinch scales about the cursor; then a pan puts (bx, by) in the middle (the camera is tracked, not read)
    const r = kt / v.k;
    const tx = cx - (cx - v.tx) * r, ty = cy - (cy - v.ty) * r;
    const tx1 = W - bx * kt, ty1 = H - by * kt;
    await Promise.all([send({ deltaY: -Math.log(r) / 0.012, modifiers: 2 }), send({ deltaX: tx - tx1, deltaY: ty - ty1 })]);
    Object.assign(v, { k: kt, tx: tx1, ty: ty1 });
    if (p >= 1) break;
  }
}

export default {
  stage: true,
  posterAt: -0.6,
  cursor: [1440, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.lines = readFileSync(c.bd.docPath(DOC), 'utf8').trimEnd().split('\n').length;
    // the board loads and fits in the browser window off stage, every screen live, so the take's reveal is at rest
    await s.layout('tandem');
    await c.goto(DOC);
    await panels(c);
    await c.ev('BP.board({fit: true})');
    await c.waitFor('BP.board().artboards.every((a) => a.live)');
    await settled(c);
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
    await t.spin('Designing');
    let id = await t.tool('Read', 'apps/fit/README.md');
    await c.pause(400);
    await t.done(id, ['Read 64 lines']);
    id = await t.tool('Read', 'apps/fit/src/theme/tokens.ts');
    await c.pause(350);
    await t.done(id, ['Read 58 lines']);
    await t.say('One board: the round watch, the phone app and the web dashboard.');

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
    await t.done(id, lines(opened.out).map((l) => (/^https?:\/\//.test(l.trim()) ? `http://${s.shown(l.trim())}` : l)));
    await t.spin(null);
    await s.layout('tandem');

    // ---- the tour: the watch, the phones, the dashboard ----
    await c.pause(800);
    await glide(c, { x: 120, y: 3856, k: 1.75, ms: 1600 }); // the round watch
    await glide(c, { x: 124, y: 3852, k: 1.9, ms: 1000, ease: sine, dip: false });
    await glide(c, { x: 785, y: 1808, k: 0.62, ms: 1500 }); // the phone screens
    await glide(c, { x: 800, y: 1800, k: 0.66, ms: 1000, ease: sine, dip: false });
    await glide(c, { x: 720, y: 5526, k: 0.8, ms: 1900 }); // the browser dashboard
    await settled(c);
    await c.pause(900);
  },
};
