// Every doc type: switch to an earlier revision. The Revisions key in the app bar opens the timeline: each rev with
// the author's note on what changed; View on rev 1 shows it read-only, with Go to current one click away in the dock.
const REV1 = '#bd-sp-revisions .rvx-i a[href$="?rev=1"]';

export default {
  doc: 'acme-review-findings',
  posterAt: 1.6,
  cursor: [700, 420],

  async setup(c) {
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
  },

  async run(c) {
    await c.pause(600);
    await c.click('.bd-stripe.r .bd-sk[data-f=revisions]', { ms: 650 });
    await c.waitFor(`BP.sidebar().section === 'revisions' && !!document.querySelector('${REV1}')`);
    await c.pause(300);
    // rev 2's note: what changed and why
    await c.moveTo({ text: 'is now a ticket', in: '#bd-sp-revisions' }, { ms: 600 });
    await c.pause(1200);
    // rev 1 opens read-only
    await c.click(REV1, { ms: 600 });
    await c.waitFor(`!!window.BP && BP.revisions().some((r) => r.shown && r.rev === '1')`);
    await c.pause(500);
    await c.moveTo({ text: 'read-only', in: '.bd-anntb' }, { ms: 700 });
    await c.pause(1300);
  },
};
