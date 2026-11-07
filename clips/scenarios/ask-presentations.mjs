// Ask, Presentations (the Atlas home's "Inside your agent" tab): Claude Code beside the bluedoc page. The request is
// typed, the agent reads the review and its numbers, writes the acme-fit-deck example, builds it and opens it (real
// build.py and serve.py open output), and the deck's board of slides slides in. The tour: Present plays the deck in
// the page's own window, each slide with its speaker notes under it; → twice steps from the title through What
// shipped to Weekly actives, where it rests. Present fills the page's window, not the screen, so it runs framed.
import { readFileSync } from 'node:fs';
import { settled } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-fit-deck';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = 'Turn the Q3 launch review into a deck with speaker notes.';
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };
const PRESENT = '.bd-btb .bd-tbtn.pri';
const NEXT = '.bd-pres .bar button[aria-label="Next slide (→)"]';
const shown = (id) => `BP.board().presented && BP.board().presented.screen === '${id}' && !!document.querySelector('.bd-pres iframe')`;

/** long output folded as Claude Code folds it */
const fold = (lines, n, cls = 'ink') => [
  ...lines.slice(0, n).map((l) => ({ text: l || ' ', cls })),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

export default {
  stage: true,
  posterAt: -0.8,
  cursor: [1440, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.lines = readFileSync(c.bd.docPath(DOC), 'utf8').trimEnd().split('\n').length;
    // the deck loads and fits in the browser window off stage, every slide live, so the take's reveal is at rest
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
    await t.spin('Drafting');
    let id = await t.tool('Read', 'docs/q3-launch-review.md');
    await c.pause(400);
    await t.done(id, ['Read 112 lines']);
    id = await t.tool('Read', 'docs/metrics/weekly-actives.csv');
    await c.pause(350);
    await t.done(id, ['Read 27 lines']);
    await t.say('Five slides from the review, with what to say under each.');

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

    // ---- the tour: Present, two slides on, the notes under each ----
    await c.pause(900);
    await c.click(PRESENT, { ms: 700 });
    await c.waitFor(shown('title'));
    await c.pause(1300);
    await c.moveTo(NEXT, { ms: 600 });
    await c.pause(200);
    await c.click(NEXT, { ms: 1 });
    await c.waitFor(shown('shipped'));
    await c.pause(1900);
    await c.click(NEXT, { ms: 1 });
    await c.waitFor(shown('actives'));
    await c.pause(500);
    await c.moveTo({ sel: NEXT, dx: 150, dy: 40 }, { ms: 600 });
    await c.pause(1400);
  },
};
