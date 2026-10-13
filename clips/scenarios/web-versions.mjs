// Websites (hero clip): a brief decision's versions shown in place. The gutter beside Home's hero has A B C, the
// recommendation starred; pointing at them outlines the hero, and each pick rewrites the live page's headline.
import { BOARD_READY, boardOnly, settle, startFixture, stepBack } from '../fixtures/acme-fit-site/fixture.mjs';

export const gif = true;

const PICK = (id) => `.bd-ab[data-ab=home] .bd-var button[data-id=${id}]`;
let site;

export default {
  doc: 'acme-site',
  posterAt: 3.2,
  cursor: [820, 600],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({section: ['home', 'hero']})`);
    await settle(c);
    await stepBack(c);
    await c.waitFor(`(e => e && !e.hidden && e.offsetWidth > 0)(document.querySelector('.bd-ab[data-ab=home] .bd-var'))`);
    await c.waitFor(`BP.board().artboards[0].page.variants.hero.shown === 'b'`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo(PICK('a'), { ms: 650 });
    await c.pause(500); // the hero outlined
    await c.click(PICK('c'), { ms: 320 });
    await c.waitFor(`BP.board().artboards[0].page.variants.hero.shown === 'c'`);
    await c.pause(1300);
    await c.click(PICK('a'), { ms: 420 });
    await c.waitFor(`BP.board().artboards[0].page.variants.hero.shown === 'a'`);
    await c.pause(1200);
    await c.click(PICK('b'), { ms: 360 });
    await c.waitFor(`BP.board().artboards[0].page.variants.hero.shown === 'b'`);
    await c.pause(700);
    await c.moveTo([820, 600], { ms: 650 });
    await c.pause(500);
  },
};
