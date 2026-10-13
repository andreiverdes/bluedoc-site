// Presentations: approve the deck. The reader picks Forest in the brief (every slide turns green), then Approve
// presentation lists the picks it approves; Approve, and the chip at the top of the brief reads Approved · rev A.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

const ROW = '#item-brief-theme';

export default {
  doc: 'acme-fit-deck',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await panels(c, { left: true });
    await c.click({ text: 'Brief', in: '.bd-lp' }, { ms: 1 });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    await view(c, { x: 960, y: 3260, k: 0.22, to: [800, 430] });
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`${ROW} .bp-choice:not(.rec)`, { ms: 650 }); // Forest
    await c.waitFor(`BP.board().theme === 'forest'`);
    await c.pause(500);
    await c.click('.bd-anntb .approve', { ms: 700 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.pause(300);
    await c.moveTo({ sel: '.bd-approve', x: 0.62, y: 0.52 }, { ms: 550 });
    await c.pause(800);
    await c.click('.bd-approve .bp-btn.ok', { ms: 550 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.pause(300);
    await c.moveTo({ text: 'Approved · rev A' }, { ms: 750 });
    await c.pause(1100);
  },
};
