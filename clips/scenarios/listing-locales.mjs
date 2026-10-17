// Store listings: the locale menu. Each locale names its machine-translated strings (es-ES · 15 MT); picking one
// switches the store text, the captions and the captures, and each MT string carries an MT badge with Accept MT.
import { panels, paneTo, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 520],

  async setup(c) {
    await panels(c, { left: true, tab: 'text' });
    await paneTo(c, '.bd-lfield[data-field="en-US/play/name"]', 40);
    await toRow(c, 'phone', -10);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-lst-loc .bd-selb', { ms: 650 });
    await c.waitFor(`!document.querySelector('.bd-lst-loc .bd-selm').hidden`);
    await c.pause(350);
    await c.moveTo('.bd-lst-loc [data-v="es-ES"]', { ms: 450 });
    await c.pause(900);
    await c.click('.bd-lst-loc [data-v="es-ES"]', { ms: 250 });
    await c.waitFor(`BP.listing().locale === 'es-ES'`);
    await shotsReady(c);
    await c.moveTo({ sel: '.bd-lfield[data-field="es-ES/play/short"] .bd-lst-tag.mt' }, { ms: 750 });
    await c.pause(1600);
  },
};
