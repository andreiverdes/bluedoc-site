// Every doc type: a comment goes Pending → Open → Resolved. Request changes sends two pending notes, which turn
// Open; the agent's rev 2 adds the row one asked for and resolves it (build.py patch --resolves), and after the reload
// it reads Resolved by the agent.
import { readFileSync, writeFileSync } from 'node:fs';

const DOC = 'acme-status';
// a hand-drawn box just outside the table: one stroke, x/y as fractions of the table's box
const BOX = [[-0.012, -0.04, 0.5, -0.05, 1.012, -0.035, 1.015, 0.5, 1.01, 1.04, 0.5, 1.05, -0.01, 1.035, -0.015, 0.5, -0.012, -0.02]];
// the doc and its history, the two files build.py patch writes
const files = (c) => [c.bd.docPath(DOC), c.bd.docPath(DOC).replace(/\.json$/, '.history.json')];
let rev2;

export default {
  doc: DOC,
  posterAt: -0.4,
  // on the table, not the chart under it (its hover tooltip would open the clip)
  cursor: [700, 250],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .go');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    // the Numbers heading under the app bar; a reload keeps the scroll
    await c.ev(`window.scrollTo({top: document.querySelector('#numbers').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.ev(`BP.annotate({type: 'text', key: 'section:numbers', quote: 'refunds held at 1.2%', note: 'Say why refunds held'})`);
    await c.ev(`BP.annotate({type: 'draw', key: 'block:numbers/0', color: 'accent', strokes: ${JSON.stringify(BOX)}, note: 'Add average order value'})`);
    await c.waitFor(`BP.annotations().length === 2 && document.querySelectorAll('.bd-cs-l li').length === 2`);
    // the agent's next revision adds the row and marks that comment resolved: made now and put in place during the
    // take (a patch takes over a second, a still stretch in the clip)
    const id = await c.ev(`BP.annotations().find((a) => a.type === 'draw').id`);
    const rev1 = files(c).map((f) => readFileSync(f));
    c.bd.py('build.py', 'patch', c.bd.docPath(DOC), 'block:numbers/0',
      '--append', '["Average order value", "€41.20", "€42.10", "+2.2%"]',
      '--change', 'Added average order value to the numbers.', '--resolves', id);
    rev2 = files(c).map((f) => readFileSync(f));
    files(c).forEach((f, i) => writeFileSync(f, rev1[i]));
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .go', { ms: 650 });
    await c.waitForSelector('dialog.bd-chgs[open] .ft .pri');
    await c.pause(500);
    await c.click('dialog.bd-chgs[open] .ft .pri', { ms: 600 });
    await c.waitFor(`BP.annotations().every((a) => a.status === 'open') && !document.querySelector('dialog.bd-chgs[open]')`);
    await c.pause(900);

    files(c).forEach((f, i) => writeFileSync(f, rev2[i]));
    await c.reload();
    await c.waitFor(`BP.annotations().some((a) => a.status === 'resolved') && BP.sidebar().open`);
    await c.pause(700);
    await c.click('.bd-cs-f .bd-sg button[data-f="resolved"]', { ms: 600 });
    await c.pause(300);
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.6 }, { ms: 550 });
    await c.pause(1200);
  },
};
