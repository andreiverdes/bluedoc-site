// Every doc type: light and dark. On the home page the theme key swaps the night city for the day one; the choice
// carries to a doc (here acme-orders, opened from Waiting on agent), whose own key flips it back to dark.
import { seedHome } from './_shared/home-seed.mjs';

const DOC_KEY = '.bd-bar button[title="Switch light or dark theme"], .bd-bar button[aria-label="Switch light or dark theme"]';
// the home page has a theme key in the banner's corner, in the top bar that slides in on scroll and in the sidebar's
// foot: the banner's, top right
const homeKey = (c) =>
  c.ev(`(() => { const b = [...document.querySelectorAll('button[aria-label$=" theme"]')]
      .find((b) => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.top < 60 && r.left > 900; });
    const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);

export default {
  doc: 'home',
  posterAt: 2.2,
  cursor: [900, 160],

  async setup(c) {
    // acme-orders waits on the agent, so the Waiting on agent widget links to it from the first screen
    await seedHome(c);
    await c.ev(`window.scrollTo({top: 0, behavior: 'instant'})`);
    // flip to light and back once before recording, so the day banner is already decoded when the clip flips it
    // (otherwise one frame shows the banner empty while its image decodes)
    const key = `[...document.querySelectorAll('button[aria-label$=" theme"]')].find((b) => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.top < 60 && r.left > 900; })`;
    await c.ev(`${key}.click()`);
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'light'`);
    await c.pause(1200);
    await c.ev(`${key}.click()`);
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'dark'`);
    await c.pause(800);
  },

  async run(c) {
    await c.pause(600);
    await c.click(await homeKey(c), { ms: 650 });
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'light'`);
    await c.pause(1300);
    await c.click({ text: 'Acme order path' }, { ms: 750 });
    await c.waitFor(`!!window.BP && !!document.querySelector(${JSON.stringify(DOC_KEY)})`);
    await c.pause(1100);
    await c.click(DOC_KEY, { ms: 700 });
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'dark'`);
    await c.pause(1200);
  },
};
