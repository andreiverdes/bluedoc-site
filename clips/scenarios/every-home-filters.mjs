// Every doc type, the home page: filter by status, then by type. Each chip shows its count; the overview and the
// cards narrow to match (Awaiting approval: the website, the design and the plan; then Plans: the plan alone).
import { seedHome } from './_shared/home-seed.mjs';

const SCROLL = 268; // the search box at the top of the frame, the chips, the overview and the first row of cards

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [760, 300],

  async setup(c) {
    await seedHome(c);
    await c.ev(`window.scrollTo({top: ${SCROLL}, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    // the status chip (the first "Awaiting approval" on the page: the cards' badges come after it)
    await c.click({ text: 'Awaiting approval' }, { ms: 650 });
    await c.pause(1300);
    await c.click('button.bd-fc.t-plan', { ms: 600 });
    await c.pause(1600);
  },
};
