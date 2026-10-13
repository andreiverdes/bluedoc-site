// Every doc type, the home page: each card draws its doc (hover the docs card and its flow plays), and the cards lay
// out as a grid, a list or a board with columns Needs you, Waiting on agent, In progress and Done.
import { seedHome } from './_shared/home-seed.mjs';

const VIEW = (name) => ({ text: name, in: '[role=radiogroup][aria-label=View]' });

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [900, 420],

  async setup(c) {
    await seedHome(c);
    await c.ev(`window.scrollTo({top: [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Docs').getBoundingClientRect().top + scrollY - 80, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(600);
    // the docs card: hovering plays its flow
    await c.moveTo({ text: 'Architecture · 3 levels' }, { ms: 650 });
    await c.pause(1400);
    await c.click(VIEW('List'), { ms: 650 });
    await c.pause(1100);
    await c.click(VIEW('Board'), { ms: 500 });
    await c.pause(1700);
  },
};
