// Every doc type: comment on one item. Open a question (its details and comment box show only while it's open), write
// in its comment box and Save: Request changes counts it.
const ITEM = '#item-decisions-prices';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .bp-note-ta`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the question under the app bar, closed
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 90, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: `${ITEM} .bp-cl-head`, x: 0.4, y: 0.3 }, { ms: 600 });
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('open')`);
    await c.pause(300);
    await c.scrollTo(`${ITEM} .bp-note-ta`, { block: 'center', ms: 700 });
    await c.click({ sel: `${ITEM} .bp-note-ta`, x: 0.3 }, { ms: 500 });
    await c.pause(200);
    await c.type('Show the notice text shoppers see', { cps: 28 });
    await c.pause(250);
    await c.click(`${ITEM} .bp-note .bp-btn.primary`, { ms: 450 });
    await c.waitFor(`/1/.test(document.querySelector('.bd-anntb .go').textContent)`);
    await c.pause(300);
    await c.moveTo({ sel: '.bd-anntb .go', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(1300);
  },
};
