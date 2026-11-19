// Every doc type, the home page: filter by status, then by type. Each menu shows its counts; the docs table narrows to
// match (Status: Awaiting approval, 2 of 8: the website and the plan, as plans, designs and websites are approved and
// the design already is; then Type: Plans, the plan alone) and each filter stays as a chip with ×.
import { seedHome } from './_shared/home-seed.mjs';

// the docs' own filter key (the home repeats the toolbar in a top bar that slides in on scroll: not that one)
const FILTER = (label) => `[...document.querySelectorAll('button.bd-fc')].find((b) => b.textContent.trim().startsWith('${label}') && b.getBoundingClientRect().top > 80)`;
const at = (c, label) => c.ev(`(() => { const r = (${FILTER(label)}).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
const ITEM = (text) => ({ text, in: '[role=menu]' });

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [760, 330],

  async setup(c) {
    await seedHome(c);
    // at the top: the hero, the stat line, the filters and the table (a narrowed table is shorter than the frame, so a
    // scrolled page would jump back up mid-clip)
    await c.ev(`window.scrollTo({top: 0, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    await c.click(await at(c, 'Status'), { ms: 650 });
    await c.waitForSelector('[role=menu]');
    await c.pause(450);
    await c.click(ITEM('Awaiting approval'), { ms: 500 });
    await c.waitFor(`document.querySelectorAll('a.t').length === 2 && !document.querySelector('[role=menu]')`);
    await c.pause(1000);
    await c.click(await at(c, 'Type'), { ms: 600 });
    await c.waitForSelector('[role=menu]');
    await c.pause(400);
    await c.click(ITEM('Plans'), { ms: 500 });
    await c.waitFor(`document.querySelectorAll('a.t').length === 1 && !document.querySelector('[role=menu]')`);
    await c.pause(300);
    await c.moveTo({ sel: 'a.t', x: 0.6, y: 0.5, dy: 22 }, { ms: 600 });
    await c.pause(1300);
  },
};
