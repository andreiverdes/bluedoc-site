// Every doc type: a general comment, about the whole doc rather than one spot, from the field at the foot of the
// Comments panel; once saved it lists first, above the comments on single spots.
export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('.bd-gc textarea');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    // a comment on one spot is already waiting, so the general one has something to list above
    await c.ev(`BP.annotate({type: 'text', key: 'tldr', quote: 'one 18-minute slowdown in pricing is fixed', note: 'Link the incident report'})`);
    await c.waitFor(`BP.annotations().length === 1 && document.querySelectorAll('.bd-cs-l li').length === 1`);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-gc textarea', { ms: 650 });
    await c.pause(200);
    await c.type('Add the week 42 forecast', { cps: 26 });
    await c.pause(250);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().some((a) => a.type === 'general')`);
    await c.pause(250);
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.55 }, { ms: 600 });
    await c.pause(1200);
  },
};
