// Plans: read a plan from its goal to its risks. A trackpad scroll runs from the header and TL;DR through the
// proposed canvas, the before/after panes over the wireframe, the numbered steps and the changed files, to the risks.
const TOP = 60; // a block just under the app bar
const to = (sel) => `(document.querySelector('${sel}').getBoundingClientRect().top - ${TOP})`;

export const crf = 32; // five scrolls of small text, the canvas's flow playing
export const dropGlitches = true; // the canvas's tiles, unrastered for a frame as it scrolls in

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 0.3,
  cursor: [1150, 560], // in the gutter right of the page, clear of the text

  async setup(c) {
    await c.waitForSelector('.bp-files');
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(900); // the status chip, the title, the TL;DR

    await c.wheel(await c.ev(to('#cv-arch')), { ms: 550 });
    await c.pause(850); // the proposed canvas

    await c.wheel(await c.ev(to('#approach .bp-cmpr')), { ms: 520 });
    await c.pause(850); // before/after, the wireframe under it

    await c.wheel(await c.ev(to('#steps')), { ms: 520 });
    await c.pause(800); // the numbered steps

    await c.wheel(await c.ev(to('#files')), { ms: 520 });
    await c.pause(800); // the changed files

    await c.wheel(await c.ev(to('#risks')), { ms: 520 });
    await c.pause(1000); // the risks
  },
};
