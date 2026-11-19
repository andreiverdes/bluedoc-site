// Websites: Full page shows the whole Blog on the board; Viewport puts it in a window of the device's height (900 px
// at 1440); Present shows that window alone, where the page takes the wheel and scrolls, the sticky nav staying on
// top; out of Present, Full page again.
import { BOARD_READY, boardOnly, settle, startFixture } from '../fixtures/acme-fit-site/fixture.mjs';

const VIEW = (v) => `.bd-btb .bd-sg[aria-label="Page height"] button[data-v="${v}"]`;
const PRESENT = `.bd-btb button[aria-label^="Present"]`;
const PRESENT_CLOSE = `button[aria-label="Leave (Esc)"]`;
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
    await c.pause(600);
    await c.click(VIEW('viewport'), { ms: 550 });
    await c.waitFor(`(a => a.ready && a.h === 900 && a.page.view === 'viewport')(BP.board().artboards[1])`, 20_000);
    await c.pause(250);
    // Present: the page alone, at its window; the wheel scrolls it
    await c.click(PRESENT, { ms: 500 });
    await c.waitFor(`BP.board().present && BP.board().presented?.screen === 'blog'`);
    await c.pause(150);
    await c.moveTo([640, 430], { ms: 400 });
    await c.wheel(620, { ms: 900 });
    await c.pause(500);
    await c.click(PRESENT_CLOSE, { ms: 550 });
    await c.waitFor(`!BP.board().present`);
    await settle(c);
    await c.moveTo([1000, 300], { ms: 450 });
    await c.click(VIEW('full'), { ms: 450 });
    await c.waitFor(`(a => a.ready && a.h > 900 && a.page.view === 'full')(BP.board().artboards[1])`, 20_000);
    await c.pause(300);
    // Shift+2: the board glides back to the whole Blog, as the clip began
    const key = { key: '@', code: 'Digit2', windowsVirtualKeyCode: 50, nativeVirtualKeyCode: 50, modifiers: 8 };
    await c.tab.call('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...key });
    await c.tab.call('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
    await settle(c);
    await c.pause(700);
  },
};
