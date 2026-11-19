// Every doc type with approval: an approval holds across a progress-only revision. Rev 1 is approved; the agent's
// rev 2 only marks a step done, so the chip stays Approved · rev 1 · progress in rev 2. Its rev 3 edits the content,
// and the chip turns to Changes since approved rev 1: Approve asks again.
import { readFileSync, writeFileSync } from 'node:fs';

const DOC = 'acme-saved-carts-plan';
// the doc and its history, the two files build.py patch writes
const files = (c) => [c.bd.docPath(DOC), c.bd.docPath(DOC).replace(/\.json$/, '.history.json')];
const save = (c) => files(c).map((f) => readFileSync(f));
const restore = (c, rev) => files(c).forEach((f, i) => writeFileSync(f, rev[i]));
let revs;

export default {
  doc: DOC,
  // on Approved · rev 1 · progress in rev 2
  posterAt: 3.3,
  cursor: [700, 420],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    await c.ev(`BP.sidebar({open: false})`);
    // the reader approved rev 1 (with the recommended picks)
    await c.ev(`BP.acceptRecommended('decisions')`);
    await c.waitFor(`BP.progress().find((p) => p.id === 'decisions').done === 3`);
    await c.click('.bd-anntb .approve', { ms: 100 });
    await c.waitForSelector('dialog.bd-approve[open] .ft .pri');
    await c.click('dialog.bd-approve[open] .ft .pri', { ms: 100 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    // the agent's two revisions, made now and put in place during the take (a patch takes over a second, a still
    // stretch in the clip): rev 2 marks step 1 done, nothing else; rev 3 edits a step's title
    const rev1 = save(c);
    c.bd.py('build.py', 'patch', c.bd.docPath(DOC), 'step:steps/0/table', '--set', 'status=done',
      '--change', 'Step 1 is done: the `saved_carts` table is live.');
    const rev2 = save(c);
    c.bd.py('build.py', 'patch', c.bd.docPath(DOC), 'step:steps/0/routes', '--set',
      'title=Add the four `/v1/saved-carts` routes, with rate limits', '--change', 'Step 3 adds rate limits to the routes.');
    revs = { 2: rev2, 3: save(c) };
    restore(c, rev1);
    await c.reload();
    // a page loaded with the Comments pane closed opens Contents instead: the page alone
    await c.ev(`BP.contents({open: false})`);
    await c.waitFor(`BP.planState().rev === '1' && BP.planState().state === 'approved' && !BP.sidebar().open`);
  },

  async run(c) {
    // the pointer rests just under the chip, so its words stay readable
    const under = async (text) => {
      const [x, y] = await c.point({ text });
      return [x, y + 16];
    };
    await c.pause(500);
    await c.moveTo(await under('Approved · rev 1'), { ms: 600 });
    await c.pause(500);

    // rev 2: the agent marks step 1 done, nothing else
    restore(c, revs[2]);
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && BP.planState().carried`);
    await c.pause(300);
    await c.moveTo(await under('progress in rev 2'), { ms: 500 });
    await c.pause(1400);

    // rev 3: a content edit, so the approval no longer covers it
    restore(c, revs[3]);
    await c.reload();
    await c.waitFor(`BP.planState().rev === '3' && BP.planState().state === 'stale'`);
    await c.pause(300);
    await c.moveTo(await under('Changes since approved rev 1'), { ms: 500 });
    await c.pause(1400);
  },
};
