// Every doc type: a page without approval (here a status report) sends ticks and picks with Send answers. Tick a task,
// pick the rollout date: Send answers turns green, and opens a dialog with what goes to the agent.
export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('#cb-next-fulfilment');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the Next week heading under the app bar, its three items in view
    await c.ev(`window.scrollTo({top: document.querySelector('#next').getBoundingClientRect().top + scrollY - 60, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click('#cb-next-fulfilment', { ms: 650 });
    await c.pause(350);
    await c.click({ text: '26 October', in: '#item-next-saved-carts' }, { ms: 650 });
    await c.waitFor(`BP.progress()[0].done === 2`);
    await c.pause(500);
    await c.click('.bd-anntb .send', { ms: 700 });
    await c.waitForSelector('.bd-send:not(.bd-chgs) .bp-btn.primary');
    await c.pause(300);
    await c.moveTo({ text: '1 of 2 steps ticked' }, { ms: 600 });
    await c.pause(1300);
  },
};
