// Every doc type: a question is a conversation. Before the take, the reader asks on the retention question and Request
// changes sends it (rev 1); the agent answers with build.py patch --reply (rev 2). The question opens with the reply
// marked New under the reader's message; a follow-up is typed, saved and sent with Request changes: it lists as the
// reader's message at rev 2 and the field empties.
const ITEM = '#item-decisions-retention';
const REPLY = `${ITEM} > .ac-reply`;
const SEND = 'dialog.bd-chgs[open] .ft .pri';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 470],

  async setup(c) {
    await c.waitForSelector(`${REPLY} textarea`);
    await c.ev(`BP.setNote('decisions/retention', 'What does 180 days cost in storage?')`);
    await c.ev(`document.querySelector('.bd-key.go').click()`);
    await c.waitForSelector(SEND);
    await c.ev(`document.querySelector('${SEND}').click()`);
    await c.waitFor(`BP.thread('decisions/retention').length === 1`);
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-saved-carts-plan'), 'item:decisions/retention',
      '--reply', 'About **1.8 GB** at Acme’s volume, under $1 a month. 90 days halves it.');
    await c.reload();
    await c.waitFor(`BP.thread('decisions/retention').some((m) => m.who === 'agent' && m.new)`);
    // the Updated strip and the panes would crowd the frame
    await c.ev(`document.querySelector('.bd-revbar.upd button[aria-label="Dismiss"], .bd-revbar.upd .x')?.click()`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.ev(`BP.contents({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the question's head under the app bar, the conversation and its reply field mid-frame
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 76, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(800);
    await c.click({ sel: `${REPLY} textarea`, x: 0.3 }, { ms: 650 });
    await c.pause(200);
    await c.type('Fine, keep 180 days.', { cps: 26 });
    await c.pause(200);
    await c.click(`${REPLY} .ac-go`, { ms: 450 });
    await c.pause(250);
    await c.click('.bd-key.go', { ms: 650 });
    await c.waitForSelector(SEND);
    await c.pause(450);
    await c.click(SEND, { ms: 550 });
    await c.waitFor(`BP.thread('decisions/retention').length === 3 && !document.querySelector('${REPLY} textarea').value && !document.querySelector('${SEND}')`);
    await c.pause(300);
    await c.moveTo({ sel: `${ITEM} .ac-convo .bp-msg:last-of-type`, x: 0.3, y: 0.5 }, { ms: 600 });
    await c.pause(1400);
  },
};
