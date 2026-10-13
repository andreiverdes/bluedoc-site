// Presentations: compare a slide with the last revision. The temp copy gets rev B (Weekly actives reworded to lead
// with the 2.1× jump); Changes from rev A marks that slide changed. Its compare key shows rev A and rev B side by
// side, then Onion skin lays rev B over rev A and the opacity slider fades between them.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels, revB } from '../fixtures/acme-fit-deck/deck.mjs';

const SLIDER = '.bd-cmpv input[type=range]';
// a point on the slider's track at value v (0–100); the thumb is 16 px wide
const knob = (v) => ({ sel: SLIDER, x: 0, dx: 8 + ((v / 100) * (129 - 16)) });

export const crf = 26;

export default {
  doc: 'acme-fit-deck',
  query: 'diff=A',
  posterAt: 2.6,
  cursor: [880, 640],

  prepare: revB,

  async setup(c) {
    await panels(c, { right: true });
    await c.waitFor(`BP.board().artboards.find(a => a.id === 'actives').change === 'mod'`);
    await view(c, { x: 960, y: 3260, k: 0.3, to: [560, 440] });
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
    await c.moveTo(knob(50), { ms: 500 });
    await c.down();
    await c.moveTo(knob(100), { ms: 500 }); // rev B alone
    await c.pause(350);
    await c.moveTo(knob(0), { ms: 850 }); // rev A alone
    await c.pause(350);
    await c.moveTo(knob(50), { ms: 400 });
    await c.up();
    await c.click('.bd-cmpv .hd button[aria-label^="Close"]', { ms: 600 });
    await c.waitFor(`BP.board().compare === false`);
    await c.moveTo([880, 640], { ms: 500 });
    await c.pause(300);
  },
};
