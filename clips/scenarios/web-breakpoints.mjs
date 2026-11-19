// Websites: the Home page's title-bar icons set that page alone to Mobile (390 px) and it reflows, since its frame
// really is that wide; then the toolbar's Tablet and Desktop resize every page, back to where the clip began.
import { BOARD_READY, boardOnly, settle, startFixture } from '../fixtures/acme-fit-site/fixture.mjs';

const EVERY = (w) => `.bd-btb .bd-sg[aria-label="Width of every page"] button[data-w="${w}"]`;
const widths = (home, blog) => `(b => b.artboards.every(a => a.ready) && b.artboards[0].w === ${home} && b.artboards[1].w === ${blog})(BP.board())`;
let site;

export default {
  doc: 'acme-site',
  posterAt: 2.6,
  cursor: [880, 560],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    // Viewport: each page a window of its device's height (900, 1024, 844 px), so the pages stay large at every width
    await c.ev(`BP.board({pageView: 'viewport'})`);
    await c.waitFor(`BP.board().artboards.every(a => a.ready && a.page.view === 'viewport')`, 20_000);
    await c.ev(`BP.board({fit: true})`);
    await settle(c);
  },

  async run(c) {
    await c.pause(800);
    await c.click(`.bd-ab[data-ab=home] .bd-ab-t .bps button[data-w="390"]`, { ms: 650 });
    await c.waitFor(widths(390, 1440), 20_000);
    await settle(c);
    await c.pause(800);
    await c.click(EVERY(768), { ms: 620 });
    await c.waitFor(widths(768, 768), 20_000);
    await settle(c);
    await c.pause(800);
    await c.click(EVERY(1440), { ms: 450 });
    await c.waitFor(widths(1440, 1440), 20_000);
    await settle(c);
    await c.pause(1100);
  },
};
