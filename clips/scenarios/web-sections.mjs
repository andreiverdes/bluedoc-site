// Websites: the Pages panel lists each page's sections with their source hints; clicking Pricing takes the board
// to that section of the live Home page.
import { BOARD_READY, settle, startFixture } from '../fixtures/acme-fit-site/fixture.mjs';

const SECTION = (page, id) => `.bd-sec-l[aria-label="Sections of ${page}"] button[data-sec="${id}"]`;
let site;

export default {
  doc: 'acme-site',
  posterAt: -0.3,
  cursor: [700, 560],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await c.ev(`BP.sidebar({open: false})`);
    await c.ev(`BP.board({fit: true})`);
    await settle(c);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo({ sel: SECTION('Home', 'pricing'), x: 0.3, y: 0.3 }, { ms: 700 });
    await c.pause(250);
    await c.click(null);
    await c.waitFor(`BP.board().selected === 'home'`);
    await settle(c);
    await c.pause(400);
    // its source hints, under it in the panel
    await c.moveTo({ sel: `${SECTION('Home', 'pricing')} code`, x: 0.4 }, { ms: 500 });
    await c.pause(1200);
  },
};
