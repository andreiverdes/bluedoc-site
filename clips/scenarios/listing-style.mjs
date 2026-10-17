// Store listings: the Style tab's caption styles (M1–M5) and layouts (L1–L5), each with its evidence. A pick
// re-renders every shot on the platform page live: here L4 Dark hero.
import { panels, paneTo, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 520],

  async setup(c) {
    await panels(c, { left: true, tab: 'style' });
    await paneTo(c, '#bd-lp-style .bd-lst-style[data-style=l1]', 70);
    await toRow(c, 'phone', -10);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo('#bd-lp-style .bd-lst-style[data-style=l3]', { ms: 700 });
    await c.pause(500);
    await c.click('#bd-lp-style .bd-lst-style[data-style=l4]', { ms: 450 });
    await c.waitFor(`BP.listing().style.layout === 'l4'`);
    await shotsReady(c);
    await c.moveTo([900, 470], { ms: 700 });
    await c.pause(1500);
  },
};
