// Presentations: send the deck back. A deck isn't approved (its dock ends in Request changes and Present); the
// reader's picks and comments go back to the agent with Request changes. Forest in the toolbar's Theme menu (the
// brief's Which theme? card reads ✓ Forest, every slide turns green), then Request changes: the send dialog lists the
// picks, Forest changed from Indigo; Send, and the toast says the change request went to the agent.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

const ROW = '#item-brief-theme';
const THEME = '.bd-btb .bd-selw.th';
const DLG = 'dialog.bd-chgs[open]';

export default {
  doc: 'acme-fit-deck',
  posterAt: -2.8,
  cursor: [760, 600],

  async setup(c) {
    await panels(c, { left: 'brief' });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    await view(c, { x: 960, y: 3260, k: 0.22, to: [768, 430] });
    await settled(c);
  },

  async run(c) {
    await c.pause(600);
    await c.click(`${THEME} .bd-selb`, { ms: 600 });
    await c.waitFor(`document.querySelector('${THEME} .bd-selb').getAttribute('aria-expanded') === 'true'`);
    await c.pause(250);
    await c.click(`${THEME} [role=option][data-v="forest"]`, { ms: 400 });
    await c.waitFor(`BP.board().theme === 'forest'`);
    await c.pause(450);
    await c.click('.bd-anntb .bd-key.go', { ms: 600 });
    await c.waitForSelector(DLG);
    await c.pause(300);
    // the theme pick, changed from Indigo: the pointer rests just under it, so its words stay readable
    const [x, y] = await c.point({ text: 'Changed from Indigo', in: DLG });
    await c.moveTo([x, y + 16], { ms: 550 });
    await c.pause(800);
    await c.click(`${DLG} .ft .pri`, { ms: 550 });
    await c.waitFor(`!document.querySelector('${DLG}')`);
    await c.waitForSelector('.bp-toast.on');
    await c.moveTo([760, 600], { ms: 550 });
    await c.pause(1100);
  },
};
