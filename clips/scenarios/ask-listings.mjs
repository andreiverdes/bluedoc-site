// Ask, Store listings (the home page's "Inside your agent" tabs): Claude Code beside the Acme Fit store listing. The
// prompt, a Read of a design-board screen the shots come from, the Write, the real build.py output (folded) and a
// real serve.py open; the listing slides in on Google Play. The tour scrolls Play's device sets, switches to the App
// Store and scrolls its Apple Watch, iPhone and iPad sets, then rests.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { panels, shotsReady } from '../fixtures/acme-fit-listing/listing.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-fit-listing';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = 'Write the Acme Fit listing for Google Play and the App Store.';
const MAIN = { sel: '.bd-lst-main', x: 0.55, y: 0.55 };

/** a text file's line count, as Claude Code's Read reports it */
const lineCount = (path) => readFileSync(path, 'utf8').replace(/\n$/, '').split('\n').length;

/** long output folded as Claude Code folds it */
const fold = (lines, n, cls = 'ink') => [
  ...lines.slice(0, n).map((l) => ({ text: l || ' ', cls })),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

export default {
  stage: true,
  posterAt: -1.0,
  cursor: [1300, 820],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    // the doc as the skill has the agent write it: minified JSON on one line
    this.lines = lineCount(this.path);
    this.screenLines = lineCount(join(c.bd.docs, 'acme-fit-design.design/today.html'));
    // the listing loads off stage, its panels shut, so it slides in ready when the agent opens it
    await s.layout('tandem');
    await c.goto(DOC);
    await panels(c, { left: false });
    // each store's shots rendered once, so the switch in the take lands on drawn shots
    await c.ev(`document.querySelector('.bd-lst-btb [data-p=appstore]').click()`);
    await c.waitFor(`BP.listing().platform === 'appstore'`);
    await shotsReady(c);
    await c.ev(`document.querySelector('.bd-lst-btb [data-p=play]').click()`);
    await c.waitFor(`BP.listing().platform === 'play'`);
    await shotsReady(c);
    await s.layout('solo');
    await t.title('acme-shop — claude');
    await t.block([{ html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' }]);
  },

  async run(c) {
    const s = c.stage, t = s.term;

    // ---- the ask ----
    await c.pause(800);
    await t.type(PROMPT, 32);
    await c.pause(250);
    await t.submit();
    await t.gap();
    await t.spin('Writing');
    let id = await t.tool('Read', 'docs/acme-fit-design.design/today.html');
    await c.pause(450);
    await t.done(id, [`Read ${this.screenLines} lines`]);
    await t.say('Both stores on one listing, every device set from the design board.');
    id = await t.tool('Write', REL);
    await c.pause(450);
    await t.done(id, [`Wrote ${this.lines} lines to ${REL}`]);

    // ---- the real build and open ----
    id = await t.tool('Bash', `build.py ${REL}`);
    const built = await s.py('build.py', this.path);
    await c.pause(300);
    await t.done(id, fold(built.out.split('\n').filter((l) => l.trim()).map((l) => s.tidy(l)), 1), { lps: 30 });
    id = await t.tool('Bash', `serve.py open ${REL} --to "Claude Code"`);
    const opened = await s.py('serve.py', 'open', this.path, '--to', 'Claude Code');
    if (opened.code !== 0) throw new Error(`serve.py open: ${opened.out}`);
    const url = opened.out.trim().split('\n').at(-1);
    await t.done(id, [`http://${s.shown(url)}`]);
    await t.spin(null);
    await s.layout('tandem');

    // ---- the tour: Play's device sets, then the App Store's ----
    await c.pause(700);
    await c.moveTo(MAIN, { ms: 650 });
    await c.wheel(520, { ms: 1000 });
    await shotsReady(c);
    await c.pause(500);
    await c.click(`.bd-lst-btb [data-p=appstore]`, { ms: 650 });
    await c.waitFor(`BP.listing().platform === 'appstore'`);
    await shotsReady(c);
    await c.pause(700);
    await c.moveTo(MAIN, { ms: 600 });
    await c.wheel(520, { ms: 1000 });
    await shotsReady(c);
    await c.pause(1300);
  },
};
