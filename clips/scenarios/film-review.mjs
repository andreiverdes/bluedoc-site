// Film, Review (docs/plans/demo-films.bluedoc.json): Claude Code beside the bluedoc page, on the acme-review-findings
// example. 0–3 s without bluedoc: the findings as a chat wall. Then a fresh session: /bluedoc-review, a git diff and a
// Read, the agent writes and builds the findings doc (real build.py output), opens it (a real serve.py open) and
// waits in the background (a real serve.py wait). On the page, #412 in Merged view: each finding under its lines in
// tiers.ts. The reader declines the TIERS-map nit with a reason, keeps Fix in PR on the tier boundary, tickets the
// fractional cents, accepts the other 8 as recommended and sends; the real reply prints in the terminal (folded after
// #412) and the agent starts on the fix.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findingsView } from './_shared/review-findings.mjs';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'acme-review-findings';
const REL = 'docs/acme-review-findings.bluedoc.json';
const PROMPT = '/bluedoc-review the open PRs';
const REASON = 'Three tiers: an array reads fine';
const row = (id) => `#pr-412 .bd-mrow[data-item="t412/${id}"]`;
const pick = (id, opt) => `${row(id)} .bp-opt[data-id="${opt}"] .pk`;
const picked = (id, opt) => `document.querySelector('${pick(id, opt)}').getAttribute('aria-checked') === 'true'`;

/** the findings as the Markdown wall an agent prints in the chat */
function wall(doc) {
  const plain = (s) => String(s ?? '').replace(/\*\*|`/g, '');
  const out = [`## ${doc.title}`, ''];
  let n = 0;
  for (const s of doc.sections) {
    for (const b of s.blocks ?? []) {
      if (b.type !== 'checklist') continue;
      out.push(`### ${s.title}`, '');
      for (const it of b.items) {
        out.push(`${++n}. ${plain(it.text)} [${it.state}]`, `   ${plain(it.sub)}`);
        out.push(...plain(it.detail).split(/\n+|(?<=\.) (?=[A-Z][a-z]+( I'd post)?:)/).filter(Boolean).map((l) => `   ${l}`), '');
      }
    }
  }
  return out;
}

export default {
  stage: true,
  posterAt: -2.4,
  cursor: [1440, 760],

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    this.wall = wall(JSON.parse(readFileSync(this.path, 'utf8')));
    // what the agent's build prints, worked out before the take (a blocking call would stall it)
    const b = spawnSync('python3', [join(c.bd.scripts, 'build.py'), this.path], { env: c.bd.env, cwd: c.bd.work, encoding: 'utf8' });
    this.built = `${b.stdout}\n${b.stderr}`.split('\n').find((l) => /error\(s\)/.test(l)) ?? 'built';
    // the page in Merged view, comments panel closed (both kept for the doc), then bluedoc's home, off stage
    await c.goto(DOC);
    await findingsView(c, 'pr-412', 'merged');
    await c.goto('home');
    await s.layout('solo');
    await t.title('acme-shop — claude (without bluedoc)');
    await t.block(this.wall.slice(0, 30), { cls: 'dim' });
  },

  async run(c) {
    const s = c.stage, t = s.term;

    // ---- 0–3 s: without bluedoc, the findings scroll past; the reader answers in prose, by number ----
    s.caption('Review findings lost in the scroll?');
    await t.block(this.wall.slice(30, 110), { lps: 50, cls: 'dim' });
    await t.type('ok fix 1, 3 and 4, ticket 2, skip 6 because…', 34);
    await c.pause(800);

    // ---- the cut: a fresh session, with bluedoc ----
    await s.caption(null);
    await t.clear();
    await t.title('acme-shop — claude');
    await t.block([{ html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' }]);
    await s.layout('tandem');
    await c.pause(300);
    await t.type(PROMPT, 30);
    await c.pause(250);
    await t.submit();
    await t.gap();
    await t.spin('Reviewing');

    let id = await t.tool('Bash', 'git diff --stat 89efd8e 62ccc86');
    await c.pause(450);
    await t.done(id, ['4 files changed, 49 insertions(+), 3 deletions(-)']);
    id = await t.tool('Read', 'src/pricing/tiers.ts');
    await c.pause(450);
    await t.done(id, ['Read 26 lines']);
    id = await t.tool('Write', REL);
    await c.pause(550);
    await t.done(id, [`Wrote 1 lines to ${REL}`]);
    id = await t.tool('Bash', `build.py ${REL}`);
    await c.pause(400);
    await t.done(id, [s.tidy(this.built)]);

    // open: the real serve.py open; the page comes up in the browser
    id = await t.tool('Bash', `serve.py open ${REL} --to claude`);
    const opened = await s.py('serve.py', 'open', this.path, '--to', 'claude');
    await c.goto(DOC);
    const lines = opened.out.trim().split('\n').map((l) => s.tidy(l).replace(/([?&]key=)[^&\s]+/, '$1…'));
    await t.done(id, [lines[0], ...(lines.length > 1 ? [{ text: `… +${lines.length - 1} lines (ctrl+o to expand)`, cls: 'faint' }] : [])]);
    await t.spin(null);
    const reply = s.wait(this.path);
    id = await t.tool('Bash', `serve.py wait ${REL} --kind any`);
    await t.done(id, ['Running in the background (↓ to manage)']);
    s.caption('Decide each one on its [line].');
    await t.say('11 findings, each under its lines. Pick per finding; I’ll wait.');

    // ---- the reader, on the page: tiers.ts's three findings ----
    await c.moveTo([1100, 600], { ms: 600 });
    await c.wheel(await c.ev(`document.querySelector('${row('tiers-map')}').getBoundingClientRect().top - 250`), { ms: 800 });
    await c.pause(400);
    // decline the TIERS nit, with a reason
    await c.click(pick('tiers-map', 'decline'), { ms: 600 });
    await c.waitFor(picked('tiers-map', 'decline'));
    await c.click(`${row('tiers-map')} > .bp-note textarea`, { ms: 500 });
    await c.type(REASON, { cps: 30 });
    await c.click(`${row('tiers-map')} > .bp-note .bp-btn.primary`, { ms: 400 });
    await c.waitFor(`!document.querySelector('${row('tiers-map')} > .bp-note').classList.contains('dirty')`);
    await c.pause(300);
    // the boundary bug: Fix in PR
    await c.wheel(await c.ev(`document.querySelector('${row('tier-boundary')}').getBoundingClientRect().top - 300`), { ms: 600 });
    await c.click(pick('tier-boundary', 'fix'), { ms: 550 });
    await c.waitFor(picked('tier-boundary', 'fix'));
    await c.pause(300);
    // fractional cents: a ticket
    await c.wheel(await c.ev(`document.querySelector('${row('float-cents')}').getBoundingClientRect().top - 300`), { ms: 600 });
    await c.click(pick('float-cents', 'ticket'), { ms: 550 });
    await c.waitFor(picked('float-cents', 'ticket'));
    await c.pause(350);
    // the other 8 as recommended (Accept recommended only fills open decisions)
    await c.click('.bd-anntb .acc', { ms: 650 });
    await c.waitFor(`BP.progress().every((p) => p.done === p.total)`);
    await c.pause(500);

    // send
    await c.click('.bd-anntb .send', { ms: 650 });
    await c.waitForSelector('.bd-send:not(.bd-chgs)[open] .ft .bp-btn.primary');
    await c.pause(700);
    await c.click('.bd-send:not(.bd-chgs)[open] .ft .bp-btn.primary', { ms: 500 });
    await c.waitFor(`!document.querySelector('.bd-send:not(.bd-chgs)').open`);

    // ---- the payoff: the agent was already waiting ----
    // the reply as wait printed it, folded after #412's findings as Claude Code folds long output
    const all = (await reply).trim().split('\n');
    const heads = all.flatMap((l, i) => (l.startsWith('## ') ? [i] : []));
    const cut = heads.length > 1 ? heads[1] : -1;
    const md = cut > 0 ? all.slice(0, cut) : all;
    s.caption('Your agent got [every decision].');
    await t.gap();
    id = await t.tool('BashOutput', 'serve.py wait');
    await t.done(id, [
      ...md.map((l) => ({ text: s.tidy(l) || ' ', cls: /^(#|---)/.test(l) ? 'hd' : 'ink' })),
      ...(cut > 0 ? [{ text: `… +${all.length - cut} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
    ], { lps: 30 });
    await c.pause(1200);
    await t.say('Fixing the kept findings in #412, the tier boundary first. Tickets for the cents and the docs.');
    await t.tool('Edit', 'src/pricing/tiers.ts');
    await c.pause(2400);
  },
};
