// Every doc type: Accept recommended, in the decision list's own toolbar, picks every starred answer at once: the three
// folded questions each show their pick, and the list reads 3 of 3 · Answered.
const LIST = '#cl-decisions';
const ACCEPT = `[...document.querySelectorAll('${LIST} .bd-ftb button')].find((b) => /Accept recommended/.test(b.textContent))`;

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitFor(`!!(${ACCEPT})`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the three questions folded to their heads, so the whole list fits above the dock
    await c.ev(`[...document.querySelectorAll('${LIST} .bd-ftb button')].find((b) => /Collapse all/.test(b.textContent)).click()`);
    await c.waitFor(`![...document.querySelectorAll('${LIST} .bp-cl-item')].some((i) => i.classList.contains('open'))`);
    await c.ev(`window.scrollTo({top: document.querySelector('#questions').getBoundingClientRect().top + scrollY - 90, behavior: 'instant'})`);
    await c.ev(`(${ACCEPT}).classList.add('clip-accept')`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.clip-accept', { ms: 700 });
    await c.waitFor(`BP.progress().find((p) => p.id === 'decisions').done === 3`);
    await c.pause(700);
    await c.moveTo({ sel: `${LIST} .bp-cl-h .bd-prm`, x: 0.5, y: 0.5, dy: 18 }, { ms: 650 });
    await c.pause(1400);
  },
};
