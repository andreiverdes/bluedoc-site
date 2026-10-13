// Docs: the drawing full screen. From the page, Full screen gives the drawing the whole window, a drag moves it off
// centre, Fit frames it again, and Esc returns to the page, where Fit frames the drawing in its own box again.
const CV = '#cv-orders';
const TB = `${CV} .bp-tb`;

export default {
  doc: 'acme-orders',
  posterAt: 1.6,
  cursor: [900, 520],

  async setup(c) {
    await c.waitForSelector(CV);
    await c.addStyle(`${CV} .bp-hint { display: none !important; }`); // the hint fades at the first touch
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.pause(400);
    // the drawing's toolbar just under the app bar: the page around it shows above and below
    await c.ev(`scrollTo(0, document.querySelector('${CV}').getBoundingClientRect().top + scrollY - 64)`);
    // a desktop browser puts the page back where it was after full screen; headless Chrome's resize on the way out
    // loses the scroll position, so put it back as the browser would: at once, on the resize, before a paint
    await c.ev(`(() => {
      const y = scrollY, back = () => { if (!document.fullscreenElement) scrollTo({ top: y, behavior: 'instant' }); };
      addEventListener('resize', back);
      document.addEventListener('fullscreenchange', back);
    })()`);
    await c.waitFor(`BP.state('orders').tokens > 0`);
  },

  async run(c) {
    await c.pause(500);

    await c.click(`${TB} button[aria-label="Full screen"]`, { ms: 600 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`, 3000);
    await c.pause(650);

    // off centre by a drag on the grid, then Fit
    await c.drag([690, 560], [520, 470], { ms: 450 });
    await c.pause(150);
    await c.click(`${TB} button[aria-label="Fit drawing"]`, { ms: 550 });
    await c.pause(700);

    // Esc leaves full screen; the drawing keeps its zoom, and Fit frames it in the page's box
    await c.key('Escape');
    await c.waitFor(`!document.fullscreenElement`, 3000);
    await c.pause(250);
    await c.click(`${TB} button[aria-label="Fit drawing"]`, { ms: 500 });
    await c.pause(500);
    await c.moveTo([900, 520], { ms: 550 });
    await c.pause(200);
  },
};
