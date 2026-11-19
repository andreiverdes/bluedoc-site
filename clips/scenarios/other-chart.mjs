// Other docs: a chart block. acme-status's "Orders per day" is drawn in the page: hovering a day shows both weeks'
// values, a legend chip hides Week 40 and brings it back, and the ☀/☾ switch redraws it in the light theme.
// The server is fixtures/share-standin's (the app bar's Share key talks to the stand-in gh, not GitHub).
import { standinServer } from '../fixtures/share-standin/standin.mjs';

const DOC = 'acme-status';
const CHART = '.bp-chart:has(.bp-ch-li[data-series="w40"])';
const CHIP = `${CHART} .bp-ch-li[data-series="w40"]`;
let bd = null;

// the plot point of day i (0 = Mon) on Week 41's line, as a viewport point
const day = (c, i) => c.ev(`(() => {
  const dots = document.querySelectorAll(${JSON.stringify(`${CHART} g[data-series="w41"] circle.dot`)});
  if (dots[${i}]) { const r = dots[${i}].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  const r = document.querySelector(${JSON.stringify(`${CHART} .bp-ch-plot svg`)}).getBoundingClientRect();
  return [r.left + r.width * (0.08 + 0.84 * ${i} / 6), r.top + r.height * 0.4];
})()`);

export default {
  url: () => bd.urlFor(DOC),
  posterAt: 1.6,
  cursor: [1000, 620],

  async prepare(ctx) {
    bd = await standinServer({
      repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-chart`,
    });
    return () => bd.stop();
  },

  async setup(c) {
    await c.waitFor(`!!window.BP && document.querySelectorAll(${JSON.stringify(`${CHART} .bp-ch-plot svg path.ln`)}).length === 2`);
    await c.ev('BP.sidebar({ open: false }), BP.contents({ open: false })');
    await c.pause(300);
    await c.ev(`scrollTo({ top: document.querySelector(${JSON.stringify(CHART)}).getBoundingClientRect().top + scrollY - 72, behavior: 'instant' })`);
    await c.pause(500);
  },

  async run(c) {
    await c.pause(600);
    await c.moveTo(await day(c, 3), { ms: 650 });
    await c.pause(1000);

    // Week 40 off, then back on
    await c.click(CHIP, { ms: 550 });
    await c.waitFor(`document.querySelector(${JSON.stringify(CHIP)}).getAttribute('aria-pressed') === 'false'`);
    await c.pause(900);
    await c.click(CHIP, { ms: 250 });
    await c.waitFor(`document.querySelector(${JSON.stringify(CHIP)}).getAttribute('aria-pressed') === 'true'`);
    await c.pause(350);

    // light theme: drawn again in its colours
    await c.click('.bd-thsw', { ms: 600 });
    await c.waitFor(`document.documentElement.dataset.theme === 'light'`);
    await c.pause(400);
    await c.moveTo(await day(c, 4), { ms: 650 });
    await c.pause(1000);
  },
};
