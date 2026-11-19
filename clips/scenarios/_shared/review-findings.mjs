// Shared setup for the acme-review-findings clips: the page's own width (no comments pane), one PR section in a
// given view and filter, and a scroll that puts an element just under the PR's sticky header (its title row and the
// findings toolbar: All · Open · Done, Accept recommended, Collapse all, ⋯, Checklist · Diff · Merged).

/**
 * Closes the comments pane and shows section (pr-412 | pr-415) in view (merged | checklist | diff); filter (all |
 * open | done) is the toolbar's: a review opens on Open, which hides the findings you answered.
 */
export async function findingsView(c, section, view, { filter = 'open' } = {}) {
  await c.waitForSelector(`#${section} .bd-ftb`);
  await c.ev(`BP.sidebar({open: false})`);
  await c.waitFor(`!BP.sidebar().open`);
  await c.ev(`BP.findingsView(${JSON.stringify(section)}, ${JSON.stringify(view)})`);
  await c.ev(`BP.findingsFilter(${JSON.stringify(section)}, ${JSON.stringify(filter)})`);
  await c.waitFor(`BP.findingsView(${JSON.stringify(section)}) === ${JSON.stringify(view)}`);
}

/**
 * Scrolls at once so sel's top sits at y px in the viewport (the app bar is 56 px; a PR's sticky header, title row and
 * toolbar, ends near 150).
 */
export async function scrollTop(c, sel, y) {
  await c.ev(`window.scrollTo({top: document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY - ${y}, behavior: 'instant'})`);
  await c.pause(300);
}

/** Waits until a smooth page scroll (a jump to a finding, say) has come to rest. */
export function scrollSettled(c) {
  return c.waitFor(`new Promise((done) => { const y = scrollY; setTimeout(() => done(scrollY === y), 150); })`);
}
