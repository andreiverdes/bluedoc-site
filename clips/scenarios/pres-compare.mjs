// Presentations: compare a slide with the last revision. The temp copy gets rev B (Weekly actives reworded to lead
// with the 2.1× jump); Changes from rev A marks that slide changed, and Revisions lists it. Its Compare key shows rev
// A and rev B side by side between the panes, then Onion skin lays rev B over rev A and the opacity slider fades
// between them.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels, revB } from '../fixtures/acme-fit-deck/deck.mjs';

const SLIDER = '.bd-cmpv input[type=range]';
// a point on the slider's track at value v (0–100), the track w px wide; the thumb is 16 px wide
const knob = (v, w) => ({ sel: SLIDER, x: 0, dx: 8 + ((v / 100) * (w - 16)) });

export const crf = 26;

export default {
  doc: 'acme-fit-deck',
  query: 'diff=A',
  posterAt: 2.6,
  cursor: [600, 640],

  prepare: revB,

  async setup(c) {
    await panels(c, { right: 'revisions' });
    await c.waitFor(`BP.board().artboards.find(a => a.id === 'actives').change === 'mod'`);
    await view(c, { x: 960, y: 3260, k: 0.3, to: [480, 450] });
    await settled(c);
  },

  async run(c) {
    await c.pause(600);
    await c.click('.bd-ab[data-ab="actives"] .bd-ab-t .cmp', { ms: 650 });
    await c.waitFor(`BP.board().compare === true && document.querySelectorAll('.bd-cmpv iframe').length === 2`);
    await c.pause(1000);
    await c.click('.bd-cmpv button[data-v="onion"]', { ms: 600 });
    await c.waitFor(`!document.querySelector('${SLIDER}').hidden`);
    await c.pause(200);
    const w = await c.ev(`document.querySelector('${SLIDER}').getBoundingClientRect().width`);
    await c.moveTo(knob(50, w), { ms: 500 });
    await c.down();
    await c.moveTo(knob(100, w), { ms: 500 }); // rev B alone
    await c.pause(350);
    await c.moveTo(knob(0, w), { ms: 850 }); // rev A alone
    await c.pause(350);
    await c.moveTo(knob(50, w), { ms: 400 });
    await c.up();
    await c.click('.bd-cmpv .hd button[aria-label^="Close"]', { ms: 600 });
    await c.waitFor(`BP.board().compare === false`);
    await c.moveTo([600, 640], { ms: 500 });
    await c.pause(300);
  },
};
