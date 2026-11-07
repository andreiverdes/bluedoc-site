// Ask, Reviews (the Atlas home's "Inside your agent" tab): Claude Code beside the bluedoc page. The prompt is typed,
// the agent diffs the pricing PR (#412, real git output from the Acme bundle), reads tiers.ts, writes the findings,
// builds them (real build.py output) and opens them (a real serve.py open); the page slides in, in Merged view, and
// the reader scrolls to tiers.ts: each finding under its lines. The cursor runs over the tier-boundary finding's
// options and opens its Details.
// The example reviews two PRs; prepare cuts it down to #412 with real build.py patch calls.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findingsView } from './_shared/review-findings.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-review-findings';
const REL = `docs/${DOC}.bluedoc.json`;
const PROMPT = 'Review the pricing PR and pin each finding to its line.';
const BASE = '89efd8e', HEAD = '62ccc86';
const STAT = 44; // the diffstat's width: its graph fits the terminal's column beside the page
const TIERS = '#pr-412 .bd-mg.bd-xf[data-file="src/pricing/tiers.ts"]';
const row = (id) => `#pr-412 .bd-mrow[data-item="t412/${id}"]`;
const opt = (id, o) => `${row(id)} .bp-opt[data-id="${o}"]`;
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };

/** output lines, folded as Claude Code folds long output */
const fold = (lines, n) => [
  ...lines.slice(0, n),
  ...(lines.length > n ? [{ text: `… +${lines.length - n} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
];

/** the #412 findings only: the request names one PR */
const FRONT = {
  title: 'Review findings: acme-shop #412',
  subtitle: 'The 7 review comments on the pricing PR, each next to its code. Pick what to do with each; my recommendation is starred.',
  tldr: 'Fix 4 in the PR, ticket 1, decline 1; 1 resolves itself. One is a real bug the PR introduces: `tierFor` gives no discount at exactly 10 or 50 units. It is a one-line fix; the PR should not merge before it.',
  state: [
    { label: '7 review comments', kind: 'warn' },
    { label: '4 fix in the PR', kind: 'warn' },
    { label: '1 follow-up ticket', kind: 'info' },
    { label: '1 decline', kind: 'todo' },
    { label: '1 resolves when a fix lands', kind: 'info' },
  ],
  links: [
    { label: 'acme-shop #412 (bulk tiers)', href: 'https://github.com/acme/acme-shop/pull/412' },
    { label: 'PRICING-88 spec', href: 'https://example.com/acme/tickets/PRICING-88' },
  ],
};

export default {
  stage: true,
  // for the site's <Clip label>: what the video shows, for screen readers
  label: 'Claude Code reviews the pricing PR and opens the findings in bluedoc’s Merged view, each under its lines in tiers.ts, then opens the explanation of the tierFor blocker’s recommended Fix in PR option.',
  posterAt: -1.2,
  cursor: [1300, 760],

  prepare(ctx) {
    const doc = ctx.bd.docPath(DOC);
    const patch = (key, ...args) => ctx.py('build.py', 'patch', doc, key, ...args, '--no-bump');
    patch('doc', '--json', JSON.stringify(FRONT));
    for (const r of [10, 9, 8, 7]) patch(`row:summary/0/${r}`, '--delete'); // #415's summary rows, then its section
    patch('section:pr-415', '--delete');
    patch('block:summary/1', '--set', 'md=Two review agents read the PR at the head below and posted with your `gh` login, so every comment on GitHub reads as yours. I checked each finding against the code before recommending.');
    // the PR's diffstat, from a clone of the Acme repo the example's diff comes from
    const git = mkdtempSync(join(tmpdir(), 'ask-reviews-git-'));
    try {
      const run = (...args) => spawnSync('git', args, { encoding: 'utf8' });
      run('clone', '-q', join(ctx.docs, 'acme-shop.bundle'), git);
      this.diffstat = run('-C', git, 'diff', `--stat=${STAT}`, BASE, HEAD).stdout.split('\n').filter((l) => l.trim()).map((l) => l.trim());
    } finally {
      rmSync(git, { recursive: true, force: true });
    }
  },

  async setup(c) {
    const s = c.stage, t = s.term;
    // the page rendered 1100 px wide and scaled 0.8 into the browser window (the stage's default is 1240 at 0.71):
    // bluedoc's narrow layout, its column edge to edge, so the code and the findings read at their largest
    await s.tab.ev(`Object.assign(document.getElementById('frame').style, { width: '1100px', height: '1023px', transform: 'scale(0.8)' })`);
    // the page in Merged view, loaded off stage until the agent opens it
    await s.layout('tandem');
    await c.goto(DOC);
    await findingsView(c, 'pr-412', 'merged');
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
    await t.spin('Reviewing');
    let id = await t.tool('Bash', `git diff --stat=${STAT} ${BASE} ${HEAD}`);
    await c.pause(400);
    await t.done(id, fold(this.diffstat, 3));
    id = await t.tool('Read', 'src/pricing/tiers.ts');
    await c.pause(400);
    await t.done(id, ['Read 26 lines']);
    await t.say('7 findings. I’ll pin each one under its lines.');

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

    // ---- the page: tiers.ts in Merged view, each finding under its lines ----
    await c.pause(800);
    await c.moveTo([1120, 600], { ms: 700 });
    await c.pause(200);
    await c.wheel(await c.ev(`document.querySelector('${TIERS}').getBoundingClientRect().top - 124`), { ms: 1200 });
    await c.pause(1100);
    await c.wheel(await c.ev(`document.querySelector('${row('tier-boundary')}').getBoundingClientRect().top - 330`), { ms: 900 });
    await c.pause(500);
    // the blocker's options: past Decline and Ticket to the starred Fix in PR, whose explanation opens
    await c.moveTo({ sel: `${opt('tier-boundary', 'decline')} .oh`, x: 0.4, y: 0.5 }, { ms: 650 });
    await c.pause(350);
    await c.moveTo({ sel: `${opt('tier-boundary', 'ticket')} .oh`, x: 0.33, y: 0.5 }, { ms: 450 });
    await c.pause(350);
    await c.click({ sel: `${opt('tier-boundary', 'fix')} .oh`, x: 0.25, y: 0.5 }, { ms: 500 });
    await c.waitFor(`document.querySelector('${opt('tier-boundary', 'fix')} .oh').getAttribute('aria-expanded') === 'true'`);
    await c.pause(1300);
    await c.moveTo({ sel: `${opt('tier-boundary', 'fix')} .ob`, x: 0.95, y: 0.7 }, { ms: 700 });
    await c.pause(1500);
  },
};
