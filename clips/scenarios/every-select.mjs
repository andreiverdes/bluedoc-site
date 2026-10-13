// Every doc type: Select (T), drag over a TL;DR phrase, write the change, Save; the phrase stays marked and the
// comment waits in the Comments panel.
export default {
  doc: 'acme-orders',
  posterAt: -0.4,
  cursor: [760, 520],

  async setup(c) {
    await c.waitForSelector('.bd-anntb');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    await c.ev(`window.scrollTo({top: document.querySelector('.bd-tldr').getBoundingClientRect().top + scrollY - 120, behavior: 'instant'})`);
  },

  async run(c) {
    await c.pause(500);
    await c.click('.bd-anntb button[data-m="select"]', { ms: 600 });
    await c.pause(250);
    await c.selectText('the event never left the outbox', { ms: 850 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(200);
    await c.type('Link the relay runbook', { cps: 26 });
    await c.pause(250);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(350);
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.6 }, { ms: 600 });
    await c.pause(1000);
  },
};
