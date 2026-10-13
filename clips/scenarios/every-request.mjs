// Every doc type: Request changes · 2 opens the dialog with the Markdown the agent gets; Send, and the chip at the top
// of the page reads Changes requested.
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
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.pause(400);
    // the preview: what the agent reads
    await c.moveTo({ sel: '.bd-chgs pre', x: 0.55, y: 0.45 }, { ms: 600 });
    await c.pause(1100);
    await c.click('.bd-chgs .bp-btn.primary', { ms: 550 });
    await c.waitFor(`BP.planState().state === 'changes'`);
    await c.pause(300);
    await c.moveTo({ text: 'Changes requested' }, { ms: 750 });
    await c.pause(1300);
  },
};
