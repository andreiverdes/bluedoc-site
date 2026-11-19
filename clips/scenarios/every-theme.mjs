// Every doc type: light and dark. On the home page the theme key swaps the night city for the day one; the choice
// carries to a doc (here acme-orders, opened from its row in the docs table), whose ☀/☾ switch in the app bar flips
// it back to dark.
import { seedHome } from './_shared/home-seed.mjs';

const DOC_SWITCH = '.bd-thsw';
// the home page has a theme key in the banner's corner and one in the sidebar's foot: the banner's, top right
const HOME_KEY = `[...document.querySelectorAll('button[aria-label$=" theme"]')].find((b) => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.top < 60 && r.left > 900; })`;
const homeKey = (c) => c.ev(`(() => { const r = (${HOME_KEY}).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);

export default {
  doc: 'home',
  posterAt: 2.2,
  cursor: [900, 160],

  async setup(c) {
    await seedHome(c);
    await c.ev(`window.scrollTo({top: 0, behavior: 'instant'})`);
    // flip to light and back once before recording, so the day banner is already decoded when the clip flips it
    // (otherwise one frame shows the banner empty while its image decodes)
    await c.ev(`(${HOME_KEY}).click()`);
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'light'`);
    await c.pause(1200);
    await c.ev(`(${HOME_KEY}).click()`);
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'dark'`);
    await c.pause(800);
  },

  async run(c) {
    await c.pause(600);
    await c.click(await homeKey(c), { ms: 650 });
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'light'`);
    await c.pause(1300);
    await c.click({ text: 'Acme order path', in: 'table, [role=table], main' }, { ms: 750 });
    await c.waitFor(`!!window.BP && !!document.querySelector('${DOC_SWITCH}')`);
    await c.pause(1100);
    await c.click(DOC_SWITCH, { ms: 700 });
    await c.waitFor(`localStorage.getItem('bluedoc:theme') === 'dark'`);
    await c.pause(1200);
  },
};
