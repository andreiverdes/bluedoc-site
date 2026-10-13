// Every doc type: a comment goes Pending → Open → Resolved. Request changes sends two pending notes, which turn
// Open; the agent's rev 2 adds the row one asked for and resolves it (build.py patch --resolves), and after the reload
// it reads Resolved by the agent.

// a hand-drawn box just outside the table: one stroke, x/y as fractions of the table's box
const BOX = [[-0.012, -0.04, 0.5, -0.05, 1.012, -0.035, 1.015, 0.5, 1.01, 1.04, 0.5, 1.05, -0.01, 1.035, -0.015, 0.5, -0.012, -0.02]];

export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [700, 560],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .go');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    // the Numbers heading under the app bar; a reload keeps the scroll
    await c.ev(`window.scrollTo({top: document.querySelector('#numbers').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
    await c.ev(`BP.annotate({type: 'text', key: 'section:numbers', quote: 'refunds held at 1.2%', note: 'Say why refunds held'})`);
    await c.ev(`BP.annotate({type: 'draw', key: 'block:numbers/0', color: 'warn', strokes: ${JSON.stringify(BOX)}, note: 'Add average order value'})`);
    await c.waitFor(`BP.annotations().length === 2 && document.querySelectorAll('.bd-cs-l li').length === 2`);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .go', { ms: 650 });
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.pause(500);
    await c.click('.bd-chgs .bp-btn.primary', { ms: 600 });
    await c.waitFor(`BP.annotations().every((a) => a.status === 'open')`);
    await c.pause(900);

    // the agent's next revision adds the row and marks that comment resolved
    const id = await c.ev(`BP.annotations().find((a) => a.type === 'draw').id`);
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-status'), 'block:numbers/0',
      '--append', '["Average order value", "€41.20", "€42.10", "+2.2%"]',
      '--change', 'Added average order value to the numbers.', '--resolves', id);
    await c.reload();
    await c.waitFor(`BP.annotations().some((a) => a.status === 'resolved') && BP.sidebar().open`);
    await c.pause(700);
    await c.click('.bd-cs-f .bd-sg button:nth-child(3)', { ms: 600 });
    await c.pause(300);
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.6 }, { ms: 550 });
    await c.pause(1200);
  },
};
