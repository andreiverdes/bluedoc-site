// Every doc type, the home page: Statistics, from the sidebar. Activity counts the doc edits by day, Decisions what is
// decided across the docs (and the docs with the most left open), Waiting on agent lists what was sent; the range
// switches from 14 to 30 days.
import { seedHome } from './_shared/home-seed.mjs';


export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [700, 330],

  async setup(c) {
    await seedHome(c);
    await c.ev(`window.scrollTo({top: 0, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(600);
    await c.click({ text: 'Statistics', in: '.bd-side' }, { ms: 650 });
    await c.waitFor(`location.pathname === '/stats' && /Waiting on agent/.test(document.body.innerText) && /Acme order path/.test(document.querySelector('.bd-main').innerText)`);
    await c.pause(900);
    await c.moveTo({ text: 'decided' }, { ms: 600 });
    await c.pause(1000);
    // what was sent: acme-orders' change request
    await c.moveTo({ text: 'Acme order path', in: '.bd-main' }, { ms: 650 });
    await c.pause(1000);
    await c.click({ text: '30 d' }, { ms: 650 });
    await c.waitFor(`/30 days/.test(document.body.textContent)`);
    await c.pause(1400);
  },
};
