// Designs: a theme pick re-skins every screen. Forest in the brief's theme choice turns every frame green at once;
// Indigo, the recommendation, turns them back.
import { panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

const ROW = '#item-brief-theme';

export default {
  doc: 'acme-fit-design',
  posterAt: 2,
  cursor: [700, 600],

  async setup(c) {
    await panels(c, { right: 'brief' });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    await view(c, { x: 1090, y: 1820, k: 0.3, to: [500, 440] });
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`${ROW} .bp-opt[data-id="forest"] .pk`, { ms: 650 }); // Forest
    await c.waitFor(`BP.board().theme === 'forest'`);
    await c.pause(1500);
    await c.click(`${ROW} .bp-opt[data-id="indigo"] .pk`, { ms: 500 }); // Indigo, the recommendation
    await c.waitFor(`BP.board().theme === 'indigo'`);
    await c.moveTo([700, 600], { ms: 500 });
    await c.pause(400);
  },
};
