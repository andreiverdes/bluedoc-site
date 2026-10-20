// Every doc type: a page without approval (here a status report) sends ticks and picks with Send answers. Pick the
// rollout date, tick a task: Send answers turns green, and opens a dialog with what goes to the agent.
export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('#cb-next-fulfilment');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the Next week heading under the app bar: the open decision, then the Week 42 tasks
    await c.ev(`window.scrollTo({top: document.querySelector('#next').getBoundingClientRect().top + scrollY - 60, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click('#item-decide-saved-carts .bp-opt[data-id="oct26"] .pk', { ms: 650 });
    await c.pause(350);
    await c.click('#cb-next-fulfilment', { ms: 650 });
    await c.waitFor(`BP.progress().every((p) => p.done === p.total)`);
    await c.pause(500);
    await c.click('.bd-anntb .send', { ms: 700 });
    await c.waitForSelector('.bd-send:not(.bd-chgs) .bp-btn.primary');
    await c.pause(300);
    await c.moveTo({ text: '2 of 2 steps ticked' }, { ms: 600 });
    await c.pause(1300);
  },
};
