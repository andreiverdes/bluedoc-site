// Every doc type, the home page: one search across every doc's titles, sections, findings and paths. Type "carts":
// the cards narrow to the two that match, best match first, the plan on top, with the words marked.
import { seedHome } from './_shared/home-seed.mjs';

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [760, 420],

  async setup(c) {
    await seedHome(c);
    // the Docs section's grid under the top bar and its search field
    await c.ev(`window.scrollTo({top: [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Docs').getBoundingClientRect().top + scrollY - 80, behavior: 'instant'})`);
    await c.waitForSelector('input[placeholder="Search docs"]');
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: 'input[placeholder="Search docs"]', x: 0.35 }, { ms: 650 });
    await c.pause(250);
    await c.type('carts', { cps: 9 });
    await c.waitFor(`/best match first/.test(document.body.textContent)`);
    await c.pause(400);
    await c.moveTo({ text: 'saved', in: '.bd-grid' }, { ms: 650 });
    await c.pause(1500);
  },
};
