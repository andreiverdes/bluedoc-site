// An isolated bluedoc server for recording: its own BLUEDOC_HOME, a free port (never 8740), a fresh copy of the
// Acme examples in a `docs` folder, and an unlock token so the browser can save comments.
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const DEFAULT_PORT = 8740;

function freePort() {
  return new Promise((ok, fail) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => (port === DEFAULT_PORT ? freePort().then(ok, fail) : ok(port)));
    });
    s.on('error', fail);
  });
}

export class Bluedoc {
  /**
   * repo: the bluedoc checkout; home: BLUEDOC_HOME (wiped first); work: the folder that gets docs/ (wiped first).
   */
  static async start({ repo, home, work }) {
    const scripts = join(repo, 'skills/bluedoc/scripts');
    const examples = join(repo, 'skills/bluedoc/examples');
    if (!existsSync(join(scripts, 'serve.py'))) throw new Error(`bluedoc not found at ${repo} (set BLUEDOC_REPO)`);
    rmSync(home, { recursive: true, force: true });
    rmSync(work, { recursive: true, force: true });
    const docs = join(work, 'docs');
    cpSync(examples, docs, { recursive: true, filter: (src) => !src.endsWith('.icons') });

    const env = { ...process.env, BLUEDOC_HOME: home, PYTHONDONTWRITEBYTECODE: '1' };
    delete env.BLUEDOC_PORT;
    const port = await freePort();
    env.BLUEDOC_PORT = String(port); // the CLI (open, snapshot, wait) finds this server, not the default one
    const bd = new Bluedoc({ port, home, work, docs, repo, scripts, env });
    bd.py('serve.py', 'add', docs);

    const proc = spawn('python3', [join(scripts, 'serve.py'), 'run', '--port', String(port)], { env, cwd: work, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    proc.stdout.on('data', (d) => (log += d));
    proc.stderr.on('data', (d) => (log += d));
    bd.proc = proc;
    const deadline = Date.now() + 15_000;
    for (;;) {
      try {
        if ((await bd.req('GET', '/__bluedoc/ping')).status === 200) break;
      } catch {}
      if (proc.exitCode !== null || Date.now() > deadline) throw new Error(`bluedoc server did not start:\n${log}`);
      await sleep(80);
    }
    return bd;
  }

  constructor({ port, home, work, docs, repo, scripts, env }) {
    Object.assign(this, { port, home, work, docs, repo, scripts, env, origin: `http://127.0.0.1:${port}` });
  }

  /** Runs a bluedoc script (build.py, serve.py, …) with this server's BLUEDOC_HOME and port; throws on failure. */
  py(script, ...args) {
    const r = spawnSync('python3', [join(this.scripts, script), ...args.map(String)], { env: this.env, cwd: this.work, encoding: 'utf8', timeout: 180_000 });
    if (r.status !== 0) throw new Error(`${script} ${args.join(' ')}: exit ${r.status}\n${r.stderr || r.stdout}`);
    return r.stdout;
  }

  key() {
    const f = join(this.home, 'key');
    return existsSync(f) ? readFileSync(f, 'utf8').trim() : '';
  }

  /** One request as the CLI makes it: X-Bluedoc and the key. */
  async req(method, path, body) {
    const key = this.key();
    const r = await fetch(this.origin + path, {
      method,
      headers: { 'X-Bluedoc': '1', ...(key ? { 'X-Bluedoc-Key': key } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, json: r.headers.get('content-type')?.includes('json') ? await r.json() : null };
  }

  /** A doc's file in the docs folder, by stem (e.g. 'acme-orders'); a stem may name a subfolder. */
  docPath(stem) {
    return resolve(this.docs, `${stem}.bluedoc.json`);
  }

  /**
   * The URL of a doc (by stem), or of the home page for 'home', with a one-hour key token the page trades for the
   * save cookie.
   */
  async urlFor(stem, query = '') {
    let path = '/';
    if (stem !== 'home') {
      const file = this.docPath(stem);
      if (!existsSync(file)) throw new Error(`no doc ${stem}.bluedoc.json in ${this.docs}`);
      const u = await this.req('GET', `/__bluedoc/url?doc=${encodeURIComponent(file)}`);
      if (u.status !== 200) throw new Error(`bluedoc url failed: ${u.status}`);
      path = u.json.url;
    }
    const t = await this.req('POST', '/__bluedoc/unlock', {});
    if (t.status !== 200) throw new Error(`bluedoc unlock failed: ${t.status}`);
    const q = new URLSearchParams(query);
    q.set('key', t.json.token);
    return `${this.origin}${path}?${q}`;
  }

  async stop() {
    if (this.proc.exitCode !== null) return;
    this.proc.kill('SIGTERM');
    for (let i = 0; i < 50 && this.proc.exitCode === null; i++) await sleep(100);
    if (this.proc.exitCode === null) this.proc.kill('SIGKILL');
  }
}
