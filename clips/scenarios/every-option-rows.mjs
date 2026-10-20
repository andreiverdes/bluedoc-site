// Every doc type: options are rows, and a question can take several answers. On Who can save a cart? (multi), a row's
// one-line explanation opens to the full text; then two options are ticked and the question reads 2 picked.
const ITEM = '#item-decisions-guests';
const opt = (id) => `${ITEM} .bp-opt[data-id=${id}]`;

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 600],

  async setup(c) {
    await c.waitForSelector(`${opt('accounts')} .pk`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the question mid-frame, the previous question's last rows above it
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 240, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(800);
    await c.click({ sel: `${opt('support')} .oh`, x: 0.6, y: 0.5 }, { ms: 650 });
    await c.waitFor(`document.querySelector('${opt('support')}').classList.contains('open')`);
    await c.pause(1100);
    await c.click(`${opt('accounts')} .pk`, { ms: 600 });
    await c.pause(350);
    await c.click(`${opt('business')} .pk`, { ms: 450 });
    await c.waitFor(`document.querySelectorAll('${ITEM} .bp-opt.on').length === 2`);
    await c.pause(300);
    await c.moveTo({ sel: `${ITEM} .bp-cl-picked`, x: 0.3, y: 0.5, dy: 36 }, { ms: 650 });
    await c.pause(1300);
  },
};
