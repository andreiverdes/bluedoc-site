// Every doc type: comment on one question. Open it from its folded head, write in the reply field under its answers and
// Save: the comment lists in the question's conversation, not sent yet, and Request changes counts it.
const ITEM = '#item-decisions-prices';
const REPLY = `${ITEM} > .ac-reply`;

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector(`${REPLY} textarea`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the questions folded to their heads, the Decisions list mid-frame with this question in it
    await c.ev(`[...document.querySelectorAll('#cl-decisions .bd-ftb button')].find((b) => /Collapse all/.test(b.textContent)).click()`);
    await c.waitFor(`!document.querySelector('${ITEM}').classList.contains('open')`);
    // the cards fold with an animation: scroll once the list has its final height
    await c.pause(800);
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 250, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: `${ITEM} .bp-cl-head`, x: 0.3, y: 0.3 }, { ms: 600 });
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('open')`);
    await c.pause(450);
    await c.click({ sel: `${REPLY} textarea`, x: 0.3 }, { ms: 600 });
    await c.pause(200);
    await c.type('Show the notice text shoppers see', { cps: 28 });
    await c.pause(250);
    await c.click(`${REPLY} .ac-go`, { ms: 450 });
    await c.waitFor(`/1/.test(document.querySelector('.bd-anntb .go').textContent) && !!document.querySelector('${ITEM} .ac-convo .bp-msg')`);
    await c.pause(500);
    await c.moveTo({ sel: '.bd-anntb .go', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(1300);
  },
};
