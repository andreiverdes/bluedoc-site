// Every doc type: Need more details on a decision: the dot turns amber, a field asks what is missing, Request changes
// counts it and Approve plan greys out until the agent answers.
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('#item-decisions-retention .bp-more');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(`window.scrollTo({top: document.querySelector('#questions .bp-cl').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click('#item-decisions-retention .bp-more', { ms: 650 });
    await c.waitFor(`document.querySelector('#item-decisions-retention').classList.contains('more')`);
    await c.pause(250);
    await c.type('What does 180 days cost in storage?', { cps: 28 });
    await c.pause(250);
    await c.click('#item-decisions-retention .bp-note .bp-btn.primary', { ms: 450 });
    await c.pause(300);
    await c.moveTo({ sel: '.bd-anntb .approve', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(1400);
  },
};
