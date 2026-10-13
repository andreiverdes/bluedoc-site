// Designs: onion skin. Today at rev D over rev C (the temp copy's rev D, as in design-compare); the opacity slider
// fades the newer revision in and out, so the moved numbers and the dropped Profile tab show in place.
import { panels, revD, settled } from '../fixtures/acme-fit-design/board.mjs';

const SLIDER = '.bd-cmpv input[type=range]';
// a point on the slider's track at value v (0–100); the thumb is 16 px wide
const knob = (v) => ({ sel: SLIDER, x: 0, dx: 8 + ((v / 100) * (129 - 16)) });

export const crf = 26;

export default {
  doc: 'acme-fit-design',
  query: 'diff=C',
  posterAt: 0.4,
  cursor: [760, 400],

  prepare: revD,

  async setup(c) {
    await panels(c, { right: true });
    await c.ev(`BP.board({compare: 'today'})`);
    await c.waitFor(`BP.board().compare === true`);
    await c.click('.bd-cmpv button[data-v="onion"]', { ms: 1 });
    await c.waitFor(`!document.querySelector('${SLIDER}').hidden`);
    await settled(c);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo(knob(50), { ms: 650 });
    await c.down();
    await c.pause(120);
    await c.moveTo(knob(100), { ms: 650 }); // rev D alone
    await c.pause(600);
    await c.moveTo(knob(0), { ms: 1100 }); // rev C alone
    await c.pause(600);
    await c.moveTo(knob(50), { ms: 650 });
    await c.pause(120);
    await c.up();
    await c.moveTo([760, 400], { ms: 600 });
    await c.pause(400);
  },
};
