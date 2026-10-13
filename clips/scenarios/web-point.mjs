// Websites: Point at a post title on the live Blog and write a comment; Request changes previews what the agent
// gets: the element, the width it was made at (At: 1440 px wide) and its section's source files (Source: …).
import { BOARD_READY, boardOnly, inPage, settle, startFixture, stepBack } from '../fixtures/acme-fit-site/fixture.mjs';

let site;

export default {
  doc: 'acme-site',
  posterAt: -0.4,
  cursor: [1000, 600],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({section: ['blog', 'posts']})`);
    await settle(c);
    await stepBack(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`.bd-key[data-m="point"]`, { ms: 600 });
    await c.pause(200);
    await c.click(await inPage(c, 'blog', '#post-first-10k .post-title', { fx: 0.35, fy: 0.3 }), { ms: 650 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(150);
    await c.type('Fit it on one line', { cps: 30 });
    await c.pause(200);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(350);
    await c.click(`.bd-key.go`, { ms: 600 });
    await c.waitFor(`!!document.querySelector('.bd-chgs[open] pre')`);
    await c.pause(1800);
  },
};
