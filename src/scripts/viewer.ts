// The shared-doc viewer: https://bluedoc.ai/g/<code> draws a gist's bluedoc-page.json with the page template of the
// latest bluedoc release (public/g/, copied by scripts/sync-template.mjs). <code> is the gist id's bytes in base64url
// without padding (32 hex digits → 22 characters). No such page exists on the site: GitHub Pages answers /g/<code>
// with 404.html, which is this viewer too (src/components/SharedDocViewer.astro), and every other unknown path gets
// its not-found card. /g/ itself still opens the first links, /g/#<github user>/<gist id>.
//
// The bundle ({bluedoc: 'share/1', version, name, title, rev, boardGeo, fill}) holds the strings bluedoc's build.py
// fills its template with for an -o file. The page is drawn in a same-origin frame, written with document.write: it
// keeps this page's URL (so /g/<code>?rev= and ?diff= reach it) while its own #anchors stay in the frame.
// window.bluedocShare tells the template it is a shared page: no server, revision links in the top window, and
// view-only (its VIEW_ONLY): no dock, picks, ticks or comments, and nothing in bluedoc.ai's localStorage but its view
// prefs (theme, panel open and width). An old link's fragment never leaves the browser: nothing here sends or logs it.
//
// The gist is anyone's: every value it fills is checked before it goes in the page (bundleOf). On localhost only,
// /g/#url=<encoded URL of a bluedoc-page.json> loads a bundle from anywhere, and /g/<code> resolves through the map
// in localStorage['bluedoc-viewer:local'] ({code: URL of a bluedoc-page.json}) before GitHub (scripts/viewer-smoke.mjs).
import shipped from '../../public/g/version.json';

const FORMAT = 'share/1';
const PAGE_FILE = 'bluedoc-page.json';
const GEO_SLOT = '/*__BOARD_GEO__*/';
// what the page reads as JSON from <script type="application/json"> blocks; the server-only ones are always null here
const JSON_SLOTS = ['__BLUEDOC_DOC__', '__BLUEDOC_HISTORY__', '__BLUEDOC_SCREENS__', '__BLUEDOC_LISTING__', '__BLUEDOC_PINS__'];
const NULL_SLOTS = ['__BLUEDOC_STATE__', '__BLUEDOC_LIVE__', '__BLUEDOC_SNAPS__'];
const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const LOCAL_MAP = 'bluedoc-viewer:local';
const ROOT = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}g/`;
// /g/ itself, where the old links' fragment names the gist
const AT_ROOT = location.pathname === ROOT || location.pathname === `${ROOT}index.html`;

// user: the old link's, for the gist's raw URL when the API's limit is spent; a /g/<code> link has none
type Source = { kind: 'gist'; user: string | null; id: string } | { kind: 'url'; url: string };
type Bundle = { version: string; name: string; title: string; boardGeo: boolean; fill: Record<string, string> };
type Problem = 'link' | 'gone' | 'missing' | 'gone-or-missing' | 'format' | 'network' | 'limit';

class ViewerError extends Error {
  constructor(
    readonly problem: Problem,
    readonly detail = '',
    // what the card says instead of its usual text
    readonly body = '',
  ) {
    super(problem);
  }
}

/** The gist id a /g/<code> link holds: its base64url (no padding) decoded to hex; null when it isn't one, written canonically. */
function idOfCode(code: string): string | null {
  if (!/^[A-Za-z0-9_-]{14,43}$/.test(code)) return null;   // 10 to 32 bytes: gist ids are 20 or 32 hex digits
  let bin: string;
  try {
    bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return null;
  }
  if (btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== code) return null;
  return [...bin].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

/** A bundle URL from localhost's own map or #url= fragment; null for anything else. */
function localUrl(raw: string | undefined): Source | null {
  if (!LOCAL || !raw) return null;
  try {
    const url = new URL(raw, location.href);
    return url.protocol === 'http:' || url.protocol === 'https:' ? { kind: 'url', url: url.href } : null;
  } catch {
    return null;
  }
}

/**
 * What this address opens: /g/<code>; at /g/, an old link's `#<user>/<gist id>` (or `#url=<encoded URL>` on
 * localhost); null when it holds no doc; 'elsewhere' for a path that is no viewer's (the not-found card).
 */
function sourceOf(path: string, hash: string): Source | null | 'elsewhere' {
  if (AT_ROOT) {
    const h = hash.replace(/^#/, '');
    const m = /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([0-9a-fA-F]{20,64})$/.exec(h);
    if (m) return { kind: 'gist', user: m[1], id: m[2].toLowerCase() };
    if (h.startsWith('url=')) {
      try {
        return localUrl(decodeURIComponent(h.slice(4)));
      } catch {
        return null;
      }
    }
    return null;
  }
  const m = path.startsWith(ROOT) ? /^([^/]+)\/?$/.exec(path.slice(ROOT.length)) : null;
  if (!m) return 'elsewhere';
  const id = idOfCode(m[1]);
  if (!id) return null;
  let map: Record<string, string> = {};
  try {
    if (LOCAL) map = JSON.parse(localStorage.getItem(LOCAL_MAP) || '{}');
  } catch {
    /* no map */
  }
  return localUrl(map[m[1]]) || { kind: 'gist', user: null, id };
}

async function get(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new ViewerError('network');
  }
}

async function text(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    throw new ViewerError('network');
  }
}

/** When GitHub lets this network read gists again (its x-ratelimit-reset, else retry-after), as the card says it. */
function limitText(r: Response): string {
  const reset = Number(r.headers.get('x-ratelimit-reset')), after = Number(r.headers.get('retry-after'));
  const at = reset > 0 ? new Date(reset * 1000) : after > 0 ? new Date(Date.now() + after * 1000) : null;
  const when = at ? `at ${at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'in a few minutes';
  return `Try again ${when}. Without signing in, GitHub lets one network read 60 gists an hour.`;
}

/**
 * The gist's latest bluedoc-page.json, through GitHub's API, which names the file's current raw URL (its revision's
 * sha in the path), so a page shared again shows at once. Over the API's 60 requests an hour per network, an old link
 * reads the gist's /raw/<file> URL (it names the user; it can lag on GitHub's CDN for a few minutes); a /g/<code> link
 * says when to try again.
 */
async function bundleText(src: Source): Promise<string> {
  if (src.kind === 'url') {
    const r = await get(src.url, { cache: 'no-cache' });
    if (!r.ok) throw new ViewerError(r.status === 404 ? 'gone-or-missing' : 'network', `HTTP ${r.status}`);
    return text(r);
  }
  // no-cache: revalidated each time (a 304 doesn't count against the limit), so Share again shows on a reload
  const r = await get(`https://api.github.com/gists/${src.id}`, { cache: 'no-cache', headers: { Accept: 'application/vnd.github+json' } });
  if (r.status === 403 || r.status === 429) {
    if (!src.user) throw new ViewerError('limit', '', limitText(r));
    const raw = await get(`https://gist.githubusercontent.com/${encodeURIComponent(src.user)}/${src.id}/raw/${PAGE_FILE}`, { cache: 'no-cache' });
    if (raw.status === 404) throw new ViewerError('gone-or-missing');
    if (!raw.ok) throw new ViewerError(raw.status === 403 || raw.status === 429 ? 'limit' : 'network', `HTTP ${raw.status}`, raw.status === 403 || raw.status === 429 ? limitText(r) : '');
    return text(raw);
  }
  if (r.status === 404) throw new ViewerError('gone');
  if (!r.ok) throw new ViewerError('network', `HTTP ${r.status}`);
  let gist: { files?: Record<string, { truncated?: boolean; content?: string; raw_url?: string } | null> };
  try {
    gist = JSON.parse(await text(r));
  } catch {
    throw new ViewerError('network', 'GitHub sent something that isn\'t JSON');
  }
  const file = gist.files?.[PAGE_FILE];
  if (!file) throw new ViewerError('missing');
  if (!file.truncated && typeof file.content === 'string') return file.content;
  // over 1 MB the API leaves the content out: its raw URL, at this revision, has all of it
  if (typeof file.raw_url !== 'string' || !/^https:\/\/gist\.githubusercontent\.com\//.test(file.raw_url)) throw new ViewerError('format');
  const raw = await get(file.raw_url);
  if (!raw.ok) throw new ViewerError('network', `HTTP ${raw.status}`);
  return text(raw);
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/**
 * The bundle, its fill checked: a JSON slot must parse, and to an object or null (a JSON string can't end its
 * <script> block, as build.py escapes every '<' as \u003c, so one with '<' is refused); the title holds no '<'. The
 * server-only slots are null whatever the gist says, so the page never looks for a server.
 */
function bundleOf(raw: string): Bundle {
  let b: unknown;
  try {
    b = JSON.parse(raw);
  } catch {
    throw new ViewerError('format', 'not JSON');
  }
  if (!isObj(b) || b.bluedoc !== FORMAT) throw new ViewerError('format', isObj(b) && typeof b.bluedoc === 'string' ? b.bluedoc.slice(0, 40) : '');
  const f = b.fill;
  if (!isObj(f)) throw new ViewerError('format', 'no fill');
  const fill: Record<string, string> = {};
  for (const k of JSON_SLOTS) {
    const v = f[k];
    if (typeof v !== 'string' || v.includes('<')) throw new ViewerError('format', k);
    let x: unknown;
    try {
      x = JSON.parse(v);
    } catch {
      throw new ViewerError('format', k);
    }
    if (x !== null && !isObj(x)) throw new ViewerError('format', k);
    if (k === '__BLUEDOC_DOC__' && !isObj(x)) throw new ViewerError('format', k);
    fill[k] = v;
  }
  const title = f.__BLUEDOC_TITLE__;
  if (typeof title !== 'string' || title.includes('<')) throw new ViewerError('format', '__BLUEDOC_TITLE__');
  fill.__BLUEDOC_TITLE__ = title;
  for (const k of NULL_SLOTS) fill[k] = 'null';
  const name = typeof b.name === 'string' && /^[^/\\\u0000-\u001f]{1,200}$/.test(b.name) ? b.name : 'doc';
  return {
    version: typeof b.version === 'string' ? b.version.slice(0, 40) : '',
    name,
    title: typeof b.title === 'string' && b.title.trim() ? b.title.trim().slice(0, 300) : 'Shared doc',
    boardGeo: b.boardGeo === true,
    fill,
  };
}

/** a < b for versions like 1.2.3 (a part that isn't a number counts as 0) */
function older(a: string, b: string): boolean {
  const pa = a.split('.').map((x) => parseInt(x, 10) || 0), pb = b.split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0);
  return false;
}

async function asset(name: string): Promise<string> {
  const r = await get(ROOT + name);
  if (!r.ok) throw new ViewerError('network', `${name}: HTTP ${r.status}`);
  return text(r);
}

/** The template with every placeholder filled in one pass, as build.py's fill_page: a placeholder's name inside a value stays text. */
function pageHtml(template: string, fill: Record<string, string>): string {
  const re = new RegExp(Object.keys(fill).map((k) => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|'), 'g');
  return template.replace(re, (k) => fill[k]);
}

// ---------- what the reader sees ----------

const status = document.getElementById('viewer-status') as HTMLElement;
const COPY: Record<Problem, [string, string]> = {
  link: ['No shared doc in this link', 'A shared doc’s link looks like bluedoc.ai/g/ followed by 22 letters and digits. Ask the sender to copy it again, in full.'],
  gone: ['This shared doc isn’t there any more', 'Its gist was deleted, or the link has a typo. Ask the sender to share it again.'],
  missing: ['This gist isn’t a shared bluedoc doc', 'It has no bluedoc-page.json, so there’s nothing to draw here.'],
  'gone-or-missing': ['This shared doc isn’t there', 'Its gist was deleted, the link has a typo, or the gist isn’t a shared bluedoc doc.'],
  format: ['This viewer can’t draw this doc', 'Its bluedoc-page.json isn’t one this viewer knows. If the sender has a newer bluedoc, it may show here soon.'],
  network: ['Couldn’t load the shared doc', 'GitHub, which holds it, didn’t answer. Check your connection and try again.'],
  limit: ['GitHub’s limit for this network', 'Try again in a few minutes. Without signing in, GitHub lets one network read 60 gists an hour.'],
};

function show(kind: 'loading' | Problem, detail = '', text = ''): void {
  status.hidden = false;
  status.dataset.state = kind;
  const [head, body] = kind === 'loading' ? ['Opening the shared doc…', ''] : COPY[kind];
  status.querySelector('h1')!.textContent = head;
  const p = status.querySelector('p')!;
  p.textContent = text || body;
  p.hidden = !p.textContent;
  const d = status.querySelector('.detail') as HTMLElement;
  d.textContent = detail;
  d.hidden = !detail;
  (status.querySelector('.retry') as HTMLElement).hidden = kind !== 'network' && kind !== 'limit';
  document.title = kind === 'loading' ? 'Shared doc · bluedoc' : `${head} · bluedoc`;
}

/** A note over the page, for a doc from a newer bluedoc than this viewer's template. */
function note(text: string): void {
  const bar = document.getElementById('viewer-note') as HTMLElement;
  bar.querySelector('.t')!.textContent = text;
  bar.hidden = false;
  bar.querySelector('button')!.addEventListener('click', () => (bar.hidden = true), { once: true });
}

// hash: an old link's fragment, which the page's revision links keep (a /g/<code> link's path is enough)
function draw(b: Bundle, html: string, hash: string): void {
  const fr = document.createElement('iframe');
  fr.id = 'viewer-doc';
  fr.title = b.title;
  fr.allow = 'clipboard-write; fullscreen';
  document.body.append(fr);
  const w = fr.contentWindow as (Window & { bluedocShare?: { name: string; hash: string } }) | null;
  const d = fr.contentDocument;
  if (!w || !d) throw new ViewerError('network', 'the page frame didn’t open');
  d.open();
  // after open, before the page's script runs; the frame's document takes this page's URL, query and fragment included
  w.bluedocShare = { name: b.name, hash };
  d.write(html);
  d.close();
  status.hidden = true;
  // the page's title (a reader's own, or the revision shown) is this tab's
  const title = () => (document.title = d.title || b.title);
  title();
  new MutationObserver(title).observe(d.head, { subtree: true, childList: true, characterData: true });
  // ⌘P / Ctrl+P prints the doc, not this page with the doc in a frame; a board's own handler prints its sheet first
  const print = (e: KeyboardEvent) => {
    if (e.defaultPrevented || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'p') return;
    e.preventDefault();
    w.print();
  };
  w.addEventListener('keydown', print);
  addEventListener('keydown', print);
  w.focus();
}

async function open(): Promise<void> {
  // a revision link the page opened in its own frame: the viewer belongs in the top window, with the doc's fragment
  if (window.top && window.top !== window) {
    try {
      if (window.top.location.pathname === location.pathname) {
        window.top.location.href = location.pathname + location.search + (location.hash || window.top.location.hash);
        return;
      }
    } catch {
      /* framed by another site: draw here */
    }
  }
  const src = sourceOf(location.pathname, location.hash);
  // not a viewer's address: 404.html's not-found card, which its head script already showed
  if (src === 'elsewhere') return;
  if (!src) return show('link');
  show('loading');
  const tpl = asset('template.html');
  tpl.catch(() => {});
  try {
    const b = bundleOf(await bundleText(src));
    const geo = b.boardGeo ? (await asset('board-geo.js')).replace(/<\/(script)/gi, '<\\/$1') : '';
    draw(b, pageHtml(await tpl, { ...b.fill, [GEO_SLOT]: geo }), AT_ROOT ? location.hash : '');
    if (b.version && older(shipped.version, b.version))
      note(`Shared from bluedoc ${b.version}; this viewer draws with ${shipped.version}, so some parts may look different until it updates.`);
  } catch (e) {
    if (e instanceof ViewerError) show(e.problem, e.detail, e.body);
    else show('network', e instanceof Error ? e.message : '');
  }
}

(status.querySelector('.retry') as HTMLElement).addEventListener('click', () => location.reload());
// at /g/, another old link pasted over this one changes the fragment only: open that one
if (AT_ROOT) addEventListener('hashchange', () => location.reload());
open();
