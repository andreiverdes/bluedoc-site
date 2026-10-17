// Store listings: Undo and Redo. Every draft is a step of one undo history (a Save of text, a style pick, a colour,
// an upload); the toolbar's keys name the step they take back or redo, and the drafts count follows.
import { panels, paneTo, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: 1.0,
  cursor: [820, 520],

  async setup(c) {
    await panels(c, { left: true, tab: 'style' });
    await paneTo(c, '#bd-lp-style .bd-lst-style[data-style=l1]', 70);
    await toRow(c, 'phone', -10);
    // the step to take back: the L4 Dark hero pick, made before the clip starts
    await c.ev(`document.querySelector('#bd-lp-style .bd-lst-style[data-style=l4]').click()`);
    await c.waitFor(`BP.listing().style.layout === 'l4'`);
    await shotsReady(c);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo('.bd-lst-btb [aria-keyshortcuts="Meta+Z Control+Z"]', { ms: 700 });
    await c.pause(900);
    await c.click('.bd-lst-btb [aria-keyshortcuts="Meta+Z Control+Z"]', { ms: 150 });
    await c.waitFor(`BP.listing().style.layout === 'l1'`);
    await shotsReady(c);
    await c.pause(600);
    await c.moveTo('.bd-lst-btb [aria-keyshortcuts^="Shift+Meta+Z"]', { ms: 350 });
    await c.pause(800);
    await c.click('.bd-lst-btb [aria-keyshortcuts^="Shift+Meta+Z"]', { ms: 150 });
    await c.waitFor(`BP.listing().style.layout === 'l4'`);
    await shotsReady(c);
    await c.pause(1200);
  },
};
