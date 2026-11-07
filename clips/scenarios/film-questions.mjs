// Film, Questions (docs/plans/demo-films.bluedoc.json): the agent needs four answers before it goes on.
// 0–3 s without bluedoc: the terminal question picker, its one-line box cut off mid-answer. Then a fresh session: the
// prompt, the agent puts its four questions on one page (a real `serve.py open`), waits in the background (a real
// `serve.py wait`). The reader picks on the option rows (the starred recommendations), writes a longer note on the
// expiry question and presses Send answers; the real reply prints in the terminal and the agent goes on.
// The page is a copy of the acme-status example cut down to its decision checklist, with three more decision items,
// all made with build.py patch in prepare.
import { cpSync } from 'node:fs';
import { join } from 'node:path';

export const view = { width: 1600, height: 1000, dpr: 2 };
export const crf = 26;

const DOC = 'saved-carts-rollout';
const PROMPT = 'Schedule the saved carts rollout for next week.';
const NOTE = 'Business accounts reorder every quarter: give them 90 days, everyone else 30.';
const PAIN = 'Business accounts reorder every quarter, so give them 90 days and everyone else 30; and tell me how many more rows that adds';
const item = (id) => `#item-decide-${id}`;
const opt = (q, o) => `${item(q)} .bp-opt[data-id="${o}"] .pk`;

const ITEMS = [
  {
    id: 'audience', text: 'Who gets saved carts first?',
    sub: 'Recommend signed-in shoppers: their carts already live in orders-api.',
    recommend: 'signed-in',
    choices: [
      { id: 'signed-in', label: 'Signed-in shoppers', md: 'Their carts are already stored server-side; no guest data to keep.' },
      { id: 'everyone', label: 'Everyone, guests too', md: 'Guest carts need a device cookie and a cleanup job: about one more week of work.' },
      { id: 'business', label: 'Business accounts first', md: 'About 400 accounts: a small group to learn from before everyone else.' },
    ],
  },
  {
    id: 'expiry', text: 'How long does a saved cart last?',
    sub: 'Recommend 30 days: 94% of shoppers who come back do so within a week.',
    recommend: 'd30',
    choices: [
      { id: 'd30', label: '30 days', md: 'Covers almost every returning shopper; the sweeper keeps the table small.' },
      { id: 'd90', label: '90 days', md: 'Covers quarterly reorders; about three times the rows.' },
      { id: 'forever', label: 'Until the shopper removes it', md: 'Nothing expires; the table only grows.' },
    ],
  },
  {
    id: 'prices', text: 'Which prices does a restored cart show?',
    sub: "Recommend today's prices, with a notice when one changed.",
    recommend: 'notice',
    choices: [
      { id: 'notice', label: "Today's prices, with a notice", md: 'Shoppers see what changed before they pay.' },
      { id: 'saved', label: 'The prices when saved', md: 'Honours old prices: costs margin after a price rise.' },
      { id: 'silent', label: "Today's prices, silently", md: 'Simplest; a changed total can surprise at checkout.' },
    ],
  },
];

export default {
  stage: true,
  posterAt: -1.2,
  cursor: [1440, 760],

  prepare(ctx) {
    // the questions page: a copy of acme-status, cut down to its open decision, plus three more
    const doc = join(ctx.docs, `${DOC}.bluedoc.json`);
    cpSync(join(ctx.docs, 'acme-status.bluedoc.json'), doc);
    const p = (...a) => ctx.py('build.py', 'patch', doc, ...a);
    p('meta', '--json', JSON.stringify({ rev: '1', kind: 'Questions', date: '2026-10-12' }), '--no-bump');
    p('doc', '--no-bump', '--json', JSON.stringify({
      id: DOC,
      title: 'Saved carts rollout: four questions',
      subtitle: 'What I need from you before I schedule the saved carts rollout.',
      hero: { icon: 'list', value: '4', label: 'questions before rollout' },
      tldr: 'The saved carts plan is approved and the migration is ready. Before I schedule the rollout I need four answers: when it starts, who gets it first, how long a saved cart lasts, and which prices a restored cart shows.',
      state: [{ label: 'plan approved, rev 1', kind: 'ok' }, { label: 'rollout waits on 4 answers', kind: 'warn' }],
      links: [{ label: 'Saved carts plan', href: 'acme-saved-carts-plan.bluedoc.json' }],
      changes: ['Four questions before the saved carts rollout.'],
    }));
    p('section:incidents', '--delete', '--no-bump');
    p('section:numbers', '--delete', '--no-bump');
    p('block:next/1', '--delete', '--no-bump');
    p('section:next', '--json', JSON.stringify({ title: 'Questions', lead: 'Pick an answer on each; a comment on any of them overrides its pick.' }), '--no-bump');
    p('block:next/0', '--set', 'title=Before I schedule the rollout', '--no-bump');
    for (const it of ITEMS) p('block:next/0', '--append', JSON.stringify(it), '--no-bump');
  },

  async setup(c) {
    const s = c.stage, t = s.term;
    this.path = c.bd.docPath(DOC);
    await c.goto('home');
    await s.layout('solo');
    await t.title('acme-shop — claude (without bluedoc)');
    await t.block([
      { text: PROMPT, cls: 'u' },
      ' ',
      { html: '<span class="dot" style="color:#fff">●</span> Before I schedule it I have four questions.' },
      ' ',
      // the question picker: its free-text option is one line, typed into mid-answer
      { html: '<div class="box"><span class="dim">←</span> <span style="color:#7fd18b">☒ Start</span>  <span style="color:#7fd18b">☒ Audience</span>  <span class="b" style="background:#2b3550;padding:0 4px">☐ Expiry</span>  <span class="dim">☐ Prices  ✔ Submit</span> <span class="dim">→</span><br><br><span class="b">How long does a saved cart last?</span><br><span class="pick">  1. 30 days</span><br><span class="pick">  2. 90 days</span><br><span class="pick">  3. Until the shopper removes it</span><br><span class="pick on" style="display:flex;white-space:pre"><span style="flex:none">❯ 4. </span><span id="fq-line" style="flex:1;min-width:0;overflow:hidden"><span id="fq-typed"></span>▏</span></span></div>' },
      { text: 'Enter to select · Tab/Arrow keys to navigate · Esc to cancel', cls: 'faint' },
    ]);
    await this.typeLine(c, PAIN.slice(0, 60));
  },

  /** sets the picker's one-line box to text, scrolled to its end as a terminal input is */
  typeLine(c, text) {
    return c.stage.tab.ev(`(() => { const l = document.getElementById('fq-line'); document.getElementById('fq-typed').textContent = ${JSON.stringify(text)}; l.scrollLeft = l.scrollWidth; })()`);
  },

  async run(c) {
    const s = c.stage, t = s.term;

    // ---- 0–3 s: without bluedoc, the picker's one-line box runs out of room mid-answer ----
    s.caption('Four questions, a one-line answer box?');
    await c.pause(500);
    for (let n = 61; n <= PAIN.length; n++) {
      await this.typeLine(c, PAIN.slice(0, n));
      await c.pause(PAIN[n - 1] === ' ' ? 22 : 34);
    }
    await c.pause(900);

    // ---- the cut: a fresh session, with bluedoc ----
    await s.caption(null);
    await t.clear();
    await t.title('acme-shop — claude');
    await t.block([{ html: '<div class="box"><span style="color:var(--t-accent)">✻</span> Welcome to <span class="b">Claude Code</span><br><span class="dim">cwd: ~/acme-shop</span></div>' }]);
    await s.layout('tandem');
    s.caption('Answer them on one [page].');
    await c.pause(200);
    await t.type(PROMPT, 32);
    await c.pause(200);
    await t.submit();
    await t.gap();
    await t.spin('Thinking');
    let id = await t.tool('Read', 'docs/acme-saved-carts-plan.bluedoc.json');
    await c.pause(400);
    await t.done(id, ['Read 1 lines']);
    await t.say('I need four answers first. I’ll put them on one page.');
    id = await t.tool('Write', `docs/${DOC}.bluedoc.json`);
    await c.pause(500);
    await t.done(id, [`Wrote 1 lines to docs/${DOC}.bluedoc.json`]);
    id = await t.tool('Bash', `serve.py open docs/${DOC}.bluedoc.json --to "Claude Code"`);
    const opened = await s.py('serve.py', 'open', this.path, '--to', 'Claude Code');
    if (opened.code !== 0) throw new Error(`serve.py open: ${opened.out}`);
    // the URL it printed, as the reader's address bar shows it (bluedoc's port, without the one-hour key token)
    const url = opened.out.trim().split('\n').at(-1);
    await c.goto(DOC);
    await t.done(id, [`http://${s.shown(url)}`]);
    await t.spin(null);
    const reply = s.wait(this.path);
    reply.catch(() => {}); // a failed take stops the wait: the take's own error is the one to report
    id = await t.tool('Bash', `serve.py wait docs/${DOC}.bluedoc.json --kind any`);
    await t.done(id, ['Running in the background (↓ to manage)']);
    await s.caption(null);

    // ---- the reader, on the page ----
    await c.ev('BP.sidebar({open: false})');
    await c.pause(400);
    await c.wheel(await c.ev(`document.querySelector('#next').getBoundingClientRect().top - 50`), { ms: 650 });
    await c.pause(250);
    await c.click(opt('saved-carts', 'oct19'), { ms: 600 });
    await c.pause(250);
    await c.click(opt('audience', 'signed-in'), { ms: 550 });
    await c.pause(250);
    await c.wheel(await c.ev(`document.querySelector('${item('expiry')}').getBoundingClientRect().top - 70`), { ms: 550 });
    await c.click(opt('expiry', 'd30'), { ms: 550 });
    await c.pause(200);
    // a longer note in the item's comment box (a decision's box shows under its options, open or closed)
    await c.click({ sel: `${item('expiry')} .bp-note-ta`, x: 0.3 }, { ms: 550 });
    await c.type(NOTE, { cps: 34 });
    await c.pause(200);
    await c.click(`${item('expiry')} .bp-note .bp-btn.primary`, { ms: 450 });
    await c.pause(250);
    await c.wheel(await c.ev(`document.querySelector('${item('prices')}').getBoundingClientRect().top - 120`), { ms: 550 });
    await c.click(opt('prices', 'notice'), { ms: 550 });
    await c.pause(300);
    await c.click('.bd-anntb .send', { ms: 650 });
    await c.waitForSelector('.bd-send:not(.bd-chgs) .bp-btn.primary');
    await c.pause(700);
    await c.click('.bd-send:not(.bd-chgs) .bp-btn.primary', { ms: 500 });
    await c.moveTo([1440, 760], { ms: 650 }); // back where the loop starts, off the picks

    // ---- the payoff: every answer, in one reply ----
    const all = (await reply).trim().split('\n');
    const cut = all.findIndex((l) => l.startsWith('## Answering'));
    const md = cut > 0 ? all.slice(0, cut) : all;
    while (md.length && !md.at(-1).trim()) md.pop();
    s.caption('Every answer, in one reply.');
    await t.gap();
    id = await t.tool('BashOutput', 'serve.py wait');
    await t.done(id, [
      ...md.map((l) => ({ text: s.tidy(l) || ' ', cls: /^(#|---)/.test(l) ? 'hd' : 'ink' })),
      ...(cut > 0 ? [{ text: `… +${all.length - cut} lines (ctrl+o to expand)`, cls: 'faint' }] : []),
    ], { lps: 30 });
    await c.pause(1500);
    await t.say('Scheduling 19 October for signed-in shoppers: 90 days for business accounts, 30 for everyone else.');
    await c.pause(2400);
  },
};
