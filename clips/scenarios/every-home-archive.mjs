// Every doc type, the home page: archive a doc from its card's ⋯ menu (the first card). It leaves the cards and
// every count, with Undo in the toast; back up at the chips, Archived lists it alone, dimmed, with an Archived badge.
const CARDS = 760; // the first row of cards mid-frame, under the overview
const CHIPS = 268; // the search box at the top of the frame, the chips, the overview and the first row of cards

export default {
  doc: 'home',
  posterAt: -0.4,
  cursor: [760, 300],

  async setup(c) {
    await c.waitFor(`document.querySelectorAll('button.bd-fc').length > 0`);
    await c.ev(`window.scrollTo({top: ${CARDS}, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(500);
    await c.click('.bd-grid > .bd-cw:first-child .bd-cm-b', { ms: 650 });
    await c.pause(450);
    await c.click('.bd-cm-m [role=menuitem]', { ms: 400 });
    await c.pause(1300);
    await c.ev(`window.scrollTo({top: ${CHIPS}, behavior: 'smooth'})`);
    await c.pause(700);
    await c.click('[role=group][aria-label=Status] .bd-fc:last-child', { ms: 650 });
    await c.pause(1600);
  },
};
