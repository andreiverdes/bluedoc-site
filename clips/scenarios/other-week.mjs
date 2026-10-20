// Other: what changed since last week. The agent rebuilds the status page for week 42 as the next rev of the same
// doc; from the Revisions tab, Changes from the rev before marks the new title, dates and TL;DR word by word, then the
// numbers table cell by cell.

export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [700, 520],

  // the week 42 update on the temp copy: the header, the stat, the TL;DR and the numbers table
  prepare(ctx) {
    const doc = ctx.bd.docPath('acme-status');
    ctx.py('build.py', 'patch', doc, 'doc', '--json', JSON.stringify({
      title: 'Acme shop status, week 42',
      subtitle: 'Orders, uptime, incidents and open decisions for the Acme shop, 12 to 18 October 2026.',
      hero: { icon: 'box', value: '19,160', label: 'orders placed, week 42' },
      tldr: 'The shop took 19,160 orders, 4% more than week 41. Checkout uptime rose to 99.99%, with no incidents. One decision is open: when to start the saved carts rollout.',
    }), '--change', 'Week 42: the title, the stat and the TL;DR.');
    ctx.py('build.py', 'patch', doc, 'meta', '--set', 'date=2026-10-18', '--no-bump');
    ctx.py('build.py', 'patch', doc, 'lead:numbers', '--set', 'lead=Orders grew 4% on week 41; refunds fell to 1.1%.', '--no-bump');
    ctx.py('build.py', 'patch', doc, 'block:numbers/0', '--no-bump', '--json', JSON.stringify({
      columns: ['Metric', 'Week 41', 'Week 42', 'Change'],
      rows: [
        ['Orders placed', '18,420', '19,160', '+4.0%'],
        ['Checkout uptime', '99.97%', '99.99%', '+0.02 pt'],
        ['p95 checkout latency', '430 ms', '405 ms', '−25 ms'],
        ['Refund rate', '1.2%', '1.1%', '−0.1 pt'],
        ['Orders shipped within 24 h', '97.4%', '98.2%', '+0.8 pt'],
      ],
    }), '--change', 'Week 42 numbers, against week 41.');
  },

  async setup(c) {
    await c.ev(`BP.sidebar({open: true, section: 'revisions'})`);
    await c.waitForSelector('.bd-rv.on a.bp-btn[href*="diff="]');
    await c.pause(300);
  },

  async run(c) {
    await c.pause(600);
    await c.click('.bd-rv.on a.bp-btn[href*="diff="]', { ms: 650 });
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('.bd-revtb')`);
    await c.pause(300);
    // the header: week 41 → 42, the dates, the TL;DR
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 650 });
    await c.pause(1400);
    // the numbers, cell by cell
    await c.click({ text: 'Row Orders placed', in: '.bd-sp' }, { ms: 700 });
    await c.pause(1700);
  },
};
