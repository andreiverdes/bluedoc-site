// Designs: Tidy up. The temp copy's phone screens sit where they were dropped, links crossing; Tidy up lays them
// out in layers from the entry with no overlaps or crossings, and Request changes carries the new positions as one
// `layout:main` item with the build.py patch command that writes them.
import { panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

// a board as screens end up after a few drags
const MESSY = { workout: [1790, 1900], workouts: [40, 2700], activity: [610, 2820], profile: [1200, 980], settings: [60, 0], login: [1160, 2760], 'login-b': [1810, 860] };

export default {
  doc: 'acme-fit-design',
  posterAt: 3,
  cursor: [1110, 610],

  prepare(ctx) {
    const doc = ctx.bd.docPath('acme-fit-design');
    for (const [id, [x, y]] of Object.entries(MESSY)) ctx.py('build.py', 'patch', doc, `artboard:${id}`, '--json', JSON.stringify({ x, y }), '--no-bump');
  },

  async setup(c) {
    await panels(c);
    await view(c, { x: 1090, y: 1810, k: 0.17, to: [640, 432] });
    await settled(c);
  },

  async run(c) {
    await c.pause(900);
    await c.click('button[aria-label^="Tidy up"]', { ms: 700 });
    await c.waitFor(`BP.boardEdit().drafts.some(d => d.key === 'layout:main')`);
    await settled(c);
    await c.pause(900);
    await c.click('button.bd-key[aria-label^="Request changes"]', { ms: 700 });
    await c.waitForSelector('dialog[open]');
    await c.pause(1800);
  },
};
