// Websites: Full page shows the whole Blog on the board; Viewport puts it in a window of the device's height (900 px
// at 1440) that scrolls, the sticky nav staying on top; Full page again.
import { BOARD_READY, boardOnly, settle, startFixture } from '../fixtures/acme-fit-site/fixture.mjs';

const VIEW = (v) => `.bd-btb .bd-sg[aria-label="Page height"] button[data-v="${v}"]`;
let site;

export default {
  doc: 'acme-site',
  posterAt: 3.4,
  cursor: [1000, 560],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({focus: 'blog'})`);
    await settle(c);
  },

  async run(c) {
    await c.pause(650);
    await c.click(VIEW('viewport'), { ms: 600 });
    await c.waitFor(`(a => a.ready && a.h === 900 && a.page.view === 'viewport')(BP.board().artboards[1])`, 20_000);
    await c.pause(400);
    // Interact: the page takes the wheel and scrolls inside its window
    await c.click(`.bd-key[data-m="interact"]`, { ms: 550 });
    await c.pause(120);
    await c.moveTo({ sel: '.bd-ab[data-ab=blog] iframe.bd-ab-fr', x: 0.5, y: 0.55 }, { ms: 550 });
    await c.wheel(620, { ms: 950 });
    await c.pause(550);
    await c.click(VIEW('full'), { ms: 600 });
    await c.waitFor(`(a => a.ready && a.h > 900 && a.page.view === 'full')(BP.board().artboards[1])`, 20_000);
    await c.pause(400);
    await c.click(`.bd-key[data-m="view"]`, { ms: 550 });
    await c.pause(600);
  },
};
