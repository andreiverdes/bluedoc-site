// Designs: comment on an element inside a screen. Point picks the Start workout button in Today (its data-bd name
// labels it: start-workout); the note is saved as a pending comment keyed el:today/start-workout, listed in the
// Comments panel under Board › Today.
import { panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

export default {
  doc: 'acme-fit-design',
  posterAt: -0.5,
  cursor: [1060, 430],

  async setup(c) {
    await panels(c, { right: true });
    await view(c, { x: 785, y: 1808, k: 0.62, to: [470, 440] });
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click('button.bd-key[aria-label="Point"]', { ms: 700 });
    await c.waitFor(`BP.board().mode === 'point'`);
    await c.pause(200);
    // Start workout, inside Today's frame
    await c.moveTo({ sel: '.bd-ab[data-ab="today"] .bd-ab-scr', x: 0.4, y: 0.62 }, { ms: 750 });
    await c.pause(450);
    await c.click(null);
    await c.waitFor(`!!document.querySelector('textarea:focus, [contenteditable]:focus')`);
    await c.pause(300);
    await c.type('Make this the main action', { cps: 28 });
    await c.pause(250);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().some(a => a.target.key === 'el:today/start-workout')`);
    await c.key('v'); // View again: the pointer stops picking elements on its way out
    await c.waitFor(`BP.board().mode === 'view'`);
    await c.moveTo([1060, 430], { ms: 600 });
    await c.pause(1200);
  },
};
