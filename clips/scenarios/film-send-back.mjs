// Film, Send it back (docs/plans/demo-films.bluedoc.json): in plan mode, saying no to a plan makes it disappear.
// With bluedoc the saved carts plan is already open and the agent waits (a real serve.py wait). The reader pins one
// note on the sweeper step and sends Request changes; the real change request lands in the terminal, the agent runs
// a real build.py patch that rewrites the step and resolves that comment, and waits again. The page opens rev 2 with
// the step marked word by word and the comment resolved; the reader approves, the real approval prints.
import { cpSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'plans/saved-carts';
const REL = 'docs/plans/saved-carts.bluedoc.json';
const NOTE = 'Run it on the existing jobs queue';
const STEP = '.bp-step[data-step="sweeper"] .bp-step-t';
const MD = 'Runs on the existing jobs queue at 03:10 UTC, in batches of 1,000 rows. Deletes carts unused for longer than the retention you pick.';

/** a long real reply, folded at its command appendix as Claude Code folds long output */
function fold(s, text, max = 14) {
  const all = text.trim().split('\n');
  let cut = all.findIndex((l) => l.startsWith('## Answering'));
  if (cut < 0) cut = all.length;
  cut = Math.min(cut, max);
  return [
    ...all.slice(0, cut).map((l) => ({ text: s.tidy(l) || ' ', cls: /^(#|---)/.test(l) ? 'hd' : 'ink' })),
    ...(cut < all.length ? [{ text: `… +${all.length - cut} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
  ];
}

export default {
  stage: true,
  posterAt: -2.4,
  cursor: [1440, 760],

  prepare({ docs }) {
    mkdirSync(join(docs, 'plans'), { recursive: true });
    cpSync(join(docs, 'acme-saved-carts-plan.bluedoc.json'), join(docs, 'plans/saved-carts.bluedoc.json'));
    cpSync(join(docs, 'acme-saved-carts-plan.bluedoc.history.json'), join(docs, 'plans/saved-carts.bluedoc.history.json'));
    cpSync(join(docs, 'media'), join(docs, 'plans/media'), { recursive: true });
  },

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    this.gate = (await s.gate(this.path, `http://${s.shown(await c.bd.urlFor(DOC))}`)).split('\n');
    await c.goto(DOC);
    await c.ev('BP.sidebar({open: false})');
    await c.wheel(await c.ev(`document.querySelector('${STEP}').getBoundingClientRect().top - 300`), { ms: 50 });
    await s.layout('tandem');
    await t.title('acme-shop — claude');
    await t.footer('⏸ plan mode on (shift+tab to cycle)');
    await t.block([{ text: '> Let shoppers save a cart and come back to it later.', cls: 'dim' }]);
    await t.gap();
  },

  async run(c) {
    const s = c.stage, t = s.term;
    s.caption('Said no? The plan disappears.');
    await c.pause(1200);
    let id = await t.tool('ExitPlanMode');
    await t.done(id, [s.tidy(this.gate[0].replace(/ \(doc: [^)]*\)/, '')), { text: `… +${this.gate.length - 1} lines (ctrl+o to expand)`, cls: 'faint' }]);
    let reply = s.wait(this.path); reply.catch(() => {});
    id = await t.tool('Bash', `serve.py wait ${REL} --kind any`);
    await t.done(id, ['Running in the background (↓ to manage)']);
    await t.say('The plan is open in bluedoc. I’ll wait for your review.');
    await c.pause(1300);

    // the reader: one note on the sweeper step, then Request changes
    s.caption('Send it [back] instead.');
    await c.click('.bd-anntb button[data-m="point"]', { ms: 600 });
    await c.click({ sel: STEP, x: 0.35, y: 0.5 }, { ms: 600 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.type(NOTE, { cps: 26 });
    await c.click('.bd-cmp:not([hidden]) .bp-btn.primary', { ms: 450 });
    await c.waitFor('BP.annotations().length === 1');
    await c.pause(300);
    await c.click('.bd-anntb .go', { ms: 600 });
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.pause(500);
    await c.click('.bd-chgs .bp-btn.primary', { ms: 500 });
    await c.waitFor(`BP.planState().state === 'changes'`);

    // the real change request, the real patch
    const req = await reply;
    const cid = (req.match(/\((c[a-z0-9]+)\)/) || [])[1];
    if (!cid) throw new Error(`no comment id in the reply:\n${req}`);
    s.caption(null);
    await t.gap();
    id = await t.tool('BashOutput', 'serve.py wait');
    await t.done(id, fold(s, req, 9), { lps: 30 });
    await c.pause(600);
    await t.spin('Revising');
    const p = s.py('build.py', 'patch', this.path, 'step:steps/0/sweeper', '--set', `md=${MD}`,
      '--change', 'Step 6 runs on the existing jobs queue.', '--resolves', cid);
    id = await t.tool('Bash', `build.py patch ${REL} step:steps/0/sweeper --set md=… --resolves ${cid}`);
    const out = await p;
    if (out.code) throw new Error(`patch failed:\n${out.out}`);
    const lines = out.out.trim().split('\n').filter(Boolean);
    await t.done(id, [...lines.slice(0, 3).map((l) => s.tidy(l)), ...(lines.length > 3 ? [{ text: `… +${lines.length - 3} lines (ctrl+o to expand)`, cls: 'faint' }] : [])]);
    await t.spin(null);
    reply = s.wait(this.path); reply.catch(() => {});
    id = await t.tool('Bash', `serve.py wait ${REL} --kind any`);
    await t.done(id, ['Running in the background (↓ to manage)']);
    await t.say('Rev 2: the sweeper now runs on the jobs queue.');

    // the reader opens rev 2's diff
    await c.goto(DOC, 'diff=1');
    await c.waitFor(`!!window.BP && BP.planState().rev === '2'`);
    await c.ev('BP.sidebar({open: false})');
    await c.pause(500);
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 600 });
    await c.pause(1700);
    await c.click('.bd-revtb .go', { ms: 600 });
    await c.waitForSelector('.bd-anntb .approve');
    // the comment, resolved by the agent in rev 2
    await c.ev('BP.sidebar({open: true})');
    await c.pause(400);
    await c.click('button[data-f="resolved"]', { ms: 600 });
    await c.pause(1500);
    await c.ev('BP.sidebar({open: false})');
    await c.pause(300);
    await c.click('.bd-anntb .approve', { ms: 650 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.pause(600);
    await c.click('.bd-approve .bp-btn.ok', { ms: 500 });
    await c.waitFor(`BP.planState().state === 'approved'`);

    const note = s.approvedNote(this.path);
    s.caption('Rev 2, every change marked.');
    await t.gap();
    id = await t.tool('BashOutput', 'serve.py wait');
    await t.done(id, fold(s, await reply, 6), { lps: 30 });
    id = await t.tool('ExitPlanMode');
    await t.done(id, [s.tidy((await note) || '')]);
    await c.pause(2800);
  },
};
