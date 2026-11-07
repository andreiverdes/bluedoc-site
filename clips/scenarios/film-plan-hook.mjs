// Film, the Plans hook (docs/plans/demo-films.bluedoc.json): Claude Code in plan mode beside the bluedoc page.
// Without bluedoc first: a start scene (a fresh session, the prompt typed, the agent reading), then the plan wall
// ending on Claude Code's proceed picker, its caption held over 4 s. Then a fresh session: the prompt, the
// agent writes and builds the plan, ExitPlanMode is met by the bluedoc gate (its words from hook.py), the page opens,
// the agent waits in the background (a real serve.py wait). The reader accepts the recommendations, adds guests,
// pins a note on the sweeper step and approves; the real approval prints in the terminal and the agent starts on
// rev 1 with the note hook.py gives it.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'plans/saved-carts';
const PROMPT = 'Let shoppers save a cart and come back to it later.';
const NOTE = 'Run it on the existing jobs queue';
const STEP = '.bp-step[data-step="sweeper"] .bp-step-t';
/** Claude Code's welcome box, at the top of each session */
const WELCOME = { html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' };

/** the example plan as the Markdown wall an agent prints in the terminal */
function wall(doc) {
  const plain = (s) => String(s ?? '').replace(/\*\*|`/g, '');
  const out = [`# ${doc.title}`, '', plain(doc.tldr), ''];
  for (const s of doc.sections) {
    out.push(`## ${s.title}`);
    for (const b of s.blocks ?? []) {
      if (b.type === 'text') out.push(...plain(b.md).split('\n'));
      if (b.type === 'steps') b.items.forEach((st, i) => out.push(`${i + 1}. ${plain(st.title)} (${st.effort})`, ...plain(st.md).split('\n').map((l) => `   ${l}`)));
      if (b.type === 'files') b.items.forEach((f) => out.push(`- ${f.path}: ${plain(f.why)}`));
      if (b.type === 'table') b.rows.forEach((r) => out.push(`- ${r.map(plain).join(' · ')}`));
      if (b.type === 'checklist') b.items.forEach((it) => out.push(`- ${plain(it.text)}${it.choices ? ` (${it.choices.map((c) => plain(c.label)).join(' / ')})` : ''}`));
    }
    out.push('');
  }
  return out.filter((l, i, a) => l || a[i - 1]);
}

export default {
  stage: true,
  posterAt: -2.6,
  cursor: [1440, 760],

  prepare({ docs }) {
    // the example plan, saved where the agent writes plans
    mkdirSync(join(docs, 'plans'), { recursive: true });
    cpSync(join(docs, 'acme-saved-carts-plan.bluedoc.json'), join(docs, 'plans/saved-carts.bluedoc.json'));
    cpSync(join(docs, 'acme-saved-carts-plan.bluedoc.history.json'), join(docs, 'plans/saved-carts.bluedoc.history.json'));
    cpSync(join(docs, 'media'), join(docs, 'plans/media'), { recursive: true });
  },

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    this.wall = wall(JSON.parse(readFileSync(this.path, 'utf8')));
    // what the agent's build and the gate print, worked out before the take (a blocking call would stall it)
    const b = spawnSync('python3', [join(c.bd.scripts, 'build.py'), this.path], { env: c.bd.env, cwd: c.bd.work, encoding: 'utf8' });
    this.built = `${b.stdout}\n${b.stderr}`.split('\n').find((l) => /error\(s\)/.test(l)) ?? 'built';
    this.gate = (await s.gate(this.path, `http://${s.shown(await c.bd.urlFor(DOC))}`)).split('\n');
    // the browser already shows bluedoc's home, off stage until the cut
    await c.goto('home');
    await s.layout('solo');
    await t.title('acme-shop — claude (without bluedoc)');
    await t.footer('⏸ plan mode on (shift+tab to cycle)');
    // the start scene opens on a fresh session, before the prompt
    await t.block([WELCOME]);
  },

  async run(c) {
    const s = c.stage, t = s.term;

    // ---- start scene, without bluedoc: the same ask, in plan mode, as everyone does it today ----
    await c.pause(700);
    await t.type(PROMPT, 30);
    await c.pause(300);
    await t.submit();
    await t.gap();
    await t.spin('Planning');
    let id = await t.tool('Read', 'web/src/cart/cartStorage.ts');
    await c.pause(400);
    await t.done(id, ['Read 84 lines']);
    id = await t.tool('Read', 'services/orders-api/src/carts.ts');
    await c.pause(400);
    await t.done(id, ['Read 212 lines']);
    await t.spin(null);

    // ---- the wall and the picker, held long enough to feel it (the caption stays over 4 s) ----
    s.caption('Approve this wall of text?');
    await t.block(this.wall.slice(0, 110), { lps: 48, cls: 'dim' });
    await t.block([
      { html: '<div class="box"><span class="b">Would you like to proceed?</span><br><span class="pick on">❯ 1. Yes, and auto-accept edits</span><br><span class="pick">  2. Yes, and manually approve edits</span><br><span class="pick">  3. No, keep planning</span></div>' },
    ]);
    await c.pause(2200);

    // ---- the cut: a fresh session, with bluedoc ----
    await s.caption(null);
    await t.clear();
    await t.title('acme-shop — claude');
    await t.block([WELCOME]);
    await s.layout('tandem');
    s.caption('Or [answer] it.');
    await c.pause(300);
    await t.type(PROMPT, 30);
    await c.pause(250);
    await t.submit();
    await t.gap();
    await t.spin('Planning');

    id = await t.tool('Read', 'web/src/cart/cartStorage.ts');
    await c.pause(450);
    await t.done(id, ['Read 84 lines']);
    id = await t.tool('Read', 'services/orders-api/src/carts.ts');
    await c.pause(450);
    await t.done(id, ['Read 212 lines']);
    await s.caption(null);
    id = await t.tool('Write', 'docs/plans/saved-carts.bluedoc.json');
    await c.pause(600);
    await t.done(id, ['Wrote 1 lines to docs/plans/saved-carts.bluedoc.json']);
    id = await t.tool('Bash', 'build.py docs/plans/saved-carts.bluedoc.json');
    await c.pause(400);
    await t.done(id, [this.built]);

    // ExitPlanMode meets the gate: the page opens, the agent is told to wait
    id = await t.tool('ExitPlanMode');
    await c.goto(DOC);
    await t.done(id, [s.tidy(this.gate[0].replace(/ \(doc: [^)]*\)/, '')), { text: `… +${this.gate.length - 1} lines (ctrl+o to expand)`, cls: 'faint' }]);
    await t.spin(null);
    const reply = s.wait(this.path);
    id = await t.tool('Bash', 'serve.py wait docs/plans/saved-carts.bluedoc.json --kind any');
    await t.done(id, ['Running in the background (↓ to manage)']);
    await t.say('The plan is open in bluedoc. I’ll pick up your answers there.');

    // ---- the reader, on the page ----
    await c.ev('BP.sidebar({open: false})');
    await c.pause(500);
    await c.moveTo({ sel: '#cv-arch', x: 0.6, y: 0.5 }, { ms: 700 });
    await c.wheel(await c.ev(`document.querySelector('#cv-arch').getBoundingClientRect().top - 60`), { ms: 700 });
    await c.pause(900);
    await c.wheel(await c.ev(`document.querySelector('#questions').getBoundingClientRect().top - 60`), { ms: 700 });
    await c.pause(300);
    await c.click('.bd-anntb .acc', { ms: 650 });
    await c.waitFor(`document.querySelectorAll('#questions .bp-cl-item.has-choices.done').length === 3`);
    await c.pause(500);
    const guests = '#item-decisions-guests';
    await c.wheel(await c.ev(`document.querySelector('${guests}').getBoundingClientRect().top - 200`), { ms: 500 });
    await c.click(`${guests} .bp-opt[data-id=email] .pk`, { ms: 600 });
    await c.waitFor(`document.querySelector('${guests} .bp-opt[data-id=email]').classList.contains('on')`);
    await c.pause(400);

    // a note on the sweeper step
    const step = STEP;
    await c.wheel(await c.ev(`document.querySelector('${step}').getBoundingClientRect().top - 260`), { ms: 650 });
    await c.click('.bd-anntb button[data-m="point"]', { ms: 600 });
    await c.click({ sel: step, x: 0.35, y: 0.5 }, { ms: 600 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.type(NOTE, { cps: 28 });
    await c.click('.bd-cmp:not([hidden]) .bp-btn.primary', { ms: 450 });
    await c.waitFor('BP.annotations().length === 1');
    await c.pause(350);

    // approve
    await c.click('.bd-anntb .approve', { ms: 650 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.pause(900);
    await c.click('.bd-approve .bp-btn.ok', { ms: 500 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.moveTo({ text: 'Approved · rev 1' }, { ms: 650 });

    // ---- the payoff: the agent was already waiting ----
    // the whole reply as wait printed it, folded at its command appendix (## Answering) as Claude Code folds long output
    const all = (await reply).trim().split('\n');
    const cut = all.findIndex((l) => l.startsWith('## Answering'));
    const md = cut > 0 ? all.slice(0, cut) : all;
    const note = s.approvedNote(this.path);
    s.caption('Your agent was [already waiting].');
    await t.gap();
    id = await t.tool('BashOutput', 'serve.py wait');
    await t.done(id, [
      ...md.map((l) => ({ text: s.tidy(l) || ' ', cls: /^(#|---)/.test(l) ? 'hd' : 'ink' })),
      ...(cut > 0 ? [{ text: `… +${all.length - cut} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
    ], { lps: 30 });
    await c.pause(1600);
    id = await t.tool('ExitPlanMode');
    await t.done(id, [s.tidy((await note) || '')]);
    await t.say('Implementing rev 1 with your picks, and the sweeper on the jobs queue.');
    await t.tool('Write', 'services/orders-api/migrations/0012_saved_carts.sql');
    await t.ghost('also add an undo for restore');
    await c.pause(2600);
  },
};
