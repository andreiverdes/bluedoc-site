// Store listings: the Typography panel at the top of the Text tab sets the caption font, from the fonts installed on
// the machine. A lighter weight and a larger size re-render every caption at once.
import { panels, settle, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 520],

  async setup(c) {
    await panels(c, { left: true, tab: 'text' });
    await toRow(c, 'phone', -10);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-ty-dd.sty', { ms: 700 });
    await c.waitFor(`document.querySelector('.bd-ty-dd.sty').getAttribute('aria-expanded') === 'true'`);
    await settle(c, 4);
    await c.moveTo('#bd-ty-style [data-v="500"]', { ms: 500 });
    await c.pause(500);
    await c.click('#bd-ty-style [data-v="500"]', { ms: 200 });
    await c.waitFor(`BP.listing().brand.font.weight === 500`);
    await shotsReady(c);
    await c.pause(700);
    await c.click('.bd-typo [aria-label="Common sizes"]', { ms: 600 });
    await c.waitFor(`document.querySelector('.bd-typo [aria-label="Common sizes"]').getAttribute('aria-expanded') === 'true'`);
    await settle(c, 4);
    await c.moveTo('#bd-ty-size [data-v="120"]', { ms: 450 });
    await c.pause(400);
    await c.click('#bd-ty-size [data-v="120"]', { ms: 200 });
    await c.waitFor(`BP.listing().brand.font.size === 1.2`);
    await shotsReady(c);
    await c.moveTo([900, 470], { ms: 700 });
    await c.pause(1300);
  },
};
