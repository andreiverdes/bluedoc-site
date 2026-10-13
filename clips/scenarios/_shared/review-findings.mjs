// Shared setup for the acme-review-findings clips: the page's own width (no comments panel), one PR section in a
// given view, and a scroll that puts an element just under the sticky [Merged][Checklist][Diff] bar.

/** Closes the comments panel and shows section (pr-412 | pr-415) in view (merged | checklist | diff). */
export async function findingsView(c, section, view) {
  await c.waitForSelector(`#${section} .bd-fvseg`);
  await c.ev(`BP.sidebar({open: false})`);
  await c.waitFor(`!BP.sidebar().open`);
  await c.ev(`BP.findingsView(${JSON.stringify(section)}, ${JSON.stringify(view)})`);
  // the "New: findings and code together" hint fades out on its own mid-clip: hold it back, so the loop's ends match
  await c.addStyle('.bd-fvhint { display: none !important; }');
  await c.waitFor(`BP.findingsView(${JSON.stringify(section)}) === ${JSON.stringify(view)}`);
}

/** Scrolls at once so sel's top sits at y px in the viewport (the app bar is 52 px, the view bar under it 60). */
export async function scrollTop(c, sel, y) {
  await c.ev(`window.scrollTo({top: document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY - ${y}, behavior: 'instant'})`);
  await c.pause(300);
}

/** Waits until a smooth page scroll (a jump to a finding, say) has come to rest. */
export function scrollSettled(c) {
  return c.waitFor(`new Promise((done) => { const y = scrollY; setTimeout(() => done(scrollY === y), 150); })`);
}
