// Docs: what changed since you last read it. The reader has seen rev 1 of acme-orders; the agent's rev 2 (real
// build.py patches) adds a notify-worker to the architecture canvas, gives orders DB an outbox_dead table and rewrites
// the relay-lag risk to match. On reload, Updated since you last opened it → Show what changed: the canvas marks the
// new part green and the changed one amber, with a What changed list under it; the risk has its words struck and added.

const CV = '#cv-orders';

// the agent's rev 2 on the temp copy
function patchRev2(bd) {
  const doc = bd.docPath('acme-orders');
  const canvas = JSON.parse(bd.py('build.py', 'get', doc, 'block:path/0'));
  bd.py('build.py', 'patch', doc, 'block:path/0', '--json', JSON.stringify({
    nodes: [...canvas.nodes, { id: 'notify', label: 'notify-worker', sub: 'Node · order emails', col: 1, row: 2,
      md: 'Emails the buyer an order confirmation when `order.placed` arrives.' }],
    edges: [...canvas.edges, { from: 'bus', to: 'notify', label: 'confirmation', kind: 'async' }],
  }), '--change', 'New: notify-worker emails the buyer on `order.placed`.');
  bd.py('build.py', 'patch', doc, 'node:orders/db', '--no-bump', '--set', 'sub=Postgres 16 · orders, outbox, outbox_dead');
  bd.py('build.py', 'patch', doc, 'block:issues/0', '--no-bump', '--set',
    'md=The relay retries a failing publish 5 times, then moves the row to `outbox_dead`. A broken broker shows up as a growing `outbox_dead` table, not as an error. Alert on any `outbox_dead` row.',
    '--change', 'The relay gives up after 5 tries and moves the row to `outbox_dead`.');
}

export const crf = 27; // the blueprint's grid and glow in every frame

export default {
  doc: 'acme-orders',
  posterAt: 5.7,
  cursor: [900, 400],

  async setup(c) {
    // the reader opened rev 1; the agent's rev 2 lands; the reader opens the doc again
    await c.waitForSelector(CV);
    await c.pause(500);
    patchRev2(c.bd);
    await c.reload();
    await c.waitForSelector('.bd-revbar a.bp-btn.primary[href*="diff="]');
    await c.ev(`BP.sidebar({open: false})`);
    await c.ev(`scrollTo({top: 0, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700); // Updated since you last opened it: 1 → 2
    await c.click('.bd-revbar a.bp-btn.primary[href*="diff="]', { ms: 600 });
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('.bd-revtb') && !!document.querySelector('${CV} .bp-node.chg-add')`);
    await c.pause(450); // Rev 1 → 2: 2 changed; the Revisions panel lists them
    await c.click('.bd-sp button[aria-label="Close the panel"]', { ms: 450 });
    await c.pause(150);
    // the canvas: orders DB changed (amber), notify-worker new (green), and What changed under it
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 500 });
    await c.pause(600);
    // pinch in on the two marked parts, one above the other
    await c.moveTo({ sel: `${CV} .bp-node.chg-mod`, x: 0.5, y: 1.6 }, { ms: 550 });
    await c.wheel(-40, { ctrl: true, ms: 700 });
    await c.pause(300);
    await c.moveTo({ sel: `${CV} .bp-node.chg-add`, x: 0.92, y: 0.85 }, { ms: 500 });
    await c.pause(600);
    // the risk callout: its words struck and added
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 650 });
    await c.pause(1600);
  },
};
