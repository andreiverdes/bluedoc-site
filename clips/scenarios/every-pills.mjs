// Every doc type: a decision's options are pills, the recommendation starred. Hover the starred one, pick another:
// the dot fills and the question counts as decided (Decisions 1/3).
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 640],

  async setup(c) {
    await c.waitForSelector('#item-decisions-retention .bp-choice');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the Open questions heading under the app bar, the first two questions in view
    await c.ev(`window.scrollTo({top: document.querySelector('#questions').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.moveTo({ sel: '#item-decisions-retention .bp-choice.rec' }, { ms: 650 });
    await c.pause(700);
    await c.click({ text: 'Until deleted', in: '#item-decisions-retention' }, { ms: 500 });
    await c.waitFor(`document.querySelector('#item-decisions-retention').classList.contains('done')`);
    await c.pause(300);
    await c.moveTo({ text: 'Decisions', in: '.bp-side' }, { ms: 700 });
    await c.pause(1300);
  },
};
