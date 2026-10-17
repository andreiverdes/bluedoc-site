// Store listings: the toolbar's Google Play | App Store switch. Each store has its own page: Play's Shared assets
// and Wear OS, phone and tablet sets at 8 shots each, then the App Store's Apple Watch, iPhone and iPad sets at 10.
// A switch starts the page at its top, so the clip ends where it began: Play, at the top.
import { panels, shotsReady } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: 3.6,
  cursor: [760, 470],

  async setup(c) {
    await panels(c, { left: false });
  },

  async run(c) {
    await c.pause(800);
    await c.click(`.bd-lst-btb [data-p=appstore]`, { ms: 650 });
    await c.waitFor(`BP.listing().platform === 'appstore'`);
    await shotsReady(c);
    await c.pause(600);
    await c.moveTo([820, 560], { ms: 600 });
    await c.wheel(420, { ms: 800 });
    await shotsReady(c);
    await c.pause(900);
    await c.click(`.bd-lst-btb [data-p=play]`, { ms: 650 });
    await c.waitFor(`BP.listing().platform === 'play'`);
    await shotsReady(c);
    await c.pause(1100);
  },
};
