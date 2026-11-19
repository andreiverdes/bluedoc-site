// For the clips that share, copy or show sharing: a bluedoc server of the scenario's own, started in `prepare` and
// opened through the scenario's `url:`. It is lib/bluedoc.mjs's server plus Share's stand-in gh (bluedoc's
// tests/fixtures/gh_standin.py, as tests/_support.py's TempHome sets it): acme-dev signed in with the gist scope, its
// gists in a folder of the run's, never GitHub. Also the shared page's stand-in viewer (sharedViewer), drawn the way
// tests/test_shared_page.py stages bluedoc.ai's /g/ viewer.
import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { createServer as httpServer } from 'node:http';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { Bluedoc } from '../../lib/bluedoc.mjs';

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

/**
 * Starts `serve.py run` on a free port, everything under base (wiped first), which is the server's HOME too, so the
 * paths bluedoc shows read ~/acme-shop/docs, never the temp folder: BLUEDOC_HOME is ~/.bluedoc there, and projects
 * ({name: stems | null}) copies the Acme examples (null: all of them, with their media) into ~/<name>/docs and
 * registers each folder. gh (default <base>-gh) holds the stand-in's gists, wiped first unless keepGh: a second server
 * given the same gh shares the first one's GitHub. env: more of the server's environment (STANDIN_GH_ACCOUNTS, …). CI
 * is left out: under CI the plan-mode hook does nothing. Returns lib/bluedoc.mjs's Bluedoc (docPath, py, req, urlFor,
 * stop; work and docs are the first project's) with pyAsync, a script run that doesn't block a take.
 */
export async function standinServer({ repo, base, gh = `${base}-gh`, keepGh = false, projects = { 'acme-shop': null }, env: extra = {} }) {
  const scripts = join(repo, 'skills/bluedoc/scripts');
  const examples = join(repo, 'skills/bluedoc/examples');
  rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  base = realpathSync(base);   // /tmp is /private/tmp on macOS: the paths bluedoc resolves start with HOME
  const home = join(base, '.bluedoc');
  mkdirSync(home);
  if (!keepGh) rmSync(gh, { recursive: true, force: true });
  mkdirSync(gh, { recursive: true });
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('STANDIN_GH_') && k !== 'CI' && k !== 'BLUEDOC_PORT'));
  const port = await freePort();
  Object.assign(env, {
    HOME: base, BLUEDOC_HOME: home, BLUEDOC_PORT: String(port), PYTHONDONTWRITEBYTECODE: '1',
    BLUEDOC_GH: join(repo, 'tests/fixtures/gh_standin.py'), STANDIN_GH_DIR: gh, ...extra,
  });
  const folders = Object.entries(projects).map(([name, stems]) => {
    const docs = join(base, name, 'docs');
    if (stems) {
      mkdirSync(docs, { recursive: true });
      for (const s of stems) for (const f of readdirSync(examples)) if (f.startsWith(`${s}.`)) cpSync(join(examples, f), join(docs, f), { recursive: true });
    } else {
      cpSync(examples, docs, { recursive: true, filter: (src) => !src.endsWith('.icons') });
    }
    return docs;
  });
  const bd = new Bluedoc({ port, home, work: join(base, Object.keys(projects)[0]), docs: folders[0], repo, scripts, env });
  for (const d of folders) bd.py('serve.py', 'add', d);
  bd.proc = spawn('python3', [join(scripts, 'serve.py'), 'run', '--port', String(port)], { env, cwd: bd.work, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  bd.proc.stdout.on('data', (d) => (log += d));
  bd.proc.stderr.on('data', (d) => (log += d));
  const deadline = Date.now() + 15_000;
  for (;;) {
    try {
      if ((await bd.req('GET', '/__bluedoc/ping')).status === 200) break;
    } catch {}
    if (bd.proc.exitCode !== null || Date.now() > deadline) throw new Error(`bluedoc server did not start:\n${log}`);
    await sleep(80);
  }
  // the home hides a folder under /tmp by itself (serve.py temp_folder): these are shown, as a project's would be
  const shown = await bd.req('POST', '/__bluedoc/settings', { home: { shown: folders } });
  if (shown.status !== 200) throw new Error(`home.shown: ${shown.status} ${JSON.stringify(shown.json)}`);
  bd.pyAsync = (script, ...args) => new Promise((ok, fail) => {
    const p = spawn('python3', [join(scripts, script), ...args.map(String)], { env, cwd: bd.work });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? ok(out) : fail(new Error(`${script} ${args.join(' ')}: exit ${code}\n${err || out}`))));
  });
  return bd;
}

/**
 * Moves every gist write in home's gist-budget.json back by seconds: the time a take skips (gistbudget.py spaces two
 * updates of one doc a minute apart, so an Update seconds after the share would queue).
 */
export function backdateBudget(home, seconds) {
  const f = join(home, 'gist-budget.json');
  const data = JSON.parse(readFileSync(f, 'utf8'));
  for (const acct of Object.values(data)) {
    acct.sent = (acct.sent || []).map((t) => t - seconds);
    for (const k of Object.keys(acct.docs || {})) acct.docs[k] -= seconds;
  }
  writeFileSync(f, JSON.stringify(data, null, 1) + '\n');
}

/** The https://bluedoc.ai/g/<code> link a share printed (serve.py share's output). */
export const linkIn = (text) => {
  const m = /https:\/\/bluedoc\.ai\/g\/[A-Za-z0-9_-]+/.exec(text);
  if (!m) throw new Error(`no bluedoc.ai link in:\n${text}`);
  return m[0];
};

/** The stand-in's one gist id (the share made in gh). */
export function onlyGist(gh) {
  const ids = readdirSync(join(gh, 'gists'));
  if (ids.length !== 1) throw new Error(`want one gist in ${gh}, found ${ids.length}`);
  return ids[0];
}

/**
 * bluedoc.ai's /g/ viewer, staged as tests/test_shared_page.py does: a local http server answers /g/<code> with the
 * gist's bluedoc-page.json filled into the bluedoc checkout's template (viewer.ts pageHtml, read again on every
 * request: an Update shows on reload), window.bluedocShare = {name, hash, link, by, files} set before the page's
 * script runs. The page is the top document here, not the viewer's frame, so a scenario's selectors reach it.
 * Returns {url (the /g/<code> address), stop}.
 */
export async function sharedViewer({ repo, gh, gist, link, by = 'acme-dev' }) {
  const template = readFileSync(join(repo, 'skills/bluedoc/assets/template.html'), 'utf8');
  const code = link.split('/g/')[1];
  const page = () => {
    const dir = join(gh, 'gists', gist, 'files');
    const bundle = JSON.parse(readFileSync(join(dir, 'bluedoc-page.json'), 'utf8'));
    const fill = { ...bundle.fill, '/*__BOARD_GEO__*/': '' };
    const re = new RegExp(Object.keys(fill).map((k) => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|'), 'g');
    const html = template.replace(re, (k) => fill[k]);
    const files = {};
    for (const f of readdirSync(dir)) if (f !== 'bluedoc-page.json') files[f] = readFileSync(join(dir, f), 'utf8');
    const share = { name: bundle.name, hash: '', link, by, files: typeof files[`${bundle.name}.bluedoc.json`] === 'string' ? files : null };
    const boot = `<script>window.bluedocShare = ${JSON.stringify(share).replace(/</g, '\\u003c')};</script>`;
    return html.replace(/<head[^>]*>/i, (h) => h + boot);
  };
  const port = await freePort();
  const server = httpServer((req, res) => {
    if (!req.url.startsWith(`/g/${code}`)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
      return;
    }
    try {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(page());
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(e));
    }
  });
  await new Promise((ok) => server.listen(port, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${port}/g/${code}`, stop: () => new Promise((ok) => server.close(ok)) };
}
