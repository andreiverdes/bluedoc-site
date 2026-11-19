// Plans: follow a step to the files it touches. Open step 3, click its openapi.yaml chip: the page scrolls to that
// row of the changed files tree (A/M/D/R letters, a Step chip per row) and flashes it; a click on the row shows its
// reason under the name, the src/ folder folds away, and the row's Step 3 chip jumps back to the step.
const TOP = 64; // the Steps heading just under the app bar
const STEP = '#step-plan-routes';
const ROW = '.bp-frow[data-path="services/orders-api/openapi.yaml"]';
const SRC = '.bp-fdir[data-dir="services/orders-api/src"]';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 4.4,
  cursor: [1150, 520],

  async setup(c) {
    await c.waitForSelector(STEP);
    await c.ev(`BP.sidebar({ open: false })`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(300);
    await c.ev(`scrollTo({ top: document.querySelector('#steps').getBoundingClientRect().top + scrollY - ${TOP}, behavior: 'instant' })`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: `${STEP} .bp-step-t`, x: 0.3 }, { ms: 600 });
    await c.waitFor(`document.querySelector('${STEP}').classList.contains('open')`);
    await c.pause(400);

    // a file chip: the page scrolls to its row in the files tree, which flashes
    await c.click(`${STEP} .bp-fchip[data-path$="openapi.yaml"]`, { ms: 550 });
    await c.waitFor(`document.querySelector('${ROW}').classList.contains('bd-flash')`);
    await c.pause(700);

    // the row opens on its reason
    await c.click({ sel: `${ROW} .bp-fhit .nm`, x: 0.4 }, { ms: 500 });
    await c.waitFor(`document.querySelector('${ROW}').classList.contains('open')`);
    await c.pause(800);

    // fold the src/ folder above it
    await c.click({ sel: `${SRC} > .bp-fdir-b`, x: 0.04 }, { ms: 550 });
    await c.waitFor(`document.querySelector('${SRC}').classList.contains('shut')`);
    await c.pause(800);

    // the row's Step chip leads back
    await c.click(`${ROW} .bp-fstep`, { ms: 600 });
    await c.waitFor(`document.querySelector('${STEP}').classList.contains('bd-flash')`);
    await c.pause(1100);
  },
};
