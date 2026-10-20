// Every doc type: Need more details, a question's last option row: the question opens on its reply box, which asks
// what is missing; Request changes counts it and Approve plan greys out until the agent answers.
const ITEM = '#item-decisions-retention';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .bp-opt.more .pk`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(`window.scrollTo({top: document.querySelector('#questions .bp-cl').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`${ITEM} .bp-opt.more .pk`, { ms: 650 });
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('more') && document.activeElement === document.querySelector('${ITEM} .bp-note-ta')`);
    await c.pause(400);
    await c.type('What does 180 days cost in storage?', { cps: 28 });
    await c.pause(250);
    await c.click(`${ITEM} .bp-note .bp-btn.primary`, { ms: 450 });
    await c.pause(300);
    await c.moveTo({ sel: '.bd-anntb .approve', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(1400);
  },
};
