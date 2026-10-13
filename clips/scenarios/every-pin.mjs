// Every doc type: Point (C), click orders-api in the blueprint, write the change in the composer, Save; the pin
// stays on the node and the comment waits in the Comments panel.

export default {
  doc: 'acme-orders',
  posterAt: -0.4,
  cursor: [760, 470],

  async setup(c) {
    await c.waitForSelector('.bd-anntb');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    // the blueprint's top row in the middle of the frame, above the tool tray
    await c.ev(`window.scrollTo({top: document.querySelector('#cv-orders').getBoundingClientRect().top + scrollY - 140, behavior: 'instant'})`);
  },

  async run(c) {
    await c.pause(600);
    await c.click('.bd-anntb button[data-m="point"]', { ms: 600 });
    await c.pause(250);
    await c.click({ sel: '#cv-orders .bp-node[data-key="api"]', x: 0.5, y: 0.45 }, { ms: 650 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(200);
    await c.type('Show the retry policy here', { cps: 26 });
    await c.pause(300);
    await c.click('.bd-cmp:not([hidden]) .bp-btn.primary', { ms: 500 });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(400);
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.6 }, { ms: 650 });
    await c.pause(1100);
  },
};
