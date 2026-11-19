// Reviews (hero): #412 in Merged view. Each finding sits with the lines it is about, its answers under them
// (createOrder.ts, the bulkSavingsCents finding); Show more lines widens the excerpt up the file, and a scroll moves on
// to tiers.ts and its findings.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

// the createOrder.ts group, the first file group (the Whole change group above it has no lines)
const GROUP = '#pr-412 .bd-mg.bd-xf';

export default {
  doc: 'acme-review-findings',
  posterAt: 1.2,
  cursor: [880, 420],

  async setup(c) {
    await findingsView(c, 'pr-412', 'merged');
    // createOrder.ts's file bar right under the PR's sticky header
    await scrollTop(c, GROUP, 150);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo({ text: 'also counts the coupon', in: GROUP }, { ms: 600 });
    await c.pause(500);
    await c.moveTo({ sel: `${GROUP} .bd-ln.hit`, x: 0.42 }, { ms: 550 });
    await c.pause(600);
    const lines = await c.ev(`document.querySelector(${JSON.stringify(GROUP)}).querySelectorAll('.bd-ln').length`);
    await c.click(`${GROUP} .bd-mmore`, { ms: 600 });
    await c.waitFor(`document.querySelector(${JSON.stringify(GROUP)}).querySelectorAll('.bd-ln').length > ${lines}`);
    await c.pause(900);
    // down to tiers.ts and its findings
    await c.moveTo([880, 520], { ms: 500 });
    await c.wheel(560, { ms: 1000 });
    await c.pause(1300);
  },
};
