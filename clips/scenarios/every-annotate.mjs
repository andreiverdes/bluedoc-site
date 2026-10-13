// Every doc type: pin a comment on an element (Point: here a system in the blueprint), comment on a passage of text
// (Select), and both wait in the Comments panel as change requests for the agent.
const TOOL = (m) => `.bd-anntb button[data-m="${m}"]`;

export default {
  doc: 'acme-orders',
  posterAt: -0.3,
  cursor: [760, 470],

  async setup(c) {
    await c.waitForSelector('.bd-anntb');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    // the TL;DR under the top bar, the blueprint's top row above the tool tray
    await c.ev(`window.scrollTo({top: document.querySelector('.bd-tldr').getBoundingClientRect().top + scrollY - 66, behavior: 'instant'})`);
  },

  async run(c) {
    await c.pause(250);

    // Point: click orders-api in the drawing, write the note, save with ⌘↵
    await c.click(TOOL('point'), { ms: 520 });
    await c.pause(150);
    await c.click({ sel: '#cv-orders .bp-node[data-key="api"]', x: 0.5, y: 0.45 }, { ms: 560 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(120);
    await c.type('Show the retry policy', { cps: 34 });
    await c.pause(200);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(350);

    // Select: drag across a phrase, write the note, save
    await c.click(TOOL('select'), { ms: 520 });
    await c.pause(150);
    await c.selectText('the event never left the outbox', { ms: 750 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(120);
    await c.type('Link the relay runbook', { cps: 34 });
    await c.pause(200);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().length === 2`);

    // both wait in the Comments panel, newest first
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.6 }, { ms: 600 });
    await c.pause(800);
  },
};
