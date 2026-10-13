// Docs: a node's notes and source anchors. A click on fulfilment-worker opens its card under the drawing: what it
// does and the `path:line` it lives at. The card's × closes it, back to the start.
const CV = '#cv-orders';
const node = (key) => `${CV} .bp-node[data-key="${key}"]`;

export default {
  doc: 'acme-orders',
  posterAt: 2.2,
  cursor: [1010, 470],

  async setup(c) {
    await c.waitForSelector(CV);
    await c.addStyle(`${CV} .bp-hint { display: none !important; }`); // the hint fades at the first touch
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    await c.click(`${CV} .bp-tb button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
  },

  async run(c) {
    const FIT = `${CV} .bp-tb button[aria-label="Fit drawing"]`;
    await c.pause(500);

    // the card opens under the drawing and the stage gets shorter: Fit frames the drawing in what is left
    await c.click({ sel: node('fulfil'), x: 0.5, y: 0.45 }, { ms: 600 });
    await c.waitFor(`!document.querySelector('${CV} .bp-detail').hidden`, 2000);
    await c.pause(250);
    await c.click(FIT, { ms: 550 });
    await c.pause(450);
    // rest on the source anchor while it reads
    await c.moveTo({ sel: `${CV} .bp-detail li code`, x: 0.8, y: 0.75 }, { ms: 550 });
    await c.pause(1500);

    // close the card, and Fit the drawing to the whole stage again
    await c.click(`${CV} .bp-detail .x`, { ms: 550 });
    await c.waitFor(`document.querySelector('${CV} .bp-detail').hidden`, 2000);
    await c.pause(150);
    await c.click(FIT, { ms: 450 });
    await c.pause(450);
    await c.moveTo([1010, 470], { ms: 550 });
    await c.pause(200);
  },
};
