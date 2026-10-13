// Docs: pick a flow and step through it. The Flow menu switches to the Local stack path (seeder → order-events →
// worker → WMS stub), pause stops it, and › › ‹ walk its steps one at a time while the caption follows.
const CV = '#cv-orders';
const TB = `${CV} .bp-tb`;

export default {
  doc: 'acme-orders',
  posterAt: 3.2,
  cursor: [1000, 700],

  async setup(c) {
    await c.waitForSelector(CV);
    await c.ev(`document.querySelector('${CV}').scrollIntoView({block: 'center', behavior: 'instant'})`);
    await c.pause(300);
    await c.click(`${TB} button[aria-label="Full screen"]`, { ms: 200 });
    await c.waitFor(`!!document.fullscreenElement && BP.state('orders').k > 0.9`);
    await c.pause(800);
    await c.waitFor(`BP.state('orders').flow === 'prod' && BP.state('orders').tokens > 0`);
  },

  async run(c) {
    await c.pause(600); // the Production path plays

    // the Flow menu: Local stack path. A headless screencast never shows a native menu, so the menu stays shut and
    // the pick lands with the click, as choosing it would.
    await c.ev(`document.querySelector('${TB} select').addEventListener('mousedown', (e) => e.preventDefault(), { once: true })`);
    await c.click(`${TB} select`, { ms: 600 });
    await c.ev(`(() => { const s = document.querySelector('${TB} select'); s.value = '1'; s.dispatchEvent(new Event('change')); })()`);
    await c.waitFor(`BP.state('orders').flow === 'local'`, 2000);
    await c.pause(600); // its first step runs: the seeder publishes events

    // pause, then one step at a time from wherever it paused (the flow has 3 steps and wraps)
    await c.click(`${TB} button[aria-label="Play or pause flows"]`, { ms: 450 });
    await c.pause(350);
    const s0 = await c.ev(`BP.state('orders').step`);
    const at = (d) => `BP.state('orders').step === ${(((s0 + d) % 3) + 3) % 3}`;
    await c.click(`${TB} button[aria-label="Next step"]`, { ms: 380 });
    await c.waitFor(at(1), 2000);
    await c.pause(600);
    await c.click(`${TB} button[aria-label="Next step"]`, { ms: 200 });
    await c.waitFor(at(2), 2000);
    await c.pause(600);
    await c.click(`${TB} button[aria-label="Previous step"]`, { ms: 300 });
    await c.waitFor(at(1), 2000);
    await c.pause(1000);
  },
};
