// Docs: a data flow runs across the systems. The Production path plays from its first step: a token rides each edge
// with its payload (draft, total, INSERT, event), the caption under the drawing counts Step n of 6.
const CV = '#cv-orders';

export default {
  doc: 'acme-orders',
  posterAt: 1.9,
  cursor: [1180, 700], // idle on the caption bar, clear of the drawing

  async setup(c) {
    await c.waitForSelector(CV);
    await c.addStyle(`${CV} .bp-hint { display: none !important; }`); // the how-to hint, as the other drawing clips
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    await c.click(`${CV} .bp-tb button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
    // start the flow over, as picking it in the Flow menu does, so the clip opens on step 1 (the recording starts
    // a moment after setup ends)
    await c.ev(`document.querySelector('${CV} .bd-selm[aria-label=Flow] [role=option][data-v="0"]').click()`);
    await c.waitFor(`BP.state('orders').step === 0`, 2000);
  },

  async run(c) {
    // steps take 1.2 s each, plus a short beat at the node they reach
    await c.waitFor(`BP.state('orders').step === 4`, 8000);
    await c.pause(500);
  },
};
