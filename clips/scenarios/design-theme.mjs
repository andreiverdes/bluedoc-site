// Designs: a theme pick re-skins every screen. Forest in the brief's theme choice (its answer card open in the left
// pane's Brief) turns every frame green at once; Indigo, the recommendation, turns them back.
import { panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

const ROW = '#item-brief-theme';

export default {
  doc: 'acme-fit-design',
  query: 'open=brief:theme',
  posterAt: 2.6, // every frame green
  cursor: [900, 600],

  async setup(c) {
    await panels(c, { left: 'brief' });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    await view(c, { x: 1080, y: 1820, k: 0.3, to: [806, 430] }); // the phone app, right of the Brief pane
    await settled(c);
  },

  async run(c) {
    await c.pause(900);
    await c.click(`${ROW} .bp-opt[data-id="forest"] .pk`, { ms: 650 }); // Forest
    await c.waitFor(`BP.board().theme === 'forest'`);
    await c.pause(1700);
    await c.click(`${ROW} .bp-opt[data-id="indigo"] .pk`, { ms: 500 }); // Indigo, the recommendation
    await c.waitFor(`BP.board().theme === 'indigo'`);
    await c.moveTo([900, 600], { ms: 500 });
    await c.pause(800);
  },
};
