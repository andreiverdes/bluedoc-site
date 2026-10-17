// Store listings: Checks. The toolbar's count opens the Checks tab, which lists the page's store-rule findings; a
// finding's link scrolls to the shot it is about (here the mock-up UI warning, to the Wear OS set).
import { panels, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 520],

  async setup(c) {
    await panels(c, { left: false });
    await toRow(c, 'tablet', -10);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-lst-btb .bd-lst-ckb', { ms: 700 });
    await c.waitFor(`!document.getElementById('bd-lp-checks').hidden`);
    await shotsReady(c);
    await c.pause(1000);
    await c.click({ sel: '.bd-lst-checks li[data-key="artboard:watch-rings"] .bd-lst-ui', x: 0.3, y: 0.2 }, { ms: 700 });
    await c.pause(900);
    await shotsReady(c);
    await c.moveTo([760, 520], { ms: 700 });
    await c.pause(1300);
  },
};
