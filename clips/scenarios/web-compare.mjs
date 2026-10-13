// Websites: compare (Changes from A, ?diff=A) puts each page's rev A snapshot to the left of its live rev B, the
// changed hero outlined on both; Single goes back to rev B alone. prepare makes rev B as web-snapshot does. The clip
// opens in compare, zoomed to the two heroes: each change of the whole view costs the MP4 ~200 KB.
import { BOARD_READY, boardOnly, settle, startFixture, toRevB } from '../fixtures/acme-fit-site/fixture.mjs';

let site;
const TWINS_READY = `(b => !!b && b.twins.length > 0 && b.twins.every(t => t.ready) && b.artboards.every(a => a.ready) && b.twins[0].changed.length > 0)(BP.board())`;
// the Home pair on screen: [left of rev A, right of rev B, top]
const PAIR = `(() => {
  const fs = [...document.querySelectorAll('.bd-ab iframe.bd-ab-fr')].map(f => f.getBoundingClientRect());
  const home = document.querySelector('.bd-ab[data-ab=home] iframe.bd-ab-fr').getBoundingClientRect();
  return [Math.min(...fs.map(r => r.left)), home.right, home.top];
})()`;

export default {
  doc: 'acme-site',
  query: 'diff=A',
  posterAt: 1.2,
  cursor: [640, 640],

  async prepare(ctx) {
    site = await startFixture(ctx);
    toRevB(ctx, site);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(TWINS_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({fit: true})`);
    await settle(c);
    // pinch about the point that brings the pair to 40 px from each side of the view
    const [left, right, top] = await c.ev(PAIR);
    const f = (1280 - 80) / (right - left), x = (40 - left * f) / (1 - f);
    await c.place([x, top]);
    await c.wheel(-Math.log(f) / 0.012, { ctrl: true, ms: 300 });
    await settle(c);
  },

  async run(c) {
    await c.pause(900);
    // the outlined hero on each: rev A, then rev B
    await c.moveTo({ sel: '.bd-ab[data-ab=home] iframe.bd-ab-fr', x: -0.6, y: 0.2 }, { ms: 650 });
    await c.pause(500);
    await c.moveTo({ sel: '.bd-ab[data-ab=home] iframe.bd-ab-fr', x: 0.4, y: 0.2 }, { ms: 700 });
    await c.pause(700);
    await c.click(`.bd-twinsg button[data-v="single"]`, { ms: 700 });
    await c.waitFor(`!BP.board().twin`);
    await settle(c);
    await c.pause(1000);
  },
};
