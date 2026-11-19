// Every doc type: Tell me more, the pill under a question's answers: the question reads Asking for more and the reply
// field asks what you need to know; Save it, and Request changes counts it while Approve greys out until the agent
// answers.
const ITEM = '#item-decisions-retention';
const REPLY = `${ITEM} > .ac-reply`;

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .ac-tmm`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the question's head under the list toolbar, its reply field above the dock
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 140, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: `${ITEM} .ac-tmm`, x: 0.12 }, { ms: 650 });
    await c.waitFor(`document.activeElement === document.querySelector('${REPLY} textarea')`);
    await c.pause(400);
    await c.type('What does 180 days cost in storage?', { cps: 28 });
    await c.pause(250);
    await c.click(`${REPLY} .ac-go`, { ms: 450 });
    await c.waitFor(`!!document.querySelector('${ITEM} .ac-convo .bp-msg') && document.querySelector('.bd-anntb .approve').disabled`);
    await c.pause(300);
    await c.moveTo({ sel: '.bd-anntb .approve', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(1400);
  },
};
