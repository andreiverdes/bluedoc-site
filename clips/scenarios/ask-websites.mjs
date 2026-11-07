// Ask, Websites (the home page's "Inside your agent" tabs): Claude Code beside the Acme Fit site on a board. The
// prompt, the dev server started in the background, Reads of the two pages' source, the Write, the real build.py
// output (folded) and a real serve.py open; the board slides in with Home and Blog live from the fixture's Vite dev
// server. The tour pinches in on Home's hero, pans across to the Blog's posts, then rests.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BOARD_READY, boardOnly, settle, startFixture } from '../fixtures/acme-fit-site/fixture.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-site';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = 'Put the Acme Fit site on a board, live from the dev server.';
const PAGE = (id) => `.bd-ab[data-ab=${id}] iframe.bd-ab-fr`;
let site;

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

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    // the doc as the skill has the agent write it: minified JSON on one line
    this.lines = lineCount(this.path);
    this.home = lineCount(join(site.root, 'src/pages/home.ts'));
    this.blog = lineCount(join(site.root, 'src/pages/blog.ts'));
    // the board loads off stage, both pages live and fitted, so it slides in ready when the agent opens it
    await s.layout('tandem');
    await c.goto(DOC);
    // the board's live pages come through bluedoc's page proxy, another port, whose frame-ancestors names only
    // bluedoc: the take's tab drops that header for the proxy's documents too (the stage's handler serves both)
    const proxy = new URL(await c.waitFor(`BP.board()?.artboards[0]?.page?.src`, 30_000)).origin;
    await s.tab.call('Fetch.enable', { patterns: [c.bd.origin, proxy].map((o) => ({ urlPattern: `${o}/*`, resourceType: 'Document', requestStage: 'Response' })) });
    await c.reload();
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({fit: true})`);
    await settle(c);
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
    await t.spin('Working');
    let id = await t.tool('Bash', 'npm run dev');
    await c.pause(350);
    await t.done(id, ['Running in the background (↓ to manage)']);
    id = await t.tool('Read', 'src/pages/home.ts');
    await c.pause(300);
    await t.done(id, [`Read ${this.home} lines`]);
    id = await t.tool('Read', 'src/pages/blog.ts');
    await c.pause(300);
    await t.done(id, [`Read ${this.blog} lines`]);
    await t.say('Home and Blog on one board, each page live from the dev server.');
    id = await t.tool('Write', REL);
    await c.pause(400);
    await t.done(id, [`Wrote ${this.lines} lines to ${REL}`]);

    // ---- the real build and open ----
    id = await t.tool('Bash', `build.py ${REL}`);
    const built = await s.py('build.py', this.path);
    await c.pause(300);
    await t.done(id, fold(built.out.split('\n').filter((l) => l.trim()).map((l) => s.tidy(l)), 2), { lps: 30 });
    id = await t.tool('Bash', `serve.py open ${REL} --to "Claude Code"`);
    const opened = await s.py('serve.py', 'open', this.path, '--to', 'Claude Code');
    if (opened.code !== 0) throw new Error(`serve.py open: ${opened.out}`);
    const url = opened.out.trim().split('\n').at(-1);
    await t.done(id, [`http://${s.shown(url)}`]);
    await t.spin(null);
    await s.layout('tandem');

    // ---- the tour: both pages, Home's hero up close, then across to the Blog's posts ----
    await c.pause(1100);
    await c.moveTo({ sel: PAGE('home'), x: 0.45, y: 0.1 }, { ms: 750 });
    await c.pause(150);
    await c.wheel(-55, { ctrl: true, ms: 1400 });
    await settle(c);
    await c.pause(1000);
    // the Blog centred in the window, its page bar (the dev server's address, Live) under the board's toolbar
    const [dx, dy] = await c.ev(`(r => [r.left - (innerWidth - r.width) / 2, r.top - 125])(document.querySelector('${PAGE('blog')}').getBoundingClientRect())`);
    await c.wheel(dy, { deltaX: dx, ms: 1400 });
    await settle(c);
    await c.moveTo({ sel: PAGE('blog'), x: 0.62, y: 0.42 }, { ms: 700 });
    await c.pause(1700);
  },
};
