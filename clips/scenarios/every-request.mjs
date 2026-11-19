// Every doc type: Request changes · 2 opens the send dialog with what the agent gets (the two comments, then the
// picks); Send, and the chip at the top of the page reads Changes requested.
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .go');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // two change requests waiting: a comment on a TL;DR phrase and one on a decision
    await c.ev(`BP.annotate({type: 'text', key: 'tldr', quote: 'four /v1/saved-carts routes', note: 'List the four routes'})`);
    await c.ev(`BP.setNote('decisions/prices', 'Show the notice text shoppers see')`);
    await c.waitFor(`/2/.test(document.querySelector('.bd-anntb .go').textContent)`);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .go', { ms: 650 });
    await c.waitForSelector('dialog.bd-chgs[open] .ft .pri');
    await c.pause(400);
    // what the agent reads: the comments, each on its spot
    await c.moveTo({ sel: 'dialog.bd-chgs[open] .sd-cm .bp-msg:last-child', x: 0.7, y: 0.85 }, { ms: 600 });
    await c.pause(1100);
    await c.click('dialog.bd-chgs[open] .ft .pri', { ms: 550 });
    await c.waitFor(`BP.planState().state === 'changes' && !document.querySelector('dialog.bd-chgs[open]')`);
    await c.pause(300);
    // just under the chip, so its words stay readable
    const [x, y] = await c.point({ text: 'Changes requested' });
    await c.moveTo([x + 24, y + 20], { ms: 750 });
    await c.pause(1300);
  },
};
