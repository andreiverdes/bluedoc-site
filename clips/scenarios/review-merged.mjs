// Reviews (hero): #412 in Merged view. Each finding's full row sits right under the lines it is about (createOrder.ts,
// then the bulkSavingsCents finding); Show more lines widens tiers.ts's range to the top of the file.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

// the tiers.ts group (marked in setup: its place among the groups is an implementation detail)
const TIERS = '#pr-412 .bd-mg[data-clip="tiers"]';

export default {
  doc: 'acme-review-findings',
  posterAt: 1.2,
  cursor: [880, 420],

  async setup(c) {
    await findingsView(c, 'pr-412', 'merged');
    // createOrder.ts's changed lines and its finding under the view bar, tiers.ts's Show more lines above the tool tray
    await scrollTop(c, '#pr-412 .bd-mg.bd-xf', 0);
    await c.ev(`[...document.querySelectorAll('#pr-412 .bd-mg.bd-xf')].find((g) => g.querySelector('.bd-fh b')?.textContent === 'tiers.ts').dataset.clip = 'tiers'`);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo({ sel: '#pr-412 .bd-mg.bd-xf .bd-ln.hit', x: 0.42 }, { ms: 650 });
    await c.pause(400);
    await c.moveTo({ text: 'also counts the coupon', in: '#pr-412 .bd-mg.bd-xf' }, { ms: 550 });
    await c.pause(700);
    const lines = await c.ev(`document.querySelector(${JSON.stringify(TIERS)}).querySelectorAll('.bd-ln').length`);
    await c.click(`${TIERS} .bd-mmore`, { ms: 650 });
    await c.waitFor(`document.querySelector(${JSON.stringify(TIERS)}).querySelectorAll('.bd-ln').length > ${lines}`);
    await c.pause(500);
    // down to the TIERS table and the finding under it
    await c.moveTo([880, 520], { ms: 500 });
    await c.wheel(500, { ms: 1000 });
    await c.pause(1300);
  },
};
