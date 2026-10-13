// Every doc type: compare two revisions word by word. From the Revisions panel, Changes from 1 marks what is new,
// changed and removed since rev 1: the header's words struck and added, then a new paragraph and a removed note.
export const gif = true;

export default {
  doc: 'acme-review-findings',
  posterAt: 3.2,
  cursor: [700, 520],

  // rev 2 of the example only changes parts; edit it in place (no new rev) so the compare also has a new block and a
  // removed one: the summary's note on how the review ran goes, a line on the merge order comes in
  prepare(ctx) {
    const doc = ctx.bd.docPath('acme-review-findings');
    ctx.py('build.py', 'patch', doc, 'block:summary/1', '--delete', '--no-bump');
    ctx.py('build.py', 'patch', doc, 'section:summary', '--no-bump',
      '--append', JSON.stringify({ type: 'text', md: 'Merge order: #412 first, then #415, so the retry change ships on the new tier prices.' }));
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
    await c.pause(700);
    // the first change: the header, words struck and added
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 650 });
    await c.pause(1300);
    // a new paragraph and a removed note, from the changes list
    await c.click({ text: 'Note callout', in: '.bd-sp' }, { ms: 750 });
    await c.pause(1500);
  },
};
