// Shared steps for the pres-* scenarios on acme-fit-deck: the panes (a deck's left pane has two tabs, Brief and
// Slides; the right pane holds Comments and Revisions) and rev B (a reworded Weekly actives slide) for pres-compare.
// The camera helpers (view, settled) are the design board's: a deck is a board of slides.
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;

/**
 * Set the panes: left is false, 'brief' or 'slides' (true: Slides), the left pane's two tabs; right is true or false,
 * or the right pane's section to open ('comments', 'revisions').
 */
export async function panels(c, { left = false, right = false } = {}) {
  await c.waitFor(`!!(window.BP && BP.board() && document.querySelector('.bd-board'))`);
  await c.pause(300);
  const want = left === 'brief' ? 'brief' : left ? 'screens' : null;
  for (let i = 0; i < 6; i++) {
    const st = await c.ev(`({ open: BP.board().panel, tab: document.querySelector('.bd-lp-tabs2 [aria-selected=true]')?.dataset.f })`);
    if (want ? st.open && st.tab === want : !st.open) break;
    // the lit key of the tab on show shuts the pane; the other key opens it on that tab
    await c.click(`.bd-stripe.l .bd-sk[data-f=${want ?? st.tab}]`, { ms: 1 });
    await c.pause(400);
  }
  await c.ev(`BP.sidebar(${JSON.stringify(typeof right === 'string' ? { open: true, section: right } : { open: right })})`);
  // the board refits while the panes slide: wait until its width holds
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
