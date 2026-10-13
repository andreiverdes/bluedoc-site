// Designs: links between screens. Selecting Today lights its arrows in and out with their labels and its reach
// (→ 4 · ← 5); Flows off hides the connectors, Flows on shows every link again; a click on the board deselects.
import { ab, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

export default {
  doc: 'acme-fit-design',
  posterAt: 2.2,
  cursor: [1130, 600],

  async setup(c) {
    await panels(c);
    await c.waitFor(`BP.board().flows === true`);
    await view(c, { x: 1000, y: 1790, k: 0.165, to: [640, 440] });
    await settled(c);
  },

  async run(c) {
    await c.pause(800);
    await c.click(ab('today', 0.5, 0.45), { ms: 650 });
    await c.waitFor(`BP.board().selected === 'today' && BP.board().reach.out === 4`);
    await c.pause(1500);
    await c.click({ text: 'Flows', in: '.bd-btb' }, { ms: 600 });
    await c.waitFor(`BP.board().flows === false`);
    await c.pause(700);
    await c.click({ text: 'Flows', in: '.bd-btb' }, { ms: 200 });
    await c.waitFor(`BP.board().flows === true`);
    await c.pause(800);
    // an empty spot on the board: nothing selected, every link back at rest
    await c.click([1130, 600], { ms: 650 });
    await c.waitFor(`BP.board().selected === null`);
    await c.pause(700);
  },
};
