// Plans: follow a step to the files it touches. Open step 3, click its openapi.yaml chip: the page scrolls to that
// row of the changed files and flashes it; the row's Step 3 link jumps back to the step.
const TOP = 64; // the Steps heading just under the app bar
const STEP = '#step-plan-routes';
const ROW = '.bp-frow[data-path="services/orders-api/openapi.yaml"]';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 3.2,
  cursor: [1150, 520],

  async setup(c) {
    await c.waitForSelector(STEP);
    await c.ev(`BP.sidebar({ open: false })`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(300);
    await c.ev(`scrollTo(0, document.querySelector('#steps').getBoundingClientRect().top + scrollY - ${TOP})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: `${STEP} .bp-step-t`, x: 0.3 }, { ms: 600 });
    await c.waitFor(`document.querySelector('${STEP}').classList.contains('open')`);
    await c.pause(450);

    // a file chip: the page scrolls to its row in the changed files, which flashes
    await c.click(`${STEP} .bp-fchip[data-path$="openapi.yaml"]`, { ms: 600 });
    await c.waitFor(`document.querySelector('${ROW}').classList.contains('bd-flash')`);
    await c.pause(900);

    // the row's step link leads back
    await c.click(`${ROW} .bp-fstep`, { ms: 600 });
    await c.waitFor(`document.querySelector('${STEP}').classList.contains('bd-flash')`);
    await c.pause(1100);
  },
};
