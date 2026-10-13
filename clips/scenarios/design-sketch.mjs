// Designs: Sketch redraws every screen hand-drawn (wobbly lines, the hand font); As drawn shows each at its own
// fidelity again.
import { panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

export default {
  doc: 'acme-fit-design',
  posterAt: 2,
  cursor: [1110, 600],

  async setup(c) {
    await panels(c);
    await view(c, { x: 1000, y: 1830, k: 0.5, to: [640, 450] });
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ text: 'Sketch', in: '.bd-btb' }, { ms: 650 });
    await c.waitFor(`BP.board().sketch === true`);
    await c.pause(1500);
    await c.click({ text: 'As drawn', in: '.bd-btb' }, { ms: 450 });
    await c.waitFor(`BP.board().sketch === false`);
    await c.moveTo([1110, 600], { ms: 600 });
    await c.pause(400);
  },
};
