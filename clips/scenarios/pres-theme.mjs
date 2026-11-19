// Presentations: the brief's theme pick re-skins every slide at once. Forest in the toolbar's Theme menu (changing it
// there picks it in the brief, whose Which theme? card in the left pane now reads ✓ Forest) turns the deck green;
// Sketch then redraws it hand-drawn for a rough pass. As drawn and Indigo, the recommendation, put it back.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

const ROW = '#item-brief-theme';
const THEME = '.bd-btb .bd-selw.th';
const pick = async (c, v) => {
  await c.click(`${THEME} .bd-selb`, { ms: 600 });
  await c.waitFor(`document.querySelector('${THEME} .bd-selb').getAttribute('aria-expanded') === 'true'`);
  await c.pause(250);
  await c.click(`${THEME} [role=option][data-v="${v}"]`, { ms: 400 });
  await c.waitFor(`BP.board().theme === '${v}'`);
};

export default {
  doc: 'acme-fit-deck',
  posterAt: 4.6,
  cursor: [760, 600],

  async setup(c) {
    await panels(c, { left: 'brief' });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    // What shipped, Weekly actives and the quote: the middle of the column, three whole slides
    await view(c, { x: 960, y: 3260, k: 0.15, to: [808, 446] });
    await settled(c);
  },

  async run(c) {
    await c.pause(600);
    await pick(c, 'forest');
    await c.pause(900);
    await c.click('.bd-btb button[title^="Every screen hand-drawn"]', { ms: 550 });
    await c.waitFor(`BP.board().sketch === true`);
    await c.pause(1100);
    await c.click('.bd-btb button[title^="Each screen at the fidelity"]', { ms: 400 });
    await c.waitFor(`BP.board().sketch === false`);
    await c.pause(150);
    await pick(c, 'indigo');
    await c.moveTo([760, 600], { ms: 450 });
    await c.pause(300);
  },
};
