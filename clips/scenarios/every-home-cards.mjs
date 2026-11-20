// Every doc type, the home page: the docs as Rows or Cards. Rows is a table grouped by day, each with its type, project,
// status, decisions and rev; a row opens in place (acme-orders: its summary, what's left to check, Open and Archive).
// Cards draws each doc: the plan's steps and file counts, the docs' blueprint, the design's screens.
import { seedHome } from './_shared/home-seed.mjs';

const ROW = '.bd-r[data-key$="/acme-orders.bluedoc.json"]';
// the docs' own view switch (the home repeats the toolbar in a top bar that slides in on scroll: not that one)
const VIEW = (name) => `[...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.trim() === '${name}' && b.getBoundingClientRect().top > 80)`;
const SCROLL = 150; // the stat line at the top of the frame, the view switch and the table under it

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [900, 230],

  async setup(c) {
    await seedHome(c);
    await c.ev(`window.scrollTo({top: ${SCROLL}, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(600);
    await c.click({ sel: `${ROW} .cv`, x: 0.5, y: 0.5 }, { ms: 650 });
    await c.waitFor(`document.querySelector('${ROW}').getAttribute('aria-expanded') === 'true'`);
    await c.pause(1400);
    // by element, looked up on every step of the move: the open row can still shift the page while the cursor travels
    // (the switch renders anew only on a change, so the mark holds until the click)
    await c.ev(`(${VIEW('Cards')}).classList.add('clip-cards')`);
    await c.moveTo({ sel: '.clip-cards', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(200);
    await c.click({ sel: '.clip-cards', x: 0.5, y: 0.5 }, { ms: 120 });
    // (the switch renders anew on a change: look it up again)
    await c.waitFor(`(${VIEW('Cards')}).getAttribute('aria-checked') === 'true' && !!document.querySelector('a.bd-card')`);
    await c.pause(500);
    // the docs card: its blueprint
    await c.moveTo({ sel: '.bd-cw:has(a.bd-card[href$="/acme-orders.bluedoc.json"]) .bd-art', x: 0.5, y: 0.6 }, { ms: 650 });
    await c.pause(1600);
  },
};
