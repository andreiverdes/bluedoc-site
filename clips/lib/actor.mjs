// What a scenario drives: the page through real CDP input events, with the synthetic cursor following every move.
// Every step takes the time it says, in real time, so the recording shows it at that pace.
import { setTimeout as sleep } from 'node:timers/promises';

const STEP_MS = 1000 / 60;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const MOD = { alt: 1, ctrl: 2, meta: 4, shift: 8 };
const mods = (o = {}) => Object.entries(MOD).reduce((m, [k, v]) => (o[k] ? m | v : m), 0);

// The page-side resolver for a target: a CSS selector, {sel, x, y} (fractions of its box, or dx/dy px from its
// centre), {text, in, at} (a phrase's start, centre or end), or {x, y} viewport px.
const RESOLVE = `(t => {
  const box = el => { const r = el.getBoundingClientRect(); return r; };
  const one = sel => { const el = document.querySelector(sel); if (!el) throw new Error('no element ' + sel); return el; };
  if (typeof t === 'string') t = { sel: t };
  if (t.text) {
    const root = t.in ? one(t.in) : document.body;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      const i = n.data.indexOf(t.text); if (i < 0) continue;
      const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + t.text.length);
      const rs = [...rg.getClientRects()].filter(r => r.width > 0); if (!rs.length) continue;
      const a = rs[0], b = rs[rs.length - 1];
      if (t.at === 'start') return [a.left + 1, a.top + a.height / 2];
      if (t.at === 'end') return [b.right - 1, b.top + b.height / 2];
      return [(a.left + a.right) / 2, a.top + a.height / 2];
    }
    throw new Error('no text ' + JSON.stringify(t.text));
  }
  if (t.sel) {
    const r = box(one(t.sel));
    const fx = t.x ?? 0.5, fy = t.y ?? 0.5;
    return [r.left + r.width * fx + (t.dx || 0), r.top + r.height * fy + (t.dy || 0)];
  }
  return [t.x, t.y];
})`;

export class Actor {
  constructor(tab, { width, height }) {
    this.tab = tab;
    this.size = { width, height };
    this.x = width * 0.62;
    this.y = height * 0.58;
    this.buttons = 0;
  }

  ev(expr) {
    return this.tab.ev(expr);
  }

  /** Wait for a JS expression to be truthy, e.g. "BP.state('orders').tokens > 0". */
  waitFor(expr, timeout) {
    return this.tab.waitFor(expr, timeout);
  }

  waitForSelector(sel, timeout) {
    return this.tab.waitFor(`!!document.querySelector(${JSON.stringify(sel)})`, timeout);
  }

  pause(ms) {
    return sleep(ms);
  }

  /** Add a stylesheet to the page (to hold back a panel that would crowd the frame, say). */
  addStyle(css) {
    return this.tab.ev(`document.head.append(Object.assign(document.createElement('style'), {textContent: ${JSON.stringify(css)}}))`);
  }

  /** Viewport point [x, y] of a target. */
  point(target) {
    if (Array.isArray(target)) return target;
    return this.tab.ev(`${RESOLVE}(${JSON.stringify(target)})`);
  }

  async #mouse(type, x, y, extra = {}) {
    await Promise.all([
      this.tab.call('Input.dispatchMouseEvent', { type, x, y, buttons: this.buttons, button: this.buttons ? 'left' : 'none', ...extra }),
      type === 'mouseMoved' ? this.tab.ev(`window.__clipCursor && __clipCursor.move(${x}, ${y})`) : null,
    ]);
  }

  /** Put the cursor at a point at once (before the recording starts, say). */
  async place(target) {
    [this.x, this.y] = await this.point(target);
    await this.#mouse('mouseMoved', this.x, this.y);
  }

  /**
   * Move the cursor to a target along a slight arc, eased in and out, over ms (default: by distance). An element
   * target is looked up again on every step, so the cursor lands on it even while the page scrolls or zooms.
   */
  async moveTo(target, { ms } = {}) {
    let [tx, ty] = await this.point(target);
    const x0 = this.x, y0 = this.y, dist = Math.hypot(tx - x0, ty - y0);
    const dur = ms ?? Math.round(Math.min(1100, Math.max(380, 260 + dist * 0.75)));
    const t0 = performance.now(), inflight = [];
    for (;;) {
      if (!Array.isArray(target)) [tx, ty] = await this.point(target);
      // control point off to one side of the line: a hand's path curves a little
      const dx = tx - x0, dy = ty - y0, cx = x0 + dx / 2 - dy * 0.12, cy = y0 + dy / 2 + dx * 0.12;
      const p = Math.min(1, (performance.now() - t0) / dur), e = easeInOut(p), u = 1 - e;
      this.x = u * u * x0 + 2 * u * e * cx + e * e * tx;
      this.y = u * u * y0 + 2 * u * e * cy + e * e * ty;
      // an input event's ack waits for a frame: keep two in flight, so moves go out at 60 Hz
      inflight.push(this.#mouse('mouseMoved', this.x, this.y));
      if (inflight.length > 2) await inflight.shift();
      if (p >= 1) break;
      await sleep(STEP_MS);
    }
    await Promise.all(inflight);
  }

  async down(opts = {}) {
    this.buttons = 1;
    await Promise.all([
      this.tab.ev('window.__clipCursor && __clipCursor.down()'),
      this.#mouse('mousePressed', this.x, this.y, { button: 'left', clickCount: opts.clickCount || 1, modifiers: mods(opts) }),
    ]);
  }

  async up(opts = {}) {
    this.buttons = 0;
    await Promise.all([
      this.tab.ev('window.__clipCursor && __clipCursor.up()'),
      this.#mouse('mouseReleased', this.x, this.y, { button: 'left', clickCount: opts.clickCount || 1, modifiers: mods(opts) }),
    ]);
  }

  /** Move to target (if given) and click; {double: true} double-clicks. */
  async click(target, opts = {}) {
    if (target) await this.moveTo(target, opts);
    await this.down(opts);
    await sleep(70);
    await this.up(opts);
    if (opts.double) {
      await sleep(90);
      await this.down({ ...opts, clickCount: 2 });
      await sleep(60);
      await this.up({ ...opts, clickCount: 2 });
    }
  }

  dblclick(target, opts = {}) {
    return this.click(target, { ...opts, double: true });
  }

  /** Press at from, move to to with the button held, release. */
  async drag(from, to, { ms } = {}) {
    await this.moveTo(from);
    await this.down();
    await sleep(120);
    await this.moveTo(to, { ms: ms ?? 700 });
    await sleep(80);
    await this.up();
  }

  /** Select a phrase with the mouse: press at its first letter, drag to its last. */
  async selectText(text, { in: within, ms } = {}) {
    const start = await this.point({ text, in: within, at: 'start' });
    const end = await this.point({ text, in: within, at: 'end' });
    await this.drag(start, end, { ms: ms ?? 900 });
  }

  /** Type text into the focused field, one character at a time. */
  async type(text, { cps = 22 } = {}) {
    for (const ch of text) {
      await this.tab.call('Input.insertText', { text: ch });
      await sleep(1000 / cps);
    }
  }

  /** One key press, e.g. key('Enter', {meta: true}) or key('Escape'). */
  async key(key, opts = {}) {
    const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
    const vk = { Enter: 13, Escape: 27, Tab: 9, Backspace: 8 }[key] ?? key.toUpperCase().charCodeAt(0);
    const base = { key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mods(opts) };
    await this.tab.call('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
    if (key === 'Enter' && !opts.meta && !opts.ctrl) await this.tab.call('Input.dispatchKeyEvent', { type: 'char', ...base, text: '\r' });
    await this.tab.call('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  }

  /**
   * Wheel at the cursor (or at target, moving there first): deltaY spread over ms with an ease, as a trackpad sends it.
   * {ctrl: true} is a pinch zoom; negative deltaY zooms in / scrolls up. Events go out at 60 Hz without waiting for
   * each one's ack (that takes a frame or more, and steps the zoom); Chrome coalesces any that queue up.
   */
  async wheel(deltaY, { at, ms = 900, ctrl = false, deltaX = 0 } = {}) {
    if (at) await this.moveTo(at);
    const t0 = performance.now(), sent = [];
    let sy = 0, sx = 0;
    for (;;) {
      const p = Math.min(1, (performance.now() - t0) / ms), e = easeInOut(p);
      const dy = deltaY * e - sy, dx = deltaX * e - sx;
      if (dy || dx) {
        sent.push(this.tab.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: this.x, y: this.y, deltaX: dx, deltaY: dy, modifiers: ctrl ? MOD.ctrl : 0 }));
        sy += dy;
        sx += dx;
      }
      if (p >= 1) break;
      await sleep(STEP_MS);
    }
    await Promise.all(sent);
  }

  /** Scroll the page so target sits at block ('start' | 'center' | 'end'), smoothly; waits ms for it to land. */
  async scrollTo(target, { block = 'center', ms = 700 } = {}) {
    const sel = typeof target === 'string' ? target : target.sel;
    await this.tab.ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({behavior: 'smooth', block: ${JSON.stringify(block)}})`);
    await sleep(ms);
  }

  /** Pin the cursor's shape ('arrow' | 'hand' | 'ibeam'); null follows the page's CSS cursor again. */
  cursor(shape) {
    return this.tab.ev(`window.__clipCursor && __clipCursor.shape(${JSON.stringify(shape)})`);
  }
}
