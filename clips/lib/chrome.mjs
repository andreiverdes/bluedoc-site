// Headless Chrome over the DevTools protocol: one WebSocket, flat sessions (one per tab).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
].filter(Boolean);

export class Chrome {
  static async launch({ width, height, dpr }) {
    const bin = CANDIDATES.find((p) => existsSync(p));
    if (!bin) throw new Error('Chrome not found: set CHROME_PATH to a Chrome or Chromium binary.');
    const profile = mkdtempSync(join(tmpdir(), 'bd-clips-chrome-'));
    const proc = spawn(
      bin,
      [
        '--headless=new',
        `--user-data-dir=${profile}`,
        '--remote-debugging-port=0',
        '--no-first-run',
        '--no-default-browser-check',
        '--hide-scrollbars',
        '--font-render-hinting=none',
        '--force-color-profile=srgb',
        `--window-size=${width},${height}`,
        // the headless screen (800 × 600 by default) is what an element in full screen fills and what the screencast
        // then captures: make it the viewport, at its scale (sizes in device px)
        `--screen-info={${width * dpr}x${height * dpr} devicePixelRatio=${dpr}}`,
        // keep rAF and timers at full rate: nothing here is a background tab
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        'about:blank',
      ],
      { stdio: 'ignore' },
    );
    const portFile = join(profile, 'DevToolsActivePort');
    const deadline = Date.now() + 20_000;
    while (!(existsSync(portFile) && readFileSync(portFile, 'utf8').trim().split('\n').length >= 2)) {
      if (proc.exitCode !== null || Date.now() > deadline) {
        proc.kill();
        throw new Error('Chrome did not start');
      }
      await sleep(50);
    }
    const [port, path] = readFileSync(portFile, 'utf8').trim().split('\n');
    const chrome = new Chrome(proc, profile);
    await chrome.connect(`ws://127.0.0.1:${port}${path}`);
    return chrome;
  }

  constructor(proc, profile) {
    this.proc = proc;
    this.profile = profile;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Map(); // `${sessionId}|${method}` -> Set<fn>
    this.errors = [];
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => resolve();
      ws.onerror = (e) => reject(new Error(`DevTools WebSocket: ${e.message || 'error'}`));
      ws.onmessage = (ev) => this.#onMessage(JSON.parse(ev.data));
      this.ws = ws;
    });
  }

  #onMessage(m) {
    if (m.id && this.pending.has(m.id)) {
      const { resolve, reject, method } = this.pending.get(m.id);
      this.pending.delete(m.id);
      if (m.error) reject(new Error(`${method}: ${m.error.message}`));
      else resolve(m.result || {});
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      this.errors.push((d.exception && d.exception.description) || d.text);
    }
    const fns = this.listeners.get(`${m.sessionId || ''}|${m.method}`);
    if (fns) for (const fn of fns) fn(m.params);
  }

  call(method, params = {}, sessionId) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  on(method, fn, sessionId) {
    const k = `${sessionId || ''}|${method}`;
    if (!this.listeners.has(k)) this.listeners.set(k, new Set());
    this.listeners.get(k).add(fn);
    return () => this.listeners.get(k).delete(fn);
  }

  async close() {
    try {
      await Promise.race([this.call('Browser.close'), sleep(2000)]);
    } catch {}
    this.ws?.close();
    if (this.proc.exitCode === null) this.proc.kill();
    await sleep(300);
    rmSync(this.profile, { recursive: true, force: true });
  }
}

export class Tab {
  static async open(chrome, { width, height, dpr, colorScheme }) {
    const { targetId } = await chrome.call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await chrome.call('Target.attachToTarget', { targetId, flatten: true });
    const tab = new Tab(chrome, sessionId);
    await tab.call('Runtime.enable');
    await tab.call('Page.enable');
    await tab.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: false });
    if (colorScheme) await tab.call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: colorScheme }] });
    return tab;
  }

  constructor(chrome, sessionId) {
    this.chrome = chrome;
    this.session = sessionId;
  }

  call(method, params) {
    return this.chrome.call(method, params, this.session);
  }

  on(method, fn) {
    return this.chrome.on(method, fn, this.session);
  }

  /** expr (a string of JS) evaluated in the page; promises awaited, the value returned by value. */
  async ev(expr) {
    const r = await this.call('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error(`${expr.slice(0, 200)}: ${(d.exception && d.exception.description) || d.text}`);
    }
    return r.result.value;
  }

  async waitFor(expr, timeout = 15_000) {
    const deadline = Date.now() + timeout;
    for (;;) {
      let v;
      try {
        v = await this.ev(expr);
      } catch {}
      if (v) return v;
      if (Date.now() > deadline) throw new Error(`timed out waiting for ${expr}; page errors: ${this.chrome.errors.join(' | ')}`);
      await sleep(100);
    }
  }

  async go(url) {
    await this.ev('window.__clipLeft = true').catch(() => {});
    await this.call('Page.navigate', { url });
    await this.waitFor("!window.__clipLeft && document.readyState === 'complete'", 30_000);
  }
}
