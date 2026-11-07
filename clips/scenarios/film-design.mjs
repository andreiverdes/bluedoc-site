// Film, Designs (docs/plans/demo-films.bluedoc.json): Claude Code beside the Acme Fit design board. The agent builds
// the board and opens it (real build.py and serve.py open output), then waits in the background (a real serve.py
// wait). The reader points at Profile in Today's tab bar, pins a change request and sends it; the real request lands
// in the terminal, naming the element. The agent applies rev D (the fixture's Today, with the real build.py patch),
// waits again, and the board shows Today's rev C and rev D onion-skinned.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { panels, settled } from '../fixtures/acme-fit-design/board.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-fit-design';
const REL = 'docs/acme-fit-design.bluedoc.json';
const PROMPT = 'Mock up the Acme Fit phone screens on a design board.';
const NOTE = 'Drop Profile from the tabs; the avatar opens it';
const SCR = '.bd-ab[data-ab="today"] .bd-ab-scr';
const FIXTURE = new URL('../fixtures/acme-fit-design/today-rev-d.html', import.meta.url).pathname;
const SLIDER = '.bd-cmpv input[type=range]';
const knob = (v) => ({ sel: SLIDER, x: 0, dx: 8 + ((v / 100) * (129 - 16)) });

/** a script's output as the agent ran it, worked out before the take (a blocking call would stall it) */
function run(c, script, ...args) {
  const r = spawnSync('python3', [join(c.bd.scripts, script), ...args], { env: c.bd.env, cwd: c.bd.work, encoding: 'utf8' });
  return `${r.stdout}\n${r.stderr}`.split('\n').filter((l) => l.trim());
}

/** long output folded as Claude Code folds it */
const fold = (lines, n, cls = 'ink') => [
  ...lines.slice(0, n).map((l) => ({ text: l || ' ', cls })),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

export default {
  stage: true,
  posterAt: -1.4,
  cursor: [1300, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    this.built = run(c, 'build.py', this.path).map((l) => s.tidy(l));
    // the URL as the reader's address bar shows it: the key token left out
    this.opened = run(c, 'serve.py', 'open', this.path, '--to', 'Claude Code').map((l) => (/^https?:\/\//.test(l.trim()) ? `http://${s.shown(l.trim())}` : s.tidy(l)));
    await s.layout('tandem');
    await c.goto(DOC);
    await panels(c);
    await c.ev(`BP.board({focus: 'today'})`);
    await settled(c);
    // off stage until the agent opens it
    await s.layout('solo');
    await t.title('acme-shop — claude');
    await t.block([{ html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' }]);
  },

  async run(c) {
    const s = c.stage, t = s.term;

    // ---- the ask, the build, the open ----
    s.caption('Mockups you can only screenshot?');
    await c.pause(500);
    await t.type(PROMPT, 32);
    await c.pause(200);
    await t.submit();
    await t.gap();
    await t.spin('Designing');
    let id = await t.tool('Write', 'docs/acme-fit-design.design/screens/today.html');
    await c.pause(450);
    await t.done(id, ['Wrote 33 lines to docs/acme-fit-design.design/screens/today.html']);
    id = await t.tool('Bash', `build.py ${REL}`);
    await c.pause(450);
    await t.done(id, fold(this.built, 2));
    id = await t.tool('Bash', `serve.py open ${REL}`);
    await c.pause(300);
    await s.layout('tandem');
    await t.done(id, this.opened);
    await t.spin(null);
    const reply = s.wait(this.path);
    id = await t.tool('Bash', `serve.py wait ${REL} --kind any`);
    await t.done(id, ['Running in the background (↓ to manage)']);
    await t.say('The board is open. Point at anything and I’ll pick it up.');
    await s.caption(null);

    // ---- the reader points at Profile in Today's tab bar ----
    s.caption('Point at the [screen].');
    await c.click('button.bd-key[aria-label="Point"]', { ms: 650 });
    await c.waitFor(`BP.board().mode === 'point'`);
    await c.moveTo({ sel: SCR, x: 0.87, y: 0.955 }, { ms: 700 });
    await c.pause(350);
    await c.click(null);
    await c.waitFor(`!!document.querySelector('textarea:focus, [contenteditable]:focus')`);
    await c.pause(200);
    await c.type(NOTE, { cps: 30 });
    await c.pause(200);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.key('v');
    await c.pause(300);
    await c.click('button.bd-key[aria-label^="Request changes"]', { ms: 650 });
    await c.waitForSelector('.bd-chgs[open] .bp-btn.primary');
    await c.pause(1500);
    await c.click('.bd-chgs[open] .bp-btn.primary', { ms: 500 });
    await s.caption(null);

    // ---- the request lands; the agent revises ----
    const all = (await reply).trim().split('\n');
    let cut = all.findIndex((l) => l.startsWith('## Decisions'));
    if (cut < 0) cut = all.findIndex((l) => l.startsWith('## Answering'));
    const md = (cut > 0 ? all.slice(0, cut) : all).map((l) => s.tidy(l));
    await t.gap();
    id = await t.tool('BashOutput', 'serve.py wait');
    await t.done(id, [
      ...md.map((l) => ({ text: l || ' ', cls: /^(#|---)/.test(l) ? 'hd' : 'ink' })),
      ...(cut > 0 ? [{ text: `… +${all.length - cut} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
    ], { lps: 30 });
    await c.pause(1200);
    await t.spin('Revising');
    id = await t.tool('Edit', 'docs/acme-fit-design.design/screens/today.html');
    await c.pause(400);
    await t.done(id, ['Updated today.html: tab bar without Profile, avatar links to it']);
    const change = 'Today: the avatar opens Profile, so the tab bar drops it; Start workout opens as a sheet.';
    id = await t.tool('Bash', `build.py patch ${REL} artboard:today --html …/today.html`);
    const p = await s.py('build.py', 'patch', this.path, 'artboard:today', '--html', FIXTURE, '--change', change);
    await t.done(id, fold(p.out.split('\n').filter((l) => l.trim()).map((l) => s.tidy(l)), 2));
    await t.spin(null);
    s.wait(this.path).catch(() => {}); // still waiting when the take ends: the stage stops it
    id = await t.tool('Bash', `serve.py wait ${REL} --kind any`);
    await t.done(id, ['Running in the background (↓ to manage)']);
    await t.say('Rev D: Profile moved to the avatar. Compare it on the board.');

    // ---- rev D, onion-skinned over rev C ----
    s.caption('Rev D, [onion-skinned] on the board.');
    const u = new URL(await c.bd.urlFor(DOC));
    u.searchParams.set('diff', 'C');
    await s.open(u.href);
    await c.waitFor(`!!(window.BP && BP.board() && document.querySelector('.bd-board'))`);
    await c.ev(`BP.board({compare: 'today'})`);
    await c.waitFor(`BP.board().compare === true`);
    await c.click('.bd-cmpv button[data-v="onion"]', { ms: 600 });
    await c.waitFor(`!document.querySelector('${SLIDER}').hidden`);
    await settled(c);
    await c.moveTo(knob(50), { ms: 500 });
    await c.down();
    await c.moveTo(knob(100), { ms: 600 });
    await c.pause(500);
    await c.moveTo(knob(0), { ms: 1300 });
    await c.pause(500);
    await c.moveTo(knob(60), { ms: 600 });
    await c.up();
    await c.pause(1600);
  },
};
