// Docs: edge kinds and node states read at a glance. With the flows paused, the lines hold still in their own dash,
// and the cursor points out a control call (authorize, dashed), PayCo marked unverified, the seeder marked local and an
// async event (order.placed, violet dots). Play starts the flows again, as the clip opened.
const CV = '#cv-orders';
const TB = `${CV} .bp-tb`;
const PLAY = `${TB} button[aria-label="Play or pause flows"]`;
const label = (edge) => `${CV} .bp-elbl[data-edge="${edge}"]`;
const node = (key) => `${CV} .bp-node[data-key="${key}"]`;

export default {
  doc: 'acme-orders',
  posterAt: 2.6,
  cursor: { sel: PLAY, dy: 2 }, // on the play key, where the clip ends

  async setup(c) {
    await c.waitForSelector(CV);
    await c.addStyle(`${CV} .bp-detail, ${CV} .bp-hint { display: none !important; }`); // the hint fades at the first touch
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    await c.click(`${TB} button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
  },

  async run(c) {
    await c.pause(500);

    // pause the flows: the lines hold still, each in its own dash
    await c.click(null);
    await c.waitFor(`BP.state('orders').tokens === 0`, 2000);
    await c.pause(150);

    await c.moveTo({ sel: label('api->pay'), dy: 14 }, { ms: 750 });
    await c.pause(500);
    await c.moveTo({ sel: node('pay'), x: 0.62, y: 0.55 }, { ms: 400 });
    await c.pause(500);
    await c.moveTo({ sel: node('seeder'), x: 0.62, y: 0.55 }, { ms: 600 });
    await c.pause(500);
    await c.moveTo({ sel: label('api->bus'), dy: 14 }, { ms: 500 });
    await c.pause(600);

    // play: the flows run again
    await c.click({ sel: PLAY, dy: 2 }, { ms: 650 });
    await c.waitFor(`BP.state('orders').tokens > 0`, 2000);
    await c.pause(350);
  },
};
