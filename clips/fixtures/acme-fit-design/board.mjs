// Shared steps for the design-* scenarios on acme-fit-design's board: panels, the camera, and rev D (a Today edit
// with a new, a changed and a removed link) for the compare clips.
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;

/**
 * Show or hide the Screens panel (left) and the right panel; right is true or false, or the right panel's tab to open
 * ('brief', 'comments', 'revisions').
 */
export async function panels(c, { left = false, right = false } = {}) {
  await c.waitFor(`!!(window.BP && BP.board() && document.querySelector('.bd-board'))`);
  await c.pause(300);
  for (let i = 0; i < 5 && (await c.ev('BP.board().panel')) !== left; i++) {
    await c.click('button[aria-label="Screens ([)"]', { ms: 1 });
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

/** The board camera: [tx, ty, k] and the stage's box. */
export function camera(c) {
  return c.ev(`(() => {
    const vp = document.querySelector('.bd-bvp'), st = document.querySelector('.bd-board').getBoundingClientRect();
    const m = /translate\\(([-\\d.e]+)px,\\s*([-\\d.e]+)px\\)\\s*scale\\(([-\\d.e]+)\\)/.exec(vp.style.transform);
    return { tx: +m[1], ty: +m[2], k: +m[3], left: st.left, top: st.top, w: st.width, h: st.height };
  })()`);
}

/** Viewport px of a board point. */
export async function at(c, x, y) {
  const v = await camera(c);
  return [v.left + v.tx + x * v.k, v.top + v.ty + y * v.k];
}

/**
 * Setup: put board point (x, y) at viewport point `to` (default: the stage's middle) at zoom k, with wheel events at
 * the cursor. It repeats until the camera holds the view, as an event can land while the board is still refitting.
 */
export async function view(c, { x, y, k, to }) {
  const v0 = await camera(c);
  const [px, py] = to ?? [v0.left + v0.w / 2, v0.top + v0.h / 2];
  await c.moveTo([px, py], { ms: 1 });
  for (let i = 0; i < 6; i++) {
    let v = await camera(c);
    if (Math.abs(v.k / k - 1) > 0.01) await c.wheel(-Math.log(k / v.k) / 0.012, { ctrl: true, ms: 60 });
    await c.pause(120);
    const [sx, sy] = await at(c, x, y);
    if (Math.hypot(sx - px, sy - py) > 2) await c.wheel(sy - py, { deltaX: sx - px, ms: 60 });
    await c.pause(120);
    v = await camera(c);
    const [qx, qy] = await at(c, x, y);
    if (Math.abs(v.k / k - 1) <= 0.01 && Math.hypot(qx - px, qy - py) <= 3) break;
  }
}

/**
 * A visible camera move, as a trackpad does it: a pinch and a pan event each frame, so board point (x, y) glides to
 * viewport point `to` (default: the stage's middle) while the zoom eases to k. A long move dips the zoom on the way,
 * so both ends stay in sight. The cursor stays where it is.
 *
 * The board mounts screens only once the camera rests (140 ms after the last paint), those in the view plus a quarter
 * of it on each side, and unmounts the rest: a stop must already be within that margin of the last rest, or its
 * screens arrive as empty bezels.
 */
export async function glide(c, { x, y, k, to, ms = 1000 }) {
  const v = await camera(c);
  const [px, py] = to ?? [v.left + v.w / 2, v.top + v.h / 2];
  const b0 = [(px - v.left - v.tx) / v.k, (py - v.top - v.ty) / v.k];
  const L0 = Math.log(v.k), L1 = Math.log(k);
  const kFit = (Math.min(v.w, v.h) * 0.9) / Math.max(1, Math.hypot(x - b0[0], y - b0[1]));
  const Lm = Math.min((L0 + L1) / 2, Math.log(kFit));
  const Lc = 2 * Lm - (L0 + L1) / 2;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const send = (o) => c.tab.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: c.x, y: c.y, deltaX: 0, deltaY: 0, ...o });
  const inflight = [];
  const t0 = performance.now();
  for (;;) {
    const p = Math.min(1, (performance.now() - t0) / ms), e = ease(p), u = 1 - e;
    const kt = Math.exp(u * u * L0 + 2 * e * u * Lc + e * e * L1);
    const bx = b0[0] + (x - b0[0]) * e, by = b0[1] + (y - b0[1]) * e;
    // the pinch scales about the cursor; then a pan puts (bx, by) under the point (the camera is tracked, not read)
    const cx = c.x - v.left, cy = c.y - v.top, r = kt / v.k;
    const tx = cx - (cx - v.tx) * r, ty = cy - (cy - v.ty) * r;
    const tx1 = px - v.left - bx * kt, ty1 = py - v.top - by * kt;
    inflight.push(send({ deltaY: -Math.log(r) / 0.012, modifiers: 2 }));
    inflight.push(send({ deltaX: tx - tx1, deltaY: ty - ty1 }));
    Object.assign(v, { k: kt, tx: tx1, ty: ty1 });
    while (inflight.length > 4) await inflight.shift();
    if (p >= 1) break;
    await c.pause(16);
  }
  await Promise.all(inflight);
}

/** Wait until every screen in view has loaded. */
export async function settled(c) {
  await c.waitFor(`BP.board().artboards.filter(a => a.live).every(a => a.ready)`, 20_000);
  await c.pause(500);
}

/** The middle of an artboard on screen, or a point in it by fractions of its box. */
export const ab = (id, x = 0.5, y = 0.5) => ({ sel: `.bd-ab[data-ab="${id}"]`, x, y });

/** prepare(): rev D from rev C on the temp copy: Today's avatar opens Profile, its tab bar drops Profile, Start workout opens as a sheet. */
export function revD(ctx) {
  ctx.py('build.py', 'patch', ctx.bd.docPath('acme-fit-design'), 'artboard:today', '--html', join(here, 'today-rev-d.html'),
    '--change', 'Today: the avatar opens Profile, so the tab bar drops it; Start workout opens as a sheet.');
}
