// A smoke run of the shared-doc viewer in headless Chrome, on the built site (npm run build, unless --no-build) served
// from 127.0.0.1 as GitHub Pages serves it (a path the site lacks gets 404.html, HTTP 404). Each bluedoc-page.json
// given opens at a link's path, /g/<code>, through the viewer's localhost map (localStorage['bluedoc-viewer:local'])
// and is checked: the tab's title is the doc's, no page errors and no request to a /__bluedoc/ route, no Export key,
// Ctrl+P prints the doc, a board's screens all draw in their sandbox, the page is view-only (no dock, no composer, no
// enabled field, the "Shared · view only" chip; picks are not possible, over a reload; nothing stored but the view
// prefs), and ?diff= compares and Done comes back to /g/<code>. Then the cards and the old links
// (/g/#<user>/<id>, /g/#url=), with GitHub's answers faked through the DevTools protocol (a gist gone, one without
// bluedoc-page.json, the API's rate limit with its reset time, a file the API truncates), so nothing reaches GitHub,
// and the not-found card on another unknown path. --shots <dir> saves screenshots at 1280 and 390 px wide;
// --live <code> or --live <user>/<gist id> (repeatable) also opens a real gist through GitHub and prints the card.
//   npm run viewer-smoke -- [--no-build] [--shots <dir>] [--live <code>]... <bluedoc-page.json>...
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
  console.error('usage: npm run viewer-smoke -- [--no-build] [--shots <dir>] [--live <code> | <user>/<id>]... <bluedoc-page.json>...');
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
  // GitHub Pages: the site's 404.html for any path it lacks
  const missing = !existsSync(f);
  if (missing) f = join(dist, '404.html');
  res.writeHead(missing ? 404 : 200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;
// a link's code: the gist id's bytes in base64url without padding
const codeOf = (hex) => Buffer.from(hex, 'hex').toString('base64url');
// the localhost map the viewer reads for /g/<code>: a made-up 32-digit gist id per bundle and fixture
const local = {};
for (const file of [...extra.keys(), '/__smoke/none.json']) local[codeOf(createHash('md5').update(file).digest('hex'))] = origin + file;
const pathLink = (file, q = '') => `${origin}/g/${Object.keys(local).find((c) => local[c] === origin + file)}${q}`;
// the first links: /g/#url=<bundle>, on localhost only
const urlLink = (file) => `${origin}/g/#url=${encodeURIComponent(origin + file)}`;

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
  // the map, before the viewer's script runs (a sandboxed screen has no storage: it skips it)
  await tab.call('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('bluedoc-viewer:local', ${JSON.stringify(JSON.stringify(local))}); } catch {}` });
  await tab.call('Network.enable');
  await tab.call('Log.enable');
  tab.routes = [];
  tab.logErrors = [];
  tab.on('Network.requestWillBeSent', ({ request }) => {
    if (new URL(request.url).pathname.startsWith('/__bluedoc/')) tab.routes.push(request.url);
  });
  // a /g/<code> page comes with 404.html's HTTP 404, which Chrome logs: the page itself, not an error in it
  const own404 = (entry) => entry.source === 'network' && /^\/g\/[^/.]+\/?$/.test(new URL(entry.url || 'about:blank', origin).pathname);
  tab.on('Log.entryAdded', ({ entry }) => entry.level === 'error' && !own404(entry) && !entry.url?.startsWith('http://127.0.0.1:1/') && tab.logErrors.push(`${entry.text} ${entry.url || ''}`));
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
  await tab.go(pathLink(`/__smoke/${i}.json`));
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

  // view-only: no dock or tray, the chip in the app bar, no enabled field in the doc
  const vo = await tab.ev(IN(`({ dock: !!w.document.querySelector('.bd-anntb, .bd-cmp, .bd-gc, .bp-note'), tray: w.document.documentElement.classList.contains('bd-tray-on'),
    chip: (c => !!c && c.getClientRects().length > 0)(w.document.querySelector('.bd-bar .bd-vo')),
    fields: [...w.document.querySelectorAll('input, textarea, select, [contenteditable]:not([contenteditable="false"])')].filter(e => !e.disabled && e.type !== 'hidden' && !e.closest('.bd-btb')).length })`));
  check(!vo.dock && !vo.tray && vo.chip && !vo.fields, `${stem}: view-only: no dock, no composer, the chip shows, no enabled field (${JSON.stringify(vo)})`);

  // picks are not possible: a click on an open decision's option and BP.choose leave it as the doc has it, over a reload
  let decision = null;
  for (const s of doc.sections || [])
    for (const blk of s.blocks || [])
      for (const it of (blk.type === 'checklist' && blk.items) || [])
        if (!decision && Array.isArray(it.choices) && it.choices.length > 1 && !it.choice) decision = [blk.id, it.id, it.choices[1].id];
  if (decision) {
    const [cid, iid, choice] = decision;
    const picked = `${IN(`w.BP.replyPayload().items.find(x => x.checklist === '${cid}' && x.item === '${iid}')`)}?.choice ?? null`;
    const pk = `w.document.querySelector('#item-${cid}-${iid} .bp-opt[data-id="${choice}"] .pk')`;
    const at = await tab.ev(IN(`(e => { if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })(${pk})`));
    if (at) for (const type of ['mousePressed', 'mouseReleased']) await tab.call('Input.dispatchMouseEvent', { type, x: at[0], y: at[1], button: 'left', clickCount: 1 });
    const chose = await tab.ev(IN(`w.BP.choose('${cid}/${iid}', '${choice}')`));
    check(chose === false && (await tab.ev(picked)) === null, `${stem}: no pick on ${cid}/${iid}: its option and BP.choose change nothing`);
    await tab.reload();
    await drawn(tab);
    check((await tab.ev(picked)) === null, `${stem}: still no pick after a reload`);
  } else console.log(`     ${stem}: no open decision to try`);
  const keys = await tab.ev(IN('Object.keys(w.localStorage).filter(k => !k.startsWith("bluedoc-viewer:") && !/^bluedoc:(theme|width|design-(left|right)-w|comments|sp-tab|design-panel|listing-(panel|tab))$/.test(k))'));
  check(!keys.length, `${stem}: nothing stored but the view prefs${keys.length ? ': ' + keys.join(', ') : ''}`);

  // ?diff= on a doc with history: the compare view, at /g/<code>?diff=
  const revs = await tab.ev(IN('w.BP.revisions().map(r => r.rev)'));
  if (revs.length > 1) {
    const home = new URL(pathLink(`/__smoke/${i}.json`)).pathname;
    await tab.go(pathLink(`/__smoke/${i}.json`, `?diff=${revs[revs.length - 2]}`));
    await drawn(tab);
    const cmp = await tab.ev(IN('w.BP.compare()'));
    check(!!cmp && cmp.from === revs[revs.length - 2], `${stem}: ?diff=${revs[revs.length - 2]} compares (${cmp && cmp.changes.length} changes)`);
    // its Done key goes back to the current revision in the top window, at the same /g/<code>
    await tab.ev("window.__left = 1");
    await tab.ev(IN("w.document.querySelector('.bd-key[aria-label=\"Done\"]').click()"));
    await tab.waitFor("!window.__left && document.readyState === 'complete'");
    const at = await tab.ev('location.pathname + location.search + location.hash');
    check(at === home, `${stem}: Done leaves compare in the top window, at ${at}`);
    await drawn(tab);
  }
  await tab.close();

  // at 390 px
  const narrow = await newTab(390);
  await narrow.go(pathLink(`/__smoke/${i}.json`));
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
    const json = (code, body, headers = []) => tab.call('Fetch.fulfillRequest', { requestId, responseCode: code, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: '*' }, ...headers], body: Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)).toString('base64') });
    if (u.includes(ID.gone)) return json(404, { message: 'Not Found' });
    if (u.includes(ID.missing)) return json(200, { id: ID.missing, files: { 'notes.md': { content: '# Acme notes' } } });
    if (u.startsWith('https://api.github.com/') && u.includes(ID.limited))
      return json(403, { message: 'API rate limit exceeded' }, [{ name: 'X-RateLimit-Reset', value: String(RESET) }, { name: 'Access-Control-Expose-Headers', value: 'X-RateLimit-Reset' }]);
    if (u.includes(ID.limited)) return json(200, page);
    if (u.startsWith('https://api.github.com/') && u.includes(ID.big)) return json(200, { id: ID.big, files: { 'bluedoc-page.json': { truncated: true, content: page.slice(0, 100), raw_url: `https://gist.githubusercontent.com/acme/${ID.big}/raw/abc123/bluedoc-page.json` } } });
    if (u.includes(`${ID.big}/raw/abc123/`)) return json(200, page);
    return json(500, {});
  });
}

const RESET = Math.floor(Date.now() / 1000) + 25 * 60;   // the faked limit's reset, in 25 minutes

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
  // /g/<code>: GitHub's API only
  await state(`${origin}/g/${codeOf(ID.gone)}`, 'gone', 'gone');
  await state(`${origin}/g/${codeOf(ID.missing)}`, 'missing', 'no-page-file');
  await state(`${origin}/g/${codeOf(ID.big)}`, 'drawn', 'truncated-raw-url');
  await state(`${origin}/g/${codeOf(ID.limited)}`, 'limit', 'rate-limit');
  const at = await tab.ev(`new Date(${RESET * 1000}).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })`);
  const said = await tab.ev("document.querySelector('#viewer-status h1').textContent + ' / ' + document.querySelector('#viewer-status p').textContent");
  check(said.startsWith('GitHub’s limit for this network') && said.includes(`Try again at ${at}`), `state rate-limit: ${said}`);
  await state(`${origin}/g/abc`, 'link', 'bad-code');
  await state(pathLink('/__smoke/format.json'), 'format', 'format');
  await state(pathLink('/__smoke/none.json'), 'gone-or-missing', 'url-404');
  await state(pathLink('/__smoke/hostile.json'), 'format', 'hostile-title');
  await state(pathLink('/__smoke/newer.json'), 'drawn', 'newer');
  check(await tab.ev("!document.getElementById('viewer-note').hidden && document.querySelector('#viewer-note .t').textContent.includes('99.0.0')"), 'state newer: drawn with the update note');
  // the first links, at /g/: #<user>/<id> (the raw URL when the API's limit is spent) and #url= on localhost
  await state(`${origin}/g/`, 'link', 'no-link');
  await state(`${origin}/g/#acme/${ID.gone}`, 'gone', 'old-gone');
  await state(`${origin}/g/#acme/${ID.missing}`, 'missing', 'old-no-page-file');
  await state(`${origin}/g/#acme/${ID.limited}`, 'drawn', 'old-rate-limited-raw');
  await state(`${origin}/g/#acme/${ID.big}`, 'drawn', 'old-truncated-raw-url');
  await state(urlLink(`/__smoke/0.json`), 'drawn', 'old-url');
  await state(`${origin}/g/#url=${encodeURIComponent('http://127.0.0.1:1/x.json')}`, 'network', 'network');
  // any other path the site lacks: the not-found card, no viewer
  for (const path of ['/nope/', '/g/a/b', '/docs/missing.html']) {
    await tab.go(origin + path);
    const nf = await tab.ev("[getComputedStyle(document.getElementById('not-found')).display, getComputedStyle(document.getElementById('viewer-status')).display, document.title, !!document.getElementById('viewer-doc')]");
    check(nf[0] === 'grid' && nf[1] === 'none' && nf[2] === 'Page not found · bluedoc' && !nf[3], `not found at ${path}: ${JSON.stringify(nf)}`);
  }
  await shot(tab, 'not-found');
  await tab.close();
}

async function liveRun(ref) {
  const tab = await newTab();
  await tab.go(ref.includes('/') ? `${origin}/g/#${ref}` : `${origin}/g/${ref}`);
  const status = "document.getElementById('viewer-status')";
  await tab.waitFor(`${status}.hidden || ${status}.dataset.state !== 'loading'`, 30_000);
  const got = await tab.ev(`${status}.hidden ? 'drawn' : ${status}.dataset.state + ' · ' + document.querySelector('#viewer-status h1').textContent`);
  console.log(`live  ${ref}: ${got}`);
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
