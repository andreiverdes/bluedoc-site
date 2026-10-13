// Plans: before and after side by side, then the mockup. The API response today and the proposed one sit in two
// panes; under them, a click on the cart page wireframe opens it full size in the lightbox.
const TOP = 64; // the compare block just under the app bar

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 1.2,
  cursor: [1150, 520],

  async setup(c) {
    await c.waitForSelector('#approach .bp-media img');
    await c.ev(`BP.sidebar({ open: false })`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(300);
    await c.ev(`scrollTo(0, document.querySelector('#approach .bp-cmpr').getBoundingClientRect().top + scrollY - ${TOP})`);
    await c.waitFor(`document.querySelector('#approach .bp-media img').complete`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    // today's cart, then what the saved-carts route returns
    await c.moveTo({ text: '"expiresAt"', in: '.bp-cmpr-side.before' }, { ms: 600 });
    await c.pause(500);
    await c.moveTo({ text: '"pricesChanged"', in: '.bp-cmpr-side.after' }, { ms: 650 });
    await c.pause(700);

    // the wireframe under the panes: a click opens it full size
    await c.wheel(await c.ev(`(() => { const r = document.querySelector('#approach .bp-media').getBoundingClientRect(); return r.top + r.height / 2 - 420; })()`), { ms: 550 });
    await c.pause(200);
    await c.click({ sel: '#approach .bp-media img', x: 0.62, y: 0.45 }, { ms: 550 });
    await c.waitFor(`document.querySelector('dialog.bd-lb')?.open`);
    // a move puts the cursor back above the modal lightbox
    await c.moveTo({ sel: 'dialog.bd-lb img', x: 0.8, y: 0.32 }, { ms: 550 });
    await c.pause(1100);
  },
};
