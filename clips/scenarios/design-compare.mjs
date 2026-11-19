// Designs: compare a screen across revisions. The temp copy gets rev D (Today: the avatar opens Profile, the tab
// bar drops it, Start workout opens as a sheet); Changes from rev C marks Today changed and its links New, Changed
// and Removed, listed in the Revisions panel. Today's labelled Compare key shows rev C and rev D side by side, beside
// the panel; the view's own close key shuts it.
import { panels, revD, settled, view } from '../fixtures/acme-fit-design/board.mjs';

export const crf = 26;

export default {
  doc: 'acme-fit-design',
  query: 'diff=C',
  posterAt: 3,
  cursor: [880, 640],

  prepare: revD,

  async setup(c) {
    await panels(c, { right: 'revisions' });
    await c.waitFor(`BP.board().artboards.find(a => a.id === 'today').change === 'mod'`);
    await view(c, { x: 820, y: 1830, k: 0.5, to: [500, 470] });
    await settled(c);
  },

  async run(c) {
    await c.pause(1000);
    await c.click('.bd-ab[data-ab="today"] .bd-ab-t .cmp', { ms: 750 });
    await c.waitFor(`BP.board().compare === true`);
    await settled(c);
    await c.pause(1700);
    await c.click('.bd-cmpv .hd button[aria-label^="Close"]', { ms: 650 });
    await c.waitFor(`BP.board().compare === false`);
    await c.moveTo([880, 640], { ms: 550 });
    await c.pause(500);
  },
};
