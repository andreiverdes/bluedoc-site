// Every doc type: switch to an earlier revision. The Revisions tab lists each rev with the author's note on what
// changed; open rev 1 and it shows read-only, the current rev one click away.
export default {
  doc: 'acme-review-findings',
  posterAt: 1.2,
  cursor: [700, 420],

  async setup(c) {
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
  },

  async run(c) {
    await c.pause(600);
    await c.click({ text: 'Revisions', in: '.bd-sp' }, { ms: 650 });
    await c.waitForSelector('.bd-rv.on');
    await c.pause(250);
    // rev 2's note in full: what changed and why
    await c.click({ sel: '.bd-rv.on .rv-h', x: 0.4 }, { ms: 550 });
    await c.pause(1300);
    // rev 1 opens read-only
    await c.click('.bd-rv:not(.on) a.bp-btn[href*="rev="]', { ms: 550 });
    await c.waitFor(`!!window.BP && BP.revisions().some((r) => r.shown && r.rev === '1')`);
    await c.pause(500);
    await c.moveTo({ text: 'read-only' }, { ms: 700 });
    await c.pause(1300);
  },
};
