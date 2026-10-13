// Docs: a runbook step jumps to the system it runs. Start the fulfilment worker is open; its ref key (consume) scrolls
// up to the drawing and flies it into fulfilment-worker › consume, whose card links back to the step.
const CV = '#cv-orders';
const ITEM = '#item-local-worker';

export default {
  doc: 'acme-orders',
  posterAt: -0.5,
  cursor: [1000, 600],

  async setup(c) {
    await c.waitForSelector(ITEM);
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.ev(`document.querySelector('${ITEM} .bp-cl-head').click()`);
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('open')`);
    // the open step in the middle of the window
    await c.ev(`document.querySelector('${ITEM}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);

    await c.click(`${ITEM} .bp-ref`, { ms: 650 });
    // the page scrolls to the drawing, then the drawing flies into the worker's consume step
    await c.waitFor(`BP.state('orders').focus.join() === 'fulfil'`, 4000);
    await c.waitFor(`BP.state('orders').k > 2 && !BP.canvases.orders._anim`, 3000);
    await c.pause(300);
    // point at the node it opened
    await c.moveTo({ sel: `${CV} .bp-node[data-key="fulfil/consume"]`, x: 0.5, y: 0.75 }, { ms: 650 });
    await c.pause(1500);
  },
};
