// Every doc type: an item is a conversation. Before the take, the reader asks on the retention question and Request
// changes sends it (rev 1); the agent answers with build.py patch --reply (rev 2). The question opens with the reply
// marked New under the reader's message; a follow-up is typed, saved and sent: it lists as the reader's message at rev 2
// and the box empties.
const ITEM = '#item-decisions-retention';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 470],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .bp-note-ta`);
    await c.ev(`BP.setNote('decisions/retention', 'What does 180 days cost in storage?')`);
    await c.ev(`document.querySelector('.bd-key.go').click()`);
    await c.waitFor(`(d => !!d && !d.querySelector('.ft .bp-btn:last-child').hidden)(document.querySelector('.bd-chgs[open]'))`);
    await c.ev(`document.querySelector('.bd-chgs[open] .ft .bp-btn:last-child').click()`);
    await c.waitFor(`BP.thread('decisions/retention').length === 1`);
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-saved-carts-plan'), 'item:decisions/retention',
      '--reply', 'About **1.8 GB** at Acme’s volume, under $1 a month. 90 days halves it.');
    await c.reload();
    await c.waitFor(`BP.thread('decisions/retention').some((m) => m.who === 'agent' && m.new)`);
    // the Updated since strip and the panels would crowd the frame
    await c.ev(`[...document.querySelectorAll('button[aria-label=Dismiss]')].forEach((b) => b.click())`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the conversation and its reply box mid-frame
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM} .bp-msg').getBoundingClientRect().top + scrollY - 330, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(800);
    await c.click({ sel: `${ITEM} .bp-note-ta`, x: 0.3 }, { ms: 650 });
    await c.pause(200);
    await c.type('Fine, keep 180 days.', { cps: 26 });
    await c.pause(200);
    await c.click(`${ITEM} .bp-note .bp-btn.primary`, { ms: 450 });
    await c.pause(250);
    await c.click('.bd-key.go', { ms: 650 });
    await c.waitFor(`(d => !!d && !d.querySelector('.ft .bp-btn:last-child').hidden)(document.querySelector('.bd-chgs[open]'))`);
    await c.pause(450);
    await c.click('.bd-chgs[open] .ft .bp-btn:last-child', { ms: 550 });
    await c.waitFor(`BP.thread('decisions/retention').length === 3 && !document.querySelector('${ITEM} .bp-note-ta').value`);
    await c.pause(300);
    await c.moveTo({ sel: `${ITEM} .bp-msg:last-of-type`, x: 0.3, y: 0.5 }, { ms: 600 });
    await c.pause(1400);
  },
};
