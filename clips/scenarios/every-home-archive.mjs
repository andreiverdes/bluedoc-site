// Every doc type, the home page: archive a doc from its row (acme-orders). The row opens in place with Open, Open in
// new tab and Archive; Archive takes it out of the table and every count (8 docs → 7), with Undo in the toast; then
// Status: Archived lists it alone, dimmed, with an Archived badge.
import { HOME_READY, showProject } from './_shared/home-seed.mjs';

const ROW = '.bd-r[data-key$="/acme-orders.bluedoc.json"]';
// a visible button by its words, and the docs' own Status key (the home repeats the toolbar in a top bar that slides
// in on scroll: not that one)
const BUTTON = (words) => `[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '${words}' && b.getBoundingClientRect().top > 80)`;
const STATUS = `[...document.querySelectorAll('button.bd-fc')].find((b) => b.textContent.trim().startsWith('Status') && b.getBoundingClientRect().top > 80)`;
const at = (c, el) => c.ev(`(() => { const r = (${el}).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [900, 380],

  async setup(c) {
    await showProject(c);
    await c.goto('home');
    await c.waitFor(HOME_READY);
    await c.waitForSelector(`${ROW} .cv`);
    // the hero, the filters and the docs table (Rows, the home's default view)
    await c.ev(`window.scrollTo({top: 0, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(500);
    await c.click({ sel: `${ROW} .cv`, x: 0.5, y: 0.5 }, { ms: 600 });
    await c.waitFor(`document.querySelector('${ROW}').getAttribute('aria-expanded') === 'true' && !!(${BUTTON('Archive')})`);
    await c.pause(600);
    await c.click(await at(c, BUTTON('Archive')), { ms: 550 });
    await c.waitFor(`!document.querySelector('${ROW}') && /7 docs/.test(document.body.textContent)`);
    await c.pause(1000);
    await c.click(await at(c, STATUS), { ms: 600 });
    await c.waitForSelector('[role=menu]');
    await c.pause(350);
    await c.click({ text: 'Archived', in: '[role=menu]' }, { ms: 500 });
    await c.waitFor(`/1 archived doc/.test(document.body.textContent) && !document.querySelector('[role=menu]')`);
    await c.pause(300);
    // beside the count, off the row (a hovered row lights up)
    const [x, y] = await c.point({ text: '1 archived doc', at: 'end' });
    await c.moveTo([x + 40, y + 18], { ms: 550 });
    await c.pause(1200);
  },
};
