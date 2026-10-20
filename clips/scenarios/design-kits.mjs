// Designs: kits and frameworks on one board, beside the brief's framework pick (HorizonUI, recommended). The camera
// moves in on the passkey-first variant drawn in the wireframe kit, next to the plain-kit hi-fi screens, then over to
// the web dashboard drawn with HorizonUI.
//
// The temp copy places the dashboard left of the sign-in screens (it sits far below them in the example): the board
// mounts screens only near the view, so a far-off stop would arrive as an empty bezel.
import { glide, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

const ROW = '#item-brief-framework';
const DASH = { x: -1640, y: 1386 }; // the dashboard's top-left (1440 × 900)

export const crf = 27;

export default {
  doc: 'acme-fit-design',
  posterAt: 0.4,
  cursor: [760, 650],

  prepare(ctx) {
    ctx.py('build.py', 'patch', ctx.bd.docPath('acme-fit-design'), 'artboard:dashboard', '--json', JSON.stringify(DASH), '--no-bump');
  },

  async setup(c) {
    await panels(c, { right: 'brief' });
    await c.waitForSelector(ROW);
    await c.ev(`document.querySelector('${ROW}').scrollIntoView({block: 'center'})`);
    await view(c, { x: -330, y: 1830, k: 0.3 }); // the dashboard, Sign in and its variant, Today
    await settled(c);
  },

  async run(c) {
    await c.pause(900);
    await glide(c, { x: 195, y: 2270, k: 0.62, ms: 900 }); // Sign in, passkey first: the wireframe kit
    await settled(c);
    await c.pause(400);
    await glide(c, { x: DASH.x + 720, y: DASH.y + 450, k: 0.6, ms: 1000 }); // the dashboard: HorizonUI
    await settled(c);
    await c.moveTo(`${ROW} .bp-opt[data-id="horizon"] .rec`, { ms: 800 }); // HorizonUI (recommended)
    await c.pause(1200);
  },
};
