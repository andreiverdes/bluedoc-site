// Ask, Other (the Atlas home's "Inside your agent" tab): Claude Code beside the bluedoc page. The request is typed,
// the agent reads the week's numbers and the incident note, writes the acme-status example, builds it and opens it
// (real build.py and serve.py open output), and the page slides in. The tour: the TL;DR, the week-over-week numbers
// (a row lights up), the incident table, and the open decision with its recommendation, where the take rests.
import { readFileSync } from 'node:fs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-status';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = "Write this week's status page.";
const TOP = 64; // a section's heading just under the app bar
const to = (sel) => `(document.querySelector('${sel}').getBoundingClientRect().top - ${TOP})`;
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };

/** long output folded as Claude Code folds it */
const fold = (lines, n, cls = 'ink') => [
  ...lines.slice(0, n).map((l) => ({ text: l || ' ', cls })),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

export default {
  stage: true,
  posterAt: -1.0,
  cursor: [1440, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    this.lines = readFileSync(this.path, 'utf8').trimEnd().split('\n').length;
    // the page loads once off stage (fonts, the page's code), so the take's own load is quick
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
    await t.spin('Gathering');
    let id = await t.tool('Read', 'ops/metrics/orders-week-41.csv');
    await c.pause(400);
    await t.done(id, ['Read 9 lines']);
    id = await t.tool('Read', 'ops/incidents/2026-10-08-pricing.md');
    await c.pause(350);
    await t.done(id, ['Read 41 lines']);
    await t.say('One page: the numbers, the pricing incident and the saved carts decision.');

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
    // the page loads while the browser is still off stage, at the page's own width (comments panel closed)
    await c.goto(DOC);
    await c.ev('BP.sidebar({open: false})');
    await c.waitFor('!BP.sidebar().open');
    await t.done(id, lines(opened.out).map((l) => (/^https?:\/\//.test(l.trim()) ? `http://${s.shown(l.trim())}` : l)));
    await t.spin(null);
    await s.layout('tandem');

    // ---- the tour: TL;DR, numbers, the incident, the open decision ----
    await c.moveTo({ text: 'when to start the saved carts rollout.', at: 'end' }, { ms: 650 }); // under the TL;DR, clear of its words
    await c.pause(950);

    await c.wheel(await c.ev(to('#numbers')), { ms: 650 });
    await c.pause(200);
    await c.moveTo({ sel: '#numbers tbody tr[data-r="0"]', x: 0.3 }, { ms: 550 });
    await c.pause(800); // orders up 6%

    await c.wheel(await c.ev(to('#incidents')), { ms: 600 });
    await c.pause(200);
    await c.moveTo({ sel: '#incidents tbody tr', x: 0.2, y: 0.85 }, { ms: 500 }); // under the duration, clear of the words
    await c.pause(800); // the incident, its cause and fix

    await c.wheel(await c.ev(to('#next')), { ms: 600 });
    await c.pause(200);
    await c.moveTo({ sel: '#next .bp-opt:has(.rec) .rec', y: 0.6 }, { ms: 600 });
    await c.pause(1500); // the decision with its recommendation, at rest
  },
};
