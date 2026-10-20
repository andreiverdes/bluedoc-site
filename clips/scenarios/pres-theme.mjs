// Presentations: the brief's theme pick re-skins every slide at once (Forest turns the deck green); Sketch then
// redraws it hand-drawn for a rough pass. As drawn and Indigo, the recommendation, put it back.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

const ROW = '#item-brief-theme';

export default {
  doc: 'acme-fit-deck',
  posterAt: 2.2,
  cursor: [700, 600],

  async setup(c) {
    await panels(c, { right: 'brief' });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    // What shipped, Weekly actives and the quote: the middle of the column, three whole slides
    await view(c, { x: 960, y: 3260, k: 0.15, to: [467, 446] });
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`${ROW} .bp-opt[data-id="forest"] .pk`, { ms: 650 }); // Forest
    await c.waitFor(`BP.board().theme === 'forest'`);
    await c.pause(1000);
    await c.click({ text: 'Sketch', in: '.bd-btb' }, { ms: 700 });
    await c.waitFor(`BP.board().sketch === true`);
    await c.pause(1200);
    await c.click({ text: 'As drawn', in: '.bd-btb' }, { ms: 450 });
    await c.waitFor(`BP.board().sketch === false`);
    await c.pause(200);
    await c.click(`${ROW} .bp-opt[data-id="indigo"] .pk`, { ms: 650 }); // Indigo
    await c.waitFor(`BP.board().theme === 'indigo'`);
    await c.moveTo([700, 600], { ms: 450 });
    await c.pause(400);
  },
};
