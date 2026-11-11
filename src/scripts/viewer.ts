// The shared-doc viewer at /g/: https://bluedoc.ai/g/#<github user>/<gist id> draws the gist's bluedoc-page.json
// with the page template of the latest bluedoc release (public/g/, copied by scripts/sync-template.mjs).
//
// The bundle ({bluedoc: 'share/1', version, name, title, rev, boardGeo, fill}) holds the strings bluedoc's build.py
// fills its template with for an -o file. The page is drawn in a same-origin frame, written with document.write: it
// keeps this page's URL (so ?rev= and ?diff= reach it) while its own #anchors stay in the frame, and reader state goes
// to bluedoc.ai's localStorage. window.bluedocShare tells the template it is a shared page: no server, revision links
// in the top window. The part after # never leaves the browser: nothing here sends or logs it.
//
// The gist is anyone's: every value it fills is checked before it goes in the page (fillOf). On localhost only,
// #url=<encoded URL of a bluedoc-page.json> loads a bundle from anywhere (scripts/viewer-smoke.mjs).
import shipped from '../../public/g/version.json';

const FORMAT = 'share/1';
const PAGE_FILE = 'bluedoc-page.json';
const GEO_SLOT = '/*__BOARD_GEO__*/';
// what the page reads as JSON from <script type="application/json"> blocks; the server-only ones are always null here
const JSON_SLOTS = ['__BLUEDOC_DOC__', '__BLUEDOC_HISTORY__', '__BLUEDOC_SCREENS__', '__BLUEDOC_LISTING__', '__BLUEDOC_PINS__'];
const NULL_SLOTS = ['__BLUEDOC_STATE__', '__BLUEDOC_LIVE__', '__BLUEDOC_SNAPS__'];
const LOCAL = ['localhost', '127.0.0.1', '[::1]'];

type Source = { kind: 'gist'; user: string; id: string } | { kind: 'url'; url: string };
type Bundle = { version: string; name: string; title: string; boardGeo: boolean; fill: Record<string, string> };
type Problem = 'link' | 'gone' | 'missing' | 'gone-or-missing' | 'format' | 'network' | 'limit';

class ViewerError extends Error {
  constructor(
    readonly problem: Problem,
    readonly detail = '',
  ) {
    super(problem);
  }
}

/** The link's fragment: `#<user>/<gist id>`, or `#url=<encoded URL>` on localhost. */
function sourceOf(hash: string): Source | null {
  const h = hash.replace(/^#/, '');
  const m = /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([0-9a-fA-F]{20,64})$/.exec(h);
  if (m) return { kind: 'gist', user: m[1], id: m[2].toLowerCase() };
  if (h.startsWith('url=') && LOCAL.includes(location.hostname)) {
    try {
      const url = new URL(decodeURIComponent(h.slice(4)), location.href);
      if (url.protocol === 'http:' || url.protocol === 'https:') return { kind: 'url', url: url.href };
    } catch {
      return null;
    }
  }
  return null;
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

/**
 * The gist's latest bluedoc-page.json. The API names the file's current raw URL (its revision's sha in the path), so
 * a page shared again shows at once; the gist's /raw/<file> URL can lag on GitHub's CDN for a few minutes, and is
 * used when the API's 60 requests an hour per address are spent.
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
    const raw = await get(`https://gist.githubusercontent.com/${encodeURIComponent(src.user)}/${src.id}/raw/${PAGE_FILE}`, { cache: 'no-cache' });
    if (raw.status === 404) throw new ViewerError('gone-or-missing');
    if (!raw.ok) throw new ViewerError(raw.status === 403 || raw.status === 429 ? 'limit' : 'network', `HTTP ${raw.status}`);
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
  const r = await get(new URL(name, location.href).href);
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
  link: ['No shared doc in this link', 'A shared doc’s link looks like bluedoc.ai/g/#user/1a2b3c…, with the part after # in full. Ask the sender to copy it again.'],
  gone: ['This shared doc isn’t there any more', 'Its gist was deleted, or the link has a typo. Ask the sender to share it again.'],
  missing: ['This gist isn’t a shared bluedoc doc', 'It has no bluedoc-page.json, so there’s nothing to draw here.'],
  'gone-or-missing': ['This shared doc isn’t there', 'Its gist was deleted, the link has a typo, or the gist isn’t a shared bluedoc doc.'],
  format: ['This viewer can’t draw this doc', 'Its bluedoc-page.json isn’t one this viewer knows. If the sender has a newer bluedoc, it may show here soon.'],
  network: ['Couldn’t load the shared doc', 'GitHub, which holds it, didn’t answer. Check your connection and try again.'],
  limit: ['GitHub is busy for this address', 'GitHub limits how often one address can read gists. Try again in a few minutes.'],
};

function show(kind: 'loading' | Problem, detail = ''): void {
  status.hidden = false;
  status.dataset.state = kind;
  const [head, body] = kind === 'loading' ? ['Opening the shared doc…', ''] : COPY[kind];
  status.querySelector('h1')!.textContent = head;
  const p = status.querySelector('p')!;
  p.textContent = body;
  p.hidden = !body;
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

function draw(b: Bundle, html: string): void {
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
  w.bluedocShare = { name: b.name, hash: location.hash };
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
  const src = sourceOf(location.hash);
  if (!src) return show('link');
  show('loading');
  const tpl = asset('template.html');
  tpl.catch(() => {});
  try {
    const b = bundleOf(await bundleText(src));
    const geo = b.boardGeo ? (await asset('board-geo.js')).replace(/<\/(script)/gi, '<\\/$1') : '';
    draw(b, pageHtml(await tpl, { ...b.fill, [GEO_SLOT]: geo }));
    if (b.version && older(shipped.version, b.version))
      note(`Shared from bluedoc ${b.version}; this viewer draws with ${shipped.version}, so some parts may look different until it updates.`);
  } catch (e) {
    if (e instanceof ViewerError) show(e.problem, e.detail);
    else show('network', e instanceof Error ? e.message : '');
  }
}

(status.querySelector('.retry') as HTMLElement).addEventListener('click', () => location.reload());
// another link pasted over this one changes the fragment only: open that one
addEventListener('hashchange', () => location.reload());
open();
