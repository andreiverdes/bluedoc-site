// Shared steps for the pres-* scenarios on acme-fit-deck: the panels (a deck's left panel is "Slides and brief") and
// rev B (a reworded Weekly actives slide) for pres-compare. The camera helpers (view, settled) are the design board's:
// a deck is a board of slides.
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;

/** Show or hide the Slides/Brief panel (left) and the Comments/Revisions panel (right), as the reader does. */
export async function panels(c, { left = false, right = false } = {}) {
  await c.waitFor(`!!(window.BP && BP.board() && document.querySelector('.bd-board'))`);
  await c.pause(300);
  for (let i = 0; i < 5 && (await c.ev('BP.board().panel')) !== left; i++) {
    await c.click('button[aria-label="Slides and brief ([)"]', { ms: 1 });
    await c.pause(400);
  }
  await c.ev(`BP.sidebar({open: ${right}})`);
  // the board refits while the panels slide: wait until its width holds
  let w = -1;
  for (let i = 0; i < 40; i++) {
    await c.pause(150);
    const now = await c.ev(`document.querySelector('.bd-board').getBoundingClientRect().width`);
    if (now === w) break;
    w = now;
  }
  await c.pause(200);
}

/** prepare(): rev B from rev A on the temp copy: the Weekly actives slide reworded to lead with the 2.1× jump. */
export function revB(ctx) {
  ctx.py('build.py', 'patch', ctx.bd.docPath('acme-fit-deck'), 'artboard:actives', '--html', join(here, 'actives-rev-b.html'),
    '--change', 'Weekly actives leads with the 2.1× jump since June; 41,800 moves to the line under it.');
}
