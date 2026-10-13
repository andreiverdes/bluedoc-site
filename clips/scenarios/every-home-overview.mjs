// Every doc type, the home page: the overview widgets. Decisions counts what is decided across the docs, Waiting on
// agent lists what was sent, By type splits the docs; a By type row filters the cards below.
import { seedHome } from './_shared/home-seed.mjs';

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [700, 330],

  async setup(c) {
    await seedHome(c);
    // the Overview heading at the top of the frame, the first row of cards under the widgets
    await c.ev(`window.scrollTo({top: [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Overview').getBoundingClientRect().top + scrollY - 24, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(600);
    await c.moveTo({ text: 'decided' }, { ms: 600 });
    await c.pause(900);
    await c.moveTo({ text: 'Changes requested ·' }, { ms: 650 });
    await c.pause(900);
    await c.click({ text: 'Designs', in: '.bd-widgets' }, { ms: 650 });
    await c.pause(1600);
  },
};
