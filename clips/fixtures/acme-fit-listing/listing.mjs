// Shared steps for the listing-* scenarios on acme-fit-listing: the panels, the left panel's tabs, scrolling the
// platform page, and waiting until the shots on screen have rendered.
//
// Before the recording starts nothing asks headless Chrome for frames, so the page doesn't paint: panels stop
// mid-slide and the shot frames stay blank, then the first recorded second paints them all at once. settle() moves
// the cursor a little (each input event waits for a frame) until the page's animations end and its shots are ready.

/** The listing has drawn its sections. */
export const LISTING_READY = `!!(window.BP && BP.listing && document.querySelector('.bd-lst-sec'))`;

/** Every shot frame mounted on screen has rendered (the page mounts the ones in view, then the rest as they near). */
export const SHOTS_READY = `BP.listing().tiles.filter(t => t.live).every(t => t.ready)`;

const STILL = `!document.getAnimations().some(a => a.playState === 'running' && !(a.effect && a.effect.getComputedTiming().iterations === Infinity))`;

export async function shotsReady(c, timeout = 20_000) {
  await c.waitFor(SHOTS_READY, timeout);
  await settle(c);
}

/** Paint frames (small cursor moves) until the page holds still and its shots are ready; the cursor ends where it was. */
export async function settle(c, rounds = 8) {
  const [x, y] = [c.x, c.y];
  for (let i = 0; i < rounds; i++) {
    await c.moveTo([x + (i % 2 ? 2 : -2), y], { ms: 90 });
    if (i >= 3 && (await c.ev(`${STILL} && ${SHOTS_READY}`))) break;
  }
  await c.moveTo([x, y], { ms: 60 });
}

/**
 * The left panel (Text, Style, Colors, Checks) open or shut, the right one (Brief, Comments, Revisions) shut unless
 * asked, and the left panel on `tab`. The page remembers the left panel: a toggle is followed by a reload, so the
 * recording starts on a page that loaded that way (a page left mid-slide before the first recorded frame now and
 * then stops painting in headless Chrome).
 */
export async function panels(c, { left = true, right = false, tab = 'text' } = {}) {
  await c.waitFor(LISTING_READY, 30_000);
  if ((await c.ev('BP.listing().toolbar.lp')) !== left) {
    await c.ev(`document.querySelector('.bd-lst-btb button[aria-keyshortcuts="["]').click()`);
    await c.pause(400);
    await c.reload();
    await c.waitFor(LISTING_READY, 30_000);
  }
  await c.ev(`BP.sidebar({open: ${right}})`);
  if (left && tab) await setTab(c, tab);
  // the toolbar refits while the panels slide: wait until the page's width holds
  let w = -1;
  for (let i = 0; i < 40; i++) {
    await c.pause(150);
    const now = await c.ev(`document.querySelector('.bd-lst-main').getBoundingClientRect().width`);
    if (now === w) break;
    w = now;
  }
  await shotsReady(c);
}

/** The left panel's tab, picked without a click (setup). */
export async function setTab(c, tab) {
  await c.ev(`document.querySelector('.bd-lst-lpt button[data-v=${tab}]').click()`);
  await c.pause(200);
}

/** Scroll the platform page (setup) so a section (by its row: shared, watch, phone, tablet) sits under the toolbar. */
export async function toRow(c, row, dy = 0) {
  await c.ev(`(() => { const m = document.querySelector('.bd-lst-main'), s = m.querySelector('.bd-lst-sec[data-row=${row}]');
    m.scrollTop += s.getBoundingClientRect().top - m.getBoundingClientRect().top - 56 + ${dy}; })()`);
  await c.pause(300);
  await shotsReady(c);
}

/** Scroll the left panel's open pane (setup) so its element `sel` sits `dy` px below the pane's top. */
export async function paneTo(c, sel, dy = 12) {
  await c.ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); let p = el.parentElement;
    while (p && !(p.scrollHeight > p.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
    if (p) p.scrollTop += el.getBoundingClientRect().top - p.getBoundingClientRect().top - ${dy}; })()`);
  await c.pause(200);
}

/**
 * Answer the next file dialog the page opens (an <input type=file>'s click) with `file`, as a reader picking it does.
 * Call it before the click that opens the dialog.
 */
export async function answerFileDialog(c, file) {
  await c.tab.call('Page.setInterceptFileChooserDialog', { enabled: true });
  return new Promise((ok) => {
    const off = c.tab.on('Page.fileChooserOpened', async ({ backendNodeId }) => {
      off();
      await c.tab.call('DOM.setFileInputFiles', { files: [file], backendNodeId });
      await c.tab.call('Page.setInterceptFileChooserDialog', { enabled: false });
      ok();
    });
  });
}
