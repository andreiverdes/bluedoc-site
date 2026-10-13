// Every doc type: the eye key fades the comment marks (a pin, a marked phrase, a drawing) out to read the page clean,
// then brings them back.
export default {
  doc: 'acme-orders',
  posterAt: 0.3,
  cursor: [600, 640],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .eye');
    await c.ev(`BP.sidebar({open: false})`);
    await c.ev(`BP.annotate({type: 'draw', key: 'tldr', color: 'warn', note: 'Say which relay alert fires'})`);
    await c.ev(`BP.annotate({type: 'text', key: 'tldr', quote: 'one Postgres transaction', note: 'Name the isolation level'})`);
    await c.ev(`BP.annotate({type: 'pin', key: 'node:orders/api', pos: {x: 0.5, y: 0.45}, note: 'Show the retry policy'})`);
    await c.waitFor(`BP.annotations().length === 3`);
    // the TL;DR and the blueprint's top row in the frame
    await c.ev(`window.scrollTo({top: document.querySelector('.bd-tldr').getBoundingClientRect().top + scrollY - 110, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .eye', { ms: 600 });
    await c.pause(1200);
    await c.click('.bd-anntb .eye', { ms: 200 });
    await c.pause(1000);
  },
};
