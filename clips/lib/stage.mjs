// The film stage (clips/stage/): a terminal and a browser window on the real bluedoc page, recorded as one tab.
// Stage.start serves the stage; attach(tab) makes the page framable in it (the recording's copy only: bluedoc sends
// X-Frame-Options DENY and frame-ancestors 'none', which the tab's Fetch interception drops for this server's
// documents) and tracks the iframe's execution context, so the Actor can evaluate and point inside it. The agent's
// side is real: the gate's words come from hook.py and the reply from a background `serve.py wait`.
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename, extname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
/** the port a reader sees: the take's server runs on a free port, the address bar shows bluedoc's default */
const SHOWN_ORIGIN = 'http://127.0.0.1:8740';

export class Stage {
  static async start({ bd, clips, site }) {
    const fonts = {
      'geist.woff2': join(site, 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
      'geist-mono.woff2': join(site, 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'),
      'geist-pixel.woff2': join(site, 'node_modules/@fontsource/geist-pixel/files/geist-pixel-latin-400-normal.woff2'),
    };
    const root = join(clips, 'stage');
    const server = createServer((req, res) => {
      const path = new URL(req.url, 'http://x').pathname;
      const file = path.startsWith('/fonts/') ? fonts[path.slice(7)] : join(root, path === '/' ? 'tandem.html' : path.slice(1));
      if (!file || (!file.startsWith(root) && !Object.values(fonts).includes(file)) || !existsSync(file)) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(readFileSync(file));
    });
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
    return new Stage(bd, server, `http://127.0.0.1:${server.address().port}`);
  }

  constructor(bd, server, origin) {
    this.bd = bd;
    this.server = server;
    this.origin = origin;
    this.contexts = new Map(); // frameId -> default execution context id
    this.waits = [];
    // term.<method>(...args) runs stage.term.<method>(...args) in the stage page and awaits it
    this.term = new Proxy({}, { get: (_, m) => (...args) => this.call(`term.${String(m)}`, ...args) });
    const self = this;
    this.frame = {
      ev: (expr) => self.#frameEv(expr),
      async waitFor(expr, timeout = 15_000) {
        const deadline = Date.now() + timeout;
        for (;;) {
          let v;
          try {
            v = await self.#frameEv(expr);
          } catch {}
          if (v) return v;
          if (Date.now() > deadline) throw new Error(`timed out waiting in the page for ${expr}`);
          await sleep(100);
        }
      },
      box: () => self.call('frameBox'),
      go: (url, doc = true) => self.open(url, { doc }),
      async reload() {
        await self.#frameEv('window.__clipLeft = true; location.reload()').catch(() => {});
        await this.waitFor("!window.__clipLeft && document.readyState === 'complete' && !!window.BP", 30_000);
      },
    };
  }

  url() {
    return `${this.origin}/tandem.html`;
  }

  /** Call before the tab loads the stage: lets the bluedoc page into the iframe and tracks its context. */
  async attach(tab) {
    this.tab = tab;
    tab.on('Runtime.executionContextCreated', ({ context }) => {
      if (context.auxData?.isDefault) this.contexts.set(context.auxData.frameId, context.id);
    });
    tab.on('Runtime.executionContextDestroyed', ({ executionContextId }) => {
      for (const [f, id] of this.contexts) if (id === executionContextId) this.contexts.delete(f);
    });
    tab.on('Fetch.requestPaused', async ({ requestId, responseStatusCode, responseHeaders = [] }) => {
      const headers = responseHeaders
        .filter((h) => h.name.toLowerCase() !== 'x-frame-options')
        .map((h) =>
          h.name.toLowerCase() === 'content-security-policy'
            ? { name: h.name, value: h.value.split(';').filter((d) => !d.trim().toLowerCase().startsWith('frame-ancestors')).join(';') }
            : h,
        );
      // the response again, body and all, with those headers: Chrome checks framing on the headers it received, so
      // continueResponse's changed headers don't lift it
      try {
        const isRedirect = responseStatusCode >= 300 && responseStatusCode < 400;
        const body = isRedirect ? { body: '' } : await tab.call('Fetch.getResponseBody', { requestId });
        const b64 = body.base64Encoded ? body.body : Buffer.from(body.body || '').toString('base64');
        await tab.call('Fetch.fulfillRequest', { requestId, responseCode: responseStatusCode, responseHeaders: headers, body: b64 });
      } catch {
        await tab.call('Fetch.continueRequest', { requestId }).catch(() => {});
      }
    });
    await tab.call('Fetch.enable', { patterns: [{ urlPattern: `${this.bd.origin}/*`, resourceType: 'Document', requestStage: 'Response' }] });
  }

  /** stage.<path>(...args) in the stage page (the top document), awaited, its value returned */
  call(path, ...args) {
    return this.tab.ev(`stage.${path}(${args.map((a) => JSON.stringify(a)).join(',')})`);
  }

  async #frameId() {
    const { frameTree } = await this.tab.call('Page.getFrameTree');
    const child = frameTree.childFrames?.[0]?.frame;
    if (!child) throw new Error('the stage has no frame yet');
    return child.id;
  }

  async #frameEv(expr) {
    const id = this.contexts.get(await this.#frameId());
    if (!id) throw new Error('the frame has no context yet');
    const r = await this.tab.call('Runtime.evaluate', { expression: expr, contextId: id, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error(`${expr.slice(0, 200)}: ${(d.exception && d.exception.description) || d.text}`);
    }
    return r.result.value;
  }

  /**
   * Opens url in the browser window and waits for it to load (and for the page script, on a doc); the address bar
   * shows shown(url).
   */
  async open(url, { doc = true } = {}) {
    await this.#frameEv('window.__clipLeft = true').catch(() => {});
    await this.call('open', url, this.shown(url));
    await this.frame.waitFor(`!window.__clipLeft && document.readyState === 'complete'${doc ? ' && !!window.BP' : ''}`, 30_000);
  }

  caption(text) {
    return this.call('caption', text);
  }

  layout(mode) {
    return this.call('layout', mode);
  }

  /** A URL as a reader sees it: bluedoc's default port, no key token. */
  shown(url) {
    const u = new URL(url.replace(this.bd.origin, SHOWN_ORIGIN));
    u.searchParams.delete('key');
    return `${u.host}${u.pathname}${u.search}`;
  }

  /** Text the agent prints, as on a reader's machine: the take's temp project folder as ~/<project>, its port as 8740. */
  tidy(text) {
    return String(text).replaceAll(this.bd.work, `~/${basename(this.bd.work)}`).replaceAll(this.bd.origin, SHOWN_ORIGIN);
  }

  /**
   * Runs a bluedoc script (build.py patch, serve.py …) as the agent would, without blocking the take (bd.py would
   * stall the screencast); resolves with {code, out} (stdout then stderr).
   */
  py(script, ...args) {
    const proc = spawn('python3', [join(this.bd.scripts, script), ...args.map(String)], { env: this.bd.env, cwd: this.bd.work, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    proc.stdout.on('data', (d) => (out += d));
    proc.stderr.on('data', (d) => (err += d));
    return new Promise((ok) => proc.on('exit', (code) => ok({ code, out: `${out}${err}` })));
  }

  /** hook.py as the agent sees it: expr runs in Python with hook imported; resolves with its JSON value (async, so a
   *  take never blocks on it) */
  hook(expr) {
    const code = `import sys, json; from pathlib import Path; sys.path.insert(0, ${JSON.stringify(this.bd.scripts)}); import hook; print(json.dumps(${expr}))`;
    const proc = spawn('python3', ['-c', code], { env: this.bd.env, cwd: this.bd.work, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    proc.stdout.on('data', (d) => (out += d));
    proc.stderr.on('data', (d) => (err += d));
    return new Promise((ok, fail) => proc.on('exit', (code) => (code === 0 ? ok(JSON.parse(out.trim().split('\n').at(-1))) : fail(new Error(`hook.py: ${err || out}`)))));
  }

  gate(doc, url) {
    return this.hook(`hook.instructions(Path(${JSON.stringify(doc)}), ${JSON.stringify(url)}, hook.AGENTS['claude'][1])`);
  }

  approvedNote(doc) {
    return this.hook(`(hook.approval('claude', 'clips', {'doc': ${JSON.stringify(doc)}}) or {}).get('note')`);
  }

  /** A background `serve.py wait <doc> --kind any`; resolves with what it printed on stdout when a reply comes. */
  wait(doc, kind = 'any') {
    const proc = spawn('python3', [join(this.bd.scripts, 'serve.py'), 'wait', doc, '--kind', kind], { env: this.bd.env, cwd: this.bd.work, stdio: ['ignore', 'pipe', 'pipe'] });
    this.waits.push(proc);
    let out = '';
    proc.stdout.on('data', (d) => (out += d));
    return new Promise((ok, fail) => proc.on('exit', (code) => (code === 0 ? ok(out) : fail(new Error(`serve.py wait exited ${code}`)))));
  }

  async stop() {
    for (const p of this.waits) if (p.exitCode === null) p.kill();
    await new Promise((ok) => this.server.close(ok));
  }
}
