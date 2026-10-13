// Docs: the blueprint canvas pans and zooms. A drag slides the order path across, a pinch zooms in on the
// orders-api → order-events → fulfilment-worker run (edges keep their right angles, labels stay clear of nodes),
// and Fit brings the whole drawing back.
const CV = '#cv-orders';

export const crf = 25; // the blueprint's grid, glow and marching dashes in every frame

export default {
  doc: 'acme-orders',
  posterAt: 0.4,
  cursor: [690, 560], // empty grid between orders DB and the seeder

  async setup(c) {
    await c.waitForSelector(CV);
    // a click on a node would open its details card under the drawing and shrink the stage: keep it on the drawing.
    // The how-to hint fades at the first touch: without it the loop starts as it ends
    await c.addStyle(`${CV} .bp-detail, ${CV} .bp-hint { display: none !important; }`);
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    await c.click(`${CV} .bp-tb button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
  },

  async run(c) {
    await c.pause(600);

    // drag the drawing by an empty patch of grid: it slides left and up
    await c.drag([690, 560], [480, 470], { ms: 650 });
    await c.pause(200);

    // pinch zoom in on the events (local) label: order-events above it, the seeder below, right angles all round
    await c.moveTo({ sel: `${CV} .bp-elbl[data-edge="seeder->bus"]` }, { ms: 450 });
    await c.wheel(-42, { ctrl: true, ms: 800 });
    await c.pause(800);

    // Fit frames the whole drawing again
    await c.click(`${CV} .bp-tb button[aria-label="Fit drawing"]`, { ms: 600 });
    await c.pause(700);
    await c.moveTo([690, 560], { ms: 550 });
    await c.pause(150);
  },
};
