// Designs: a screen and its variants. With Sign in selected, Variants lines it up beside its passkey-first variant
// (a wireframe) at one zoom. The clip holds there (Variants again refits the whole board).
import { ab, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

export default {
  doc: 'acme-fit-design',
  posterAt: -0.5,
  cursor: [1060, 560],

  async setup(c) {
    await panels(c);
    await view(c, { x: 560, y: 1800, k: 0.3, to: [640, 440] });
    await settled(c);
  },

  async run(c) {
    await c.pause(800);
    await c.click(ab('login', 0.5, 0.62), { ms: 700 });
    await c.waitFor(`BP.board().selected === 'login'`);
    await c.pause(300);
    await c.click('button[aria-label^="Variants"]', { ms: 700 });
    await c.waitFor(`BP.board().variants === 'login'`);
    await settled(c);
    await c.moveTo([1130, 640], { ms: 600 });
    await c.pause(1100);
  },
};
