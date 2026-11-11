// A smoke run of the shared-doc viewer (/g/) in headless Chrome, on the built site (npm run build, unless --no-build)
// served from 127.0.0.1. For each bluedoc-page.json given it opens /g/#url=<the bundle> and checks: the tab's title
// is the doc's, no page errors and no request to a /__bluedoc/ route, no Export key, a pick survives a reload, a
// board's screens all draw, ?diff= compares, and Request changes copies Markdown. Then the error states, with GitHub's
// answers faked through the DevTools protocol (a gist gone, one without bluedoc-page.json, the API's rate limit, a
// file the API truncates), so nothing reaches GitHub. --shots <dir> saves screenshots at 1280 and 390 px wide;
// --live <user>/<gist id> (repeatable) also opens a real gist through GitHub and prints the state it ends in.
//   npm run viewer-smoke -- [--no-build] [--shots <dir>] [--live <user>/<id>]... <bluedoc-page.json>...
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { Chrome, Tab } from '../clips/lib/chrome.mjs';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return null;
  const [v] = args.splice(i, 2).slice(1);
  return v;
};
const noBuild = args.includes('--no-build');
if (noBuild) args.splice(args.indexOf('--no-build'), 1);
const shots = opt('--shots');
const live = [];
for (let v; (v = opt('--live')); ) live.push(v);
const bundles = args.map((p) => resolve(p));
if (!bundles.length) {
  console.error('usage: npm run viewer-smoke -- [--no-build] [--shots <dir>] [--live <user>/<id>]... <bluedoc-page.json>...');
  process.exit(2);
}
if (shots) mkdirSync(shots, { recursive: true });

if (!noBuild) {
  const b = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
  if (b.status !== 0) process.exit(1);
}

// ---------- the built site, and the bundles under /__smoke/ ----------
const dist = join(root, 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
const extra = new Map(); // /__smoke/<name> → body
bundles.forEach((p, i) => extra.set(`/__smoke/${i}.json`, readFileSync(p)));
const first = JSON.parse(readFileSync(bundles[0], 'utf8'));
extra.set('/__smoke/format.json', JSON.stringify({ ...first, bluedoc: 'share/9' }));
extra.set('/__smoke/newer.json', JSON.stringify({ ...first, version: '99.0.0' }));
extra.set('/__smoke/hostile.json', JSON.stringify({ ...first, fill: { ...first.fill, __BLUEDOC_TITLE__: '</title><script>parent.__pwned = 1</script>' } }));
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (extra.has(path)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(extra.get(path));
  }
  let f = join(dist, path);
  if (!f.startsWith(dist)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) return res.writeHead(404).end('not found');
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;
const link = (path, q = '') => `${origin}/g/${q}#url=${encodeURIComponent(origin + path)}`;

// ---------- Chrome ----------
const chrome = await Chrome.launch({ width: 1280, height: 800, dpr: 1 });
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};
const FRAME = "document.getElementById('viewer-doc')";
const IN = (expr) => `(w => ${expr})(${FRAME}.contentWindow)`;

async function newTab(width = 1280) {
  const tab = await Tab.open(chrome, { width, height: width < 600 ? 844 : 800, dpr: 1 });
  await chrome.call('Browser.grantPermissions', { origin, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
  await tab.call('Network.enable');
  await tab.call('Log.enable');
  tab.routes = [];
  tab.logErrors = [];
  tab.on('Network.requestWillBeSent', ({ request }) => {
    if (new URL(request.url).pathname.startsWith('/__bluedoc/')) tab.routes.push(request.url);
  });
  tab.on('Log.entryAdded', ({ entry }) => entry.level === 'error' && !entry.url?.startsWith('http://127.0.0.1:1/') && tab.logErrors.push(`${entry.text} ${entry.url || ''}`));
  return tab;
}

async function shot(tab, name) {
  if (!shots) return;
  const { data } = await tab.call('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(shots, `viewer-${name}.png`), Buffer.from(data, 'base64'));
}

const drawn = (tab) => tab.waitFor(`!!${FRAME} && ${FRAME}.contentDocument.readyState === 'complete' && !!${IN('w.BP')}`, 30_000);

async function bundleRun(i) {
  const b = JSON.parse(readFileSync(bundles[i], 'utf8'));
  const stem = b.name;
  const doc = JSON.parse(b.fill.__BLUEDOC_DOC__);
  const screens = JSON.parse(b.fill.__BLUEDOC_SCREENS__);
  const errorsAt = chrome.errors.length;
  const tab = await newTab();
  await tab.go(link(`/__smoke/${i}.json`));
  await drawn(tab);
  const title = await tab.ev('document.title');
  check(title === `${b.title} · bluedoc`, `${stem}: the tab's title is the page's: ${title}`);
  check(await tab.ev(IN("!!w.bluedocShare && !w.document.querySelector('.bd-docx')")), `${stem}: a shared page, no Export key`);
  // Ctrl+P prints the doc's frame (a board's own handler first builds its print sheet), not the viewer around it
  await tab.ev(IN('(w.print = () => { w.__printed = (w.__printed || 0) + 1; }, 1)'));
  for (const type of ['keyDown', 'keyUp']) await tab.call('Input.dispatchKeyEvent', { type, modifiers: 2, key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
  const printed = await tab.waitFor(IN('w.__printed'), 30_000).catch(() => 0);
  await sleep(300);
  check(printed === 1 && (await tab.ev(IN('w.__printed'))) === 1, `${stem}: Ctrl+P prints the doc once`);

  // a board: every screen draws from the bundle (the board mounts the frames near the view: each is focused in turn)
  const n = screens ? Object.keys(screens).length : 0;
  if (n) {
    const missed = [];
    for (const id of Object.keys(screens)) {
      await tab.ev(IN(`(w.BP.board({ focus: ${JSON.stringify(id)} }), 1)`));
      const ok = await tab.waitFor(IN(`w.BP.board().artboards.find(a => a.id === ${JSON.stringify(id)})?.ready`), 20_000).catch(() => false);
      if (!ok) missed.push(id);
    }
    check(!missed.length, `${stem}: all ${n} screens drew${missed.length ? ', but not ' + missed.join(', ') : ''}`);
    await tab.ev(IN('(w.BP.board({ fit: true }), 1)'));
    // each screen stays in its sandbox: scripts only, an opaque origin the page can't reach into (nor it into the page)
    const frames = await tab.ev(IN("[...w.document.querySelectorAll('iframe[srcdoc]')].map(f => [f.getAttribute('sandbox'), !!f.contentDocument])"));
    check(frames.length > 0 && frames.every(([s, reach]) => s === 'allow-scripts' && !reach), `${stem}: ${frames.length} screen frames, each sandbox="allow-scripts", cross-origin to the page`);
  }
  await sleep(500);
  await shot(tab, `${stem}-1280`);

  // a pick on the first open decision survives a reload
  let decision = null;
  for (const s of doc.sections || [])
    for (const blk of s.blocks || [])
      for (const it of (blk.type === 'checklist' && blk.items) || [])
        if (!decision && Array.isArray(it.choices) && it.choices.length > 1 && !it.choice) decision = [blk.id, it.id, it.choices[1].id];
  if (decision) {
    const [cid, iid, choice] = decision;
    const picked = `${IN(`w.BP.replyPayload().items.find(x => x.checklist === '${cid}' && x.item === '${iid}')`)}?.choice`;
    await tab.ev(IN(`w.BP.choose('${cid}/${iid}', '${choice}')`));
    check((await tab.ev(picked)) === choice, `${stem}: picked ${choice} on ${cid}/${iid}`);
    await tab.reload();
    await drawn(tab);
    check((await tab.ev(picked)) === choice, `${stem}: the pick is still there after a reload`);
  } else console.log(`     ${stem}: no open decision to pick`);

  // Request changes copies the reply's Markdown
  await tab.ev(IN("w.BP.annotate({type: 'general', note: 'Acme: smoke-test comment'}) && 1"));
  await tab.ev(IN("w.document.querySelector('.bd-key.go').click()"));
  await tab.waitFor(IN("!!w.document.querySelector('.bd-chgs[open]')"));
  await tab.ev(IN("[...w.document.querySelectorAll('.bd-chgs[open] .ft .bp-btn')].find(x => !x.hidden && x.classList.contains('primary')).click()"));
  await sleep(300);
  const clip = await tab.ev('navigator.clipboard.readText()').catch((e) => String(e));
  check(clip.includes('Acme: smoke-test comment') && clip.includes(`${stem}.bluedoc.json`), `${stem}: Request changes copied the Markdown, naming ${stem}.bluedoc.json`);

  // ?diff= on a doc with history: the compare view, in the viewer's URL
  const revs = await tab.ev(IN('w.BP.revisions().map(r => r.rev)'));
  if (revs.length > 1) {
    await tab.go(link(`/__smoke/${i}.json`, `?diff=${revs[revs.length - 2]}`));
    await drawn(tab);
    const cmp = await tab.ev(IN('w.BP.compare()'));
    check(!!cmp && cmp.from === revs[revs.length - 2], `${stem}: ?diff=${revs[revs.length - 2]} compares (${cmp && cmp.changes.length} changes)`);
    // its Done key goes back to the current revision in the top window, the fragment kept
    await tab.ev("window.__left = 1");
    await tab.ev(IN("w.document.querySelector('.bd-key[aria-label=\"Done\"]').click()"));
    await tab.waitFor("!window.__left && document.readyState === 'complete'");
    check((await tab.ev('location.search')) === '' && (await tab.ev('location.hash')).startsWith('#url='), `${stem}: Done leaves compare in the top window, fragment kept`);
    await drawn(tab);
  }
  await tab.close();

  // at 390 px
  const narrow = await newTab(390);
  await narrow.go(link(`/__smoke/${i}.json`));
  await drawn(narrow);
  await sleep(n ? 3000 : 500);
  await shot(narrow, `${stem}-390`);
  await narrow.close();

  check(chrome.errors.length === errorsAt, `${stem}: no page errors${chrome.errors.length > errorsAt ? ': ' + chrome.errors.slice(errorsAt).join(' | ') : ''}`);
  check(!tab.routes.length && !narrow.routes.length, `${stem}: no /__bluedoc/ requests ${tab.routes.concat(narrow.routes).join(' ')}`);
  check(!tab.logErrors.length && !narrow.logErrors.length, `${stem}: no console errors ${tab.logErrors.concat(narrow.logErrors).join(' | ')}`);
}

// GitHub, faked: api.github.com/gists/<id> and gist.githubusercontent.com by id
const ID = { gone: '0000000000000000000a', missing: '0000000000000000000b', limited: '0000000000000000000c', big: '0000000000000000000d' };
async function fakeGithub(tab) {
  await tab.call('Fetch.enable', { patterns: [{ urlPattern: 'https://api.github.com/*' }, { urlPattern: 'https://gist.githubusercontent.com/*' }] });
  const page = readFileSync(bundles[0], 'utf8');
  tab.on('Fetch.requestPaused', ({ requestId, request }) => {
    const u = request.url;
    const json = (code, body) => tab.call('Fetch.fulfillRequest', { requestId, responseCode: code, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: '*' }], body: Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)).toString('base64') });
    if (u.includes(ID.gone)) return json(404, { message: 'Not Found' });
    if (u.includes(ID.missing)) return json(200, { id: ID.missing, files: { 'notes.md': { content: '# Acme notes' } } });
    if (u.startsWith('https://api.github.com/') && u.includes(ID.limited)) return json(403, { message: 'API rate limit exceeded' });
    if (u.includes(ID.limited)) return json(200, page);
    if (u.startsWith('https://api.github.com/') && u.includes(ID.big)) return json(200, { id: ID.big, files: { 'bluedoc-page.json': { truncated: true, content: page.slice(0, 100), raw_url: `https://gist.githubusercontent.com/acme/${ID.big}/raw/abc123/bluedoc-page.json` } } });
    if (u.includes(`${ID.big}/raw/abc123/`)) return json(200, page);
    return json(500, {});
  });
}

async function states() {
  const tab = await newTab();
  await fakeGithub(tab);
  const status = "document.getElementById('viewer-status')";
  const state = async (url, want, name) => {
    await tab.go(url);
    await tab.waitFor(`${status}.hidden || ${status}.dataset.state !== 'loading'`, 20_000);
    const got = await tab.ev(`${status}.hidden ? 'drawn' : ${status}.dataset.state`);
    check(got === want, `state ${name}: ${got}${got === want ? '' : ` (wanted ${want})`}`);
    await shot(tab, `state-${name}`);
  };
  await state(`${origin}/g/`, 'link', 'no-link');
  await state(`${origin}/g/#acme/${ID.gone}`, 'gone', 'gone');
  await state(`${origin}/g/#acme/${ID.missing}`, 'missing', 'no-page-file');
  await state(link('/__smoke/format.json'), 'format', 'format');
  await state(link('/__smoke/none.json'), 'gone-or-missing', 'url-404');
  await state(`${origin}/g/#url=${encodeURIComponent('http://127.0.0.1:1/x.json')}`, 'network', 'network');
  await state(`${origin}/g/#acme/${ID.limited}`, 'drawn', 'rate-limited-raw');
  await state(`${origin}/g/#acme/${ID.big}`, 'drawn', 'truncated-raw-url');
  await state(link('/__smoke/hostile.json'), 'format', 'hostile-title');
  await state(link('/__smoke/newer.json'), 'drawn', 'newer');
  check(await tab.ev("!document.getElementById('viewer-note').hidden && document.querySelector('#viewer-note .t').textContent.includes('99.0.0')"), 'state newer: drawn with the update note');
  await tab.close();
}

async function liveRun(ref) {
  const tab = await newTab();
  await tab.go(`${origin}/g/#${ref}`);
  const status = "document.getElementById('viewer-status')";
  await tab.waitFor(`${status}.hidden || ${status}.dataset.state !== 'loading'`, 30_000);
  const got = await tab.ev(`${status}.hidden ? 'drawn' : ${status}.dataset.state + ' · ' + document.querySelector('#viewer-status h1').textContent`);
  console.log(`live  #${ref}: ${got}`);
  await shot(tab, `live-${ref.replace(/\W+/g, '-')}`);
  await tab.close();
}

try {
  for (let i = 0; i < bundles.length; i++) await bundleRun(i);
  await states();
  for (const ref of live) await liveRun(ref);
} catch (e) {
  failures.push(String(e && e.stack || e));
  console.error(e);
} finally {
  await chrome.close();
  server.close();
}
console.log(failures.length ? `\n${failures.length} failed` : '\nall passed');
process.exit(failures.length ? 1 : 0);
