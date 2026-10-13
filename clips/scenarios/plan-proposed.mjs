// Plans: tell the proposed parts from the live ones. The Approach canvas draws what the plan adds (the Saved carts
// panel, the saved_carts table, the sweeper) amber and dashed; the Save a cart flow runs from the shopper through them.
// The clip is one turn of the flow, so it loops on step 1.
const CV = '#cv-arch';

export const crf = 26; // a blueprint's grid and glow

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 2.4,
  cursor: [1180, 700], // idle on the caption bar, clear of the drawing

  async setup(c) {
    await c.waitForSelector(CV);
    await c.ev(`BP.sidebar({ open: false })`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    await c.click(`${CV} .bp-tb button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('arch').k > 0.5`);
    await c.pause(800);
    // start the Save a cart flow over, as picking it in the Flow menu does, so the clip opens on step 1
    await c.ev(`(() => { const s = document.querySelector('${CV} .bp-tb select'); s.value = '0'; s.dispatchEvent(new Event('change')); })()`);
  },

  async run(c) {
    // steps take 1.2 s each (BP.state counts them from 0); end as the flow starts over, where the clip began (the
    // harness waits 0.4 s before it)
    await c.waitFor(`BP.state('arch').step === 2`, 8000);
    await c.waitFor(`BP.state('arch').step === 0`, 8000);
    await c.pause(400);
  },
};
