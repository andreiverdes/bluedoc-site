// Every doc type: compare two revisions word by word. In the Revisions pane, the current rev's Changes from 3 marks
// what is new, changed and removed since rev 3: the next change shows a new paragraph (green) and a removed note
// (struck), then a finding from the Changes list shows its lead's words struck.
const CHG = '#bd-sp-revisions a.rv-chg[href*="diff="]';

export default {
  doc: 'acme-review-findings',
  posterAt: 3.4,
  cursor: [700, 520],

  // rev 4 of the example only renames branches; edit it in place (no new rev) so the compare also has a new block and
  // a removed one: the summary's note on how the review ran goes, a line on the merge order comes in
  prepare(ctx) {
    const doc = ctx.bd.docPath('acme-review-findings');
    ctx.py('build.py', 'patch', doc, 'block:summary/1', '--delete', '--no-bump');
    ctx.py('build.py', 'patch', doc, 'section:summary', '--no-bump',
      '--append', JSON.stringify({ type: 'text', md: 'Merge order: #412 first, then #415, so the retry change ships on the new tier prices.' }));
  },

  async setup(c) {
    await c.ev(`BP.sidebar({open: true, section: 'revisions'})`);
    await c.waitForSelector(CHG);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(600);
    await c.click(CHG, { ms: 650 });
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('button[aria-label="Next change"]')`);
    await c.pause(700);
    // the first change: a new paragraph, the removed note under it
    await c.click('button[aria-label="Next change"]', { ms: 650 });
    await c.pause(1400);
    // a changed finding, from the Changes list: its lead's words struck
    await c.click({ text: '#412 · bulk discount tiers', in: '#bd-sp-revisions' }, { ms: 750 });
    await c.pause(1600);
  },
};
