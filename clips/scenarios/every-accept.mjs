// Every doc type: Accept recommended picks every starred option at once: all three decisions fill, Decisions reads
// 3/3 and the key's count drops to 0.
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .acc');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the Decisions checklist's three questions in view, above the tool tray
    await c.ev(`window.scrollTo({top: document.querySelector('#questions .bp-cl').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .acc', { ms: 700 });
    await c.waitFor(`document.querySelectorAll('#questions .bp-cl-item.has-choices.done').length === 3`);
    await c.pause(600);
    await c.moveTo({ text: 'Decisions', in: '.bp-side' }, { ms: 650 });
    await c.pause(1200);
  },
};
