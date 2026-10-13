// Presentations: the deck is one column of 16:9 slides in deck order, beside the brief. A trackpad scroll runs down
// from the title to the Q4 ask a slide at a time, and back up.
import { settled, view } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

export const crf = 26;

const K = 0.25, PITCH = (1080 + 280) * K; // a slide and the gap under it, on screen

// a scroll of one slide; the board mounts the next slide once it rests, so each flick ends on a mounted slide
async function flick(c, dir, ms, rest) {
  await c.wheel(dir * PITCH, { ms });
  await c.pause(rest);
}

export default {
  doc: 'acme-fit-deck',
  posterAt: 0.4,
  cursor: [1010, 520],

  async setup(c) {
    await panels(c, { left: true });
    await c.click({ text: 'Brief', in: '.bd-lp' }, { ms: 1 });
    await c.pause(300);
    // the title slide at the top of the stage, under the toolbar (the camera's wheel lands on the board, not on it)
    await view(c, { x: 960, y: 540, k: K, to: [800, 112 + 540 * K] });
    await settled(c);
    await c.moveTo([1010, 520], { ms: 1 });
  },

  async run(c) {
    await c.pause(800);
    for (let i = 0; i < 3; i++) await flick(c, 1, 520, 480);
    await c.pause(500);
    for (let i = 0; i < 3; i++) await flick(c, -1, 460, 380);
    await c.pause(300);
  },
};
