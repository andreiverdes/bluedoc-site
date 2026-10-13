// Docs: a blueprint canvas plays its data flows; a double-click opens orders-api (its own flow plays), a pinch zoom
// opens pricing inside it, and Fit brings the whole drawing back. Full screen gives the drawing the whole frame.
const CV = '#cv-orders';
const node = (key) => `${CV} .bp-node[data-key="${key}"]`;

export default {
  doc: 'acme-orders',
  posterAt: 0.6,
  cursor: [905, 610],

  async setup(c) {
    await c.waitForSelector(CV);
    // the details card under the drawing would shrink the stage mid-zoom: keep the clip on the drawing
    await c.addStyle(`${CV} .bp-detail { display: none !important; }`);
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    // full screen needs a real click (a user gesture); the drawing fits the window
    await c.click(`${CV} .bp-tb button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
    await c.waitFor(`BP.state('orders').tokens > 0`);
  },

  async run(c) {
    await c.pause(800); // the production flow runs across the systems

    // double-click orders-api: the drawing flies into it and its inner flow takes over
    await c.dblclick({ sel: node('api'), x: 0.42, y: 0.4 }, { ms: 700 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api'`, 3000);
    await c.pause(1300);

    // pinch zoom into pricing until its own parts open. Zooming keeps the point under the cursor still, so the
    // cursor goes to the point that lands pricing in the middle of the stage: just past its right edge.
    const z = await c.ev(`(() => {
      const cv = BP.canvases.orders, n = cv.byKey['api/price'], a = n._abs, st = cv.stage.getBoundingClientRect();
      const f = 1.02 / n._childAbs.s / cv.k;
      const cx = st.left + cv.tx + (a.x + a.w / 2) * cv.k, cy = st.top + cv.ty + (a.y + a.h / 2) * cv.k;
      const vx = st.left + st.width / 2, vy = st.top + st.height / 2;
      return { x: (cx * f - vx) / (f - 1), y: (cy * f - vy) / (f - 1), deltaY: -Math.log(f) / 0.012 };
    })()`);
    await c.moveTo([z.x, z.y], { ms: 550 });
    await c.pause(100);
    await c.wheel(z.deltaY, { ctrl: true, ms: 1000 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api,api/price'`, 3000);
    await c.pause(1200);

    // Fit: back out to the whole system
    await c.click(`${CV} .bp-tb button[aria-label="Fit drawing"]`, { ms: 650 });
    await c.pause(800);
  },
};
