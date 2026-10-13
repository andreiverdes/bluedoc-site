# Clips

Short looping screen recordings of bluedoc for the site's pages, made from scripted scenarios in headless Chrome.

```sh
npm run clips                          # every scenario in clips/scenarios/
npm run clips -- docs-nested-zoom      # one (or a few) by name
CLIPS_TAG=docs npm run clips -- a b    # name the run's temp paths yourself
```

Each scenario:

1. gets its own bluedoc server: `BLUEDOC_HOME=/tmp/bd-clips-<tag>`, a free port (never 8740), a fresh copy of the
   Acme examples in `/tmp/bd-clips-work-<tag>/acme-shop/docs` (so the home page names the project `acme-shop`), and
   an unlock token in the page URL so comments save. The bluedoc checkout is `../bluedoc` (set `BLUEDOC_REPO` for
   another). The tag is `CLIPS_TAG`, else the scenario's name for a one-scenario run, else `pid<pid>`, so runs in
   parallel don't collide: give two runs of the same scenario different tags. Each run has its own Chrome profile;
2. is recorded in headless Chrome (`CHROME_PATH` to override) at 1280 × 800, DPR 2, dark theme;
3. runs while `Page.startScreencast` records every painted frame with its timestamp, then resamples them to a
   steady 30 fps (a frame holds until the next paint);
4. is encoded into `public/clips/`: `<name>.mp4` (H.264, CRF 23, faststart, 1280 wide), `<name>.webm` (VP9) and
   `<name>.poster.webp`. Each file's size is printed;
5. has 6 evenly spaced frames copied to `clips/.work/<name>/review/`: look at them before you commit a clip.

It needs ffmpeg with libx264 and libvpx (when ffmpeg is missing, the script says so and runs `brew install ffmpeg`
if Homebrew is there) and Node 22+. The poster is made with sharp, since Homebrew's ffmpeg has no WebP encoder.
`clips/.work/` holds the raw frames and is git-ignored.

## Writing a scenario

A scenario is `clips/scenarios/<name>.mjs`. Name it `<doc type>-<feature>` (`docs-nested-zoom`, `design-compare`),
or `every-<feature>` for one that every doc type has.

```js
export const crf = 27;             // optional: H.264 CRF (default 23); a busy clip (a blueprint, a board glide)
                                   // trades a little quality for size. WebM's VP9 CRF is crf + 13 (webmCrf sets it)
export const dropGlitches = true;  // optional: drop the suspect glitch frames the run reports (see Headless notes)

export default {
  doc: 'acme-orders',      // a doc's stem in the docs folder (the Acme examples, plus what prepare adds), or 'home'
  // url: async ({bd}) => 'http://…',  // instead of doc: open any URL (no BP wait)
  query: 'diff=1',         // optional: extra URL query (?rev=1, ?diff=1, …)
  cursor: [760, 470],      // where the cursor sits when the recording starts
  posterAt: 0.6,           // poster frame time in s; negative counts back from the end
  colorScheme: 'dark',     // optional: 'light'

  async prepare(ctx) { … }, // optional, before the tab opens: change the temp docs; may return a cleanup function
  async setup(c) { … },    // before recording: wait, scroll, open full screen, add a style
  async run(c) { … },      // recorded: keep it to 5–8 s
};
```

### prepare: fixtures and revisions

`prepare(ctx)` runs once the scenario's server is up and its docs are registered, before the tab opens. The server
renders docs on each request, so whatever `prepare` writes is what the page shows. It gets:

- `ctx.docs`: the temp docs folder (`…/acme-shop/docs`); `ctx.work`: its parent; `ctx.home`: `BLUEDOC_HOME`;
  `ctx.tag`, `ctx.repo` (the bluedoc checkout), `ctx.scripts` (its `skills/bluedoc/scripts`), `ctx.site`,
  `ctx.clips` (this folder), `ctx.env` (`BLUEDOC_HOME` and `BLUEDOC_PORT` of this server);
- `ctx.py(script, ...args)`: runs a bluedoc script with that env (throws on failure, returns stdout), e.g.
  `ctx.py('build.py', 'patch', ctx.bd.docPath('acme-orders'), 'artboard:home', '--change', 'A new headline.')`
  or `ctx.py('serve.py', 'snapshot', doc, '--rev', '1', '--url', 'http://localhost:5199')`;
- `ctx.bd`: the server: `bd.docPath(stem)`, `bd.req(method, path, body)` (a request with the key, as the page
  sends it: to post change requests or an approval, say), `bd.urlFor(stem | 'home', query)`, `bd.origin`.

Copy a fixture in with `cpSync(join(ctx.clips, 'fixtures/…'), join(ctx.docs, …), {recursive: true})`. To start a
fixture dev server, start it in `prepare` and return a function that stops it: it runs after the recording, even
when the scenario fails.

### Steps

`c` drives the page with real input events (hover, cursor shapes and the page's own handlers all react), and
the synthetic cursor (`lib/cursor.js`, a macOS-style arrow, hand and I-beam with a click ripple) follows each move:

| Step | What it does |
| --- | --- |
| `c.moveTo(target, {ms})` | eased move along a slight arc; the time defaults by distance |
| `c.click(target, {ms})`, `c.dblclick(target)` | move, then press and release, with a ripple |
| `c.drag(from, to, {ms})`, `c.down()`, `c.up()` | press, move, release |
| `c.selectText('a phrase', {in: sel})` | drag across a phrase, from its first letter to its last |
| `c.type('text', {cps})`, `c.key('Enter', {meta: true})` | type into the focused field, press a key |
| `c.wheel(deltaY, {ctrl: true, ms})` | a trackpad scroll at the cursor; `ctrl` is a pinch zoom, negative zooms in |
| `c.scrollTo(sel, {block})` | smooth page scroll to an element |
| `c.pause(ms)` | hold |
| `c.waitFor('js expr')`, `c.waitForSelector(sel)` | wait for page state, e.g. `BP.state('orders').focus.join() === 'api'` |
| `c.ev('js expr')` | evaluate in the page, e.g. `BP.board()` or `BP.annotations()` |
| `c.addStyle(css)` | add a stylesheet, to hold back a panel that would crowd the frame |
| `c.cursor('hand')` | pin the cursor's shape; `null` follows the page's CSS cursor again |
| `c.goto('acme-site' \| 'home', query)`, `c.reload()` | load a doc or the home page (with a fresh key; starts at the top), reload as F5 does (keeps the scroll) |
| `c.followNewTab(() => c.click(sel))` | run the trigger, then go on in the tab it opened: the recording follows it |
| `c.bd` | the server, as in `ctx.bd`: `c.bd.py('build.py', 'patch', …)` then `c.reload()` mid-clip |

A target is a CSS selector, `{sel, x, y}` (fractions of the element's box; `dx`/`dy` in px from the point),
`{text, in, at: 'start' | 'end'}` (a phrase on the page), or `[x, y]` viewport px. An element target is looked up
again on every step of a move, so the cursor lands on it even while the page scrolls or zooms.

The page's own API, `window.BP`, gives the state to wait on (`BP.state(canvasId)`, `BP.board()`,
`BP.annotations()`, `BP.sidebar()`, `BP.compare()`); bluedoc's `tests/` show more of it.

## Pacing

- Open on the subject at rest for about 0.8 s, so the loop's cut lands on something readable.
- Moves of 500–700 ms, short pauses (120–250 ms) before and after a click, about 1.2 s on each payoff.
- Wait on page state (`waitFor`), not fixed sleeps, between an action and its result.
- End where the clip can loop: the subject back at rest, or the finished result held for about 0.8 s.

## Checking a take

The run prints the clip's length, the frames Chrome painted, and any gap of over 100 ms between paints. A still
page paints nothing, so a gap only matters where something moves. Then look at the review frames. For the whole
take at once:

```sh
ffmpeg -framerate 30 -i clips/.work/<name>/seq/%05d.jpg -vf "select='not(mod(n\,6))',scale=320:-1,tile=8x5" -frames:v 1 sheet.jpg
```

## Headless notes

- Full screen (`requestFullscreen`) needs a user gesture: click the page's own button (or call it from `c.ev`,
  which runs as one). The headless screen is set to the viewport (`--screen-info`), or full screen would fill an
  800 × 600 screen. Entering or leaving full screen drops the viewport override; the harness sets it again on
  every `fullscreenchange` and drops the one or two frames painted at the wrong size in between (the run says how
  many), so a clip that leaves full screen keeps 1280 × 800.
- Wheel deltas reach the page as sent (no DPR scaling). A pinch zoom of `deltaY` scales a bluedoc canvas by
  `exp(-deltaY * 0.012)`.
- Input events wait for a frame to be acked; moves and wheels keep a few in flight to reach 60 Hz.
- Recording several clips in parallel shares the CPU: the run prints more paint gaps. If a take looks janky,
  record it again on its own.
- Now and then the compositor paints a frame before its tiles are rastered: dark boxes over part of the page for
  one or two frames, mostly while a blueprint canvas zooms. Chrome runs with `--run-all-compositor-stages-before-draw`
  and `--disable-checker-imaging`, which make it rarer but don't stop it. The run reports suspect frames (regions
  darker than the frames on both sides, which match each other there) as "suspect glitch frames". A quick real
  change can look the same (a tooltip that comes and goes, a screen a design board unmounts mid-glide), so they are
  only dropped when the scenario has `export const dropGlitches = true`. Look at the suspects; then record again, or
  opt in.

## Using a clip on the site

```astro
---
import Clip from '../components/Clip.astro';
---
<Clip name="docs-nested-zoom" label="A blueprint plays its data flows, then zooms into orders-api and pricing" url="localhost:8740/acme-orders" />
```

It plays muted on a loop only while in view. With reduced motion it shows the poster and a play button.
