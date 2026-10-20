// Shared steps for the pres-* scenarios on acme-fit-deck: the panels (a deck's left panel is "Slides"; its brief is the
// right panel's Brief tab) and rev B (a reworded Weekly actives slide) for pres-compare. The camera helpers (view,
// settled) are the design board's: a deck is a board of slides.
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;

/**
 * Show or hide the Slides panel (left) and the right panel; right is true or false, or the right panel's tab to open
 * ('brief', 'comments', 'revisions').
 */
export async function panels(c, { left = false, right = false } = {}) {
  await c.waitFor(`!!(window.BP && BP.board() && document.querySelector('.bd-board'))`);
  await c.pause(300);
  for (let i = 0; i < 5 && (await c.ev('BP.board().panel')) !== left; i++) {
    await c.click('button[aria-label="Slides ([)"]', { ms: 1 });
    await c.pause(400);
  }
  await c.ev(`BP.sidebar(${JSON.stringify(typeof right === 'string' ? { open: true, section: right } : { open: right })})`);
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
