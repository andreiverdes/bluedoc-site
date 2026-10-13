// Presentations: comment on one element of a slide. Point picks the big number on Weekly actives (its data-bd name
// labels it: stat); the note is saved as a pending comment keyed el:actives/stat, listed in the Comments panel.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

export default {
  doc: 'acme-fit-deck',
  posterAt: -0.5,
  cursor: [880, 640],

  async setup(c) {
    await panels(c, { right: true });
    await view(c, { x: 960, y: 3260, k: 0.36, to: [560, 430] });
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click('button.bd-key[aria-label="Point"]', { ms: 700 });
    await c.waitFor(`BP.board().mode === 'point'`);
    await c.pause(200);
    // 41,800, in the middle of the slide
    await c.moveTo({ sel: '.bd-ab[data-ab="actives"] .bd-ab-scr', x: 0.5, y: 0.45 }, { ms: 750 });
    await c.pause(450);
    await c.click(null);
    await c.waitFor(`!!document.querySelector('textarea:focus, [contenteditable]:focus')`);
    await c.pause(300);
    await c.type('Round this to 42k', { cps: 26 });
    await c.pause(250);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().some(a => a.target.key === 'el:actives/stat')`);
    await c.key('v'); // View again: the pointer stops picking elements on its way out
    await c.waitFor(`BP.board().mode === 'view'`);
    await c.moveTo([880, 640], { ms: 600 });
    await c.pause(1200);
  },
};
