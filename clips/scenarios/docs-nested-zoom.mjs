// Docs hero: a blueprint opens three levels deep. A double-click flies into orders-api (its own flow takes over), a
// pinch zoom opens pricing inside it (rules, tax), then the crumbs climb back: orders-api, then the whole drawing.
// (Esc goes up a level too, but in full screen the browser takes Esc to leave full screen.)
const CV = '#cv-orders';
const node = (key) => `${CV} .bp-node[data-key="${key}"]`;

export const gif = true;
export const crf = 28; // the blueprint's grid, glow and marching dashes in every frame: under 600 KB at 28

export default {
  doc: 'acme-orders',
  posterAt: 0.4,
  cursor: [905, 610],

  async setup(c) {
    await c.waitForSelector(CV);
    // the details card under the drawing would shrink the stage mid-zoom: keep the clip on the drawing
    await c.addStyle(`${CV} .bp-detail, ${CV} .bp-hint { display: none !important; }`); // the hint fades at the first touch
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    // full screen needs a real click (a user gesture); the drawing fits the window
    await c.click(`${CV} .bp-tb button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
    await c.waitFor(`BP.state('orders').tokens > 0`);
  },

  async run(c) {
    await c.pause(500); // the production flow runs across the systems

    // level 1: double-click orders-api; the drawing flies into it and its inner flow takes over
    await c.dblclick({ sel: node('api'), x: 0.42, y: 0.4 }, { ms: 600 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api'`, 3000);
    await c.pause(700);

    // level 2: pinch into pricing until its rules and tax open. A pinch keeps the point under the cursor still, so
    // the cursor goes to the point that lands pricing in the middle of the stage: just past its right edge.
    const z = await c.ev(`(() => {
      const cv = BP.canvases.orders, n = cv.byKey['api/price'], a = n._abs, st = cv.stage.getBoundingClientRect();
      const f = 1.02 / n._childAbs.s / cv.k;
      const cx = st.left + cv.tx + (a.x + a.w / 2) * cv.k, cy = st.top + cv.ty + (a.y + a.h / 2) * cv.k;
      const vx = st.left + st.width / 2, vy = st.top + st.height / 2;
      return { x: (cx * f - vx) / (f - 1), y: (cy * f - vy) / (f - 1), deltaY: -Math.log(f) / 0.012 };
    })()`);
    await c.moveTo([z.x, z.y], { ms: 450 });
    await c.pause(80);
    await c.wheel(z.deltaY, { ctrl: true, ms: 950 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api,api/price'`, 3000);
    await c.pause(850);

    // the orders-api crumb: up one level
    await c.click(`${CV} .bp-crumbs button:nth-of-type(2)`, { ms: 550 });
    await c.waitFor(`BP.state('orders').focus.join() === 'api'`, 3000);
    await c.pause(550);

    // the root crumb: the whole drawing again, where the clip started
    await c.click(`${CV} .bp-crumbs button:nth-of-type(1)`, { ms: 400 });
    await c.waitFor(`BP.state('orders').focus.length === 0`, 3000);
    await c.pause(650);
  },
};
