// Every doc type, the home page: one search across every doc's titles, sections, findings and paths. Type "carts":
// the cards narrow to the two that match (2 of 8 · best match first), the plan on top, with the words marked in each
// card's title and text.
import { seedHome } from './_shared/home-seed.mjs';

// the hero's search field (the home repeats it in a top bar that slides in on scroll: not that one)
const SEARCH = `[...document.querySelectorAll('input[aria-label="Search docs"]')].find((i) => i.getBoundingClientRect().top > 80)`;

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [760, 420],

  async setup(c) {
    await seedHome(c);
    // the docs as cards: each shows a matching line under its title
    await c.ev(`[...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.trim() === 'Cards' && b.getBoundingClientRect().top > 80).click()`);
    await c.waitFor(`[...document.querySelectorAll('[role=radio]')].some((b) => b.textContent.trim() === 'Cards' && b.getAttribute('aria-checked') === 'true')`);
    await c.ev(`window.scrollTo({top: 0, behavior: 'instant'})`);
    await c.ev(`(${SEARCH}).classList.add('clip-q')`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: '.clip-q', x: 0.15 }, { ms: 650 });
    await c.pause(250);
    await c.type('carts', { cps: 9 });
    await c.waitFor(`/2 of 8 · best match first/.test(document.body.textContent) && document.querySelectorAll('mark').length > 2`);
    await c.pause(400);
    // the plan's title, its matching word marked
    await c.moveTo({ sel: 'mark', x: 0.5, y: 0.5, dy: 22 }, { ms: 650 });
    await c.pause(1500);
  },
};
