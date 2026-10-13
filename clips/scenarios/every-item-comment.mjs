// Every doc type: comment on one item. Write in a question's comment box and Save: the item shows a comment mark and
// Request changes counts it.
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('#item-decisions-prices .bp-note-ta');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(`window.scrollTo({top: document.querySelector('#questions .bp-cl').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ sel: '#item-decisions-prices .bp-note-ta', x: 0.3 }, { ms: 650 });
    await c.pause(200);
    await c.type('Show the notice text shoppers see', { cps: 28 });
    await c.pause(250);
    await c.click('#item-decisions-prices .bp-note .bp-btn.primary', { ms: 450 });
    await c.waitFor(`/1/.test(document.querySelector('.bd-anntb .go').textContent)`);
    await c.pause(300);
    await c.moveTo({ sel: '.bd-anntb .go', x: 0.5, y: 0.5 }, { ms: 700 });
    await c.pause(1300);
  },
};
