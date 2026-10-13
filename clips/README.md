# Clips

Short looping screen recordings of bluedoc for the site's pages, made from scripted scenarios in headless Chrome.

```sh
npm run clips                          # every scenario in clips/scenarios/
npm run clips -- docs-blueprint-zoom   # one (or a few) by name
```

Each run:

1. starts its own bluedoc server: `BLUEDOC_HOME=/tmp/bd-clips`, a free port (never 8740), a fresh copy of the Acme
   examples in `/tmp/bd-clips-work/docs`, and an unlock token in the page URL so comments save. The bluedoc
   checkout is `../bluedoc` (set `BLUEDOC_REPO` for another);
2. opens headless Chrome (`CHROME_PATH` to override) at 1280 × 800, DPR 2, dark theme;
3. runs the scenario while `Page.startScreencast` records every painted frame with its timestamp, then resamples them
   to a steady 30 fps (a frame holds until the next paint);
4. encodes into `public/clips/`: `<name>.mp4` (H.264, CRF 23, faststart, 1280 wide), `<name>.webm` (VP9),
   `<name>.poster.webp`, and `<name>.gif` (960 wide, 15 fps, for READMEs), and prints each file's size;
5. copies 6 evenly spaced frames to `clips/.work/<name>/review/`: look at them before you commit a clip.

It needs ffmpeg with libx264 and libvpx (when ffmpeg is missing, the script says so and runs `brew install ffmpeg`
frames and is git-ignored.

## Writing a scenario

A scenario is `clips/scenarios/<name>.mjs`. Name it `<doc type>-<feature>` (`docs-blueprint-zoom`, `design-compare`),
or `every-<feature>` for one that every doc type has.

```js
export default {
  doc: 'acme-orders',      // an example's stem in bluedoc's skills/bluedoc/examples/
  query: 'diff=1',         // optional: extra URL query (?rev=1, ?diff=1, …)
  cursor: [760, 470],      // where the cursor sits when the recording starts
  posterAt: 0.6,           // poster frame time in s; negative counts back from the end
  colorScheme: 'dark',     // optional: 'light'

  async setup(c) { … },    // before recording: wait, scroll, open full screen, add a style
  async run(c) { … },      // recorded: keep it to 5–8 s
};
```

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

- Full screen (`requestFullscreen`) needs a real click, a user gesture: click the page's own button. The headless
  screen is set to the viewport (`--screen-info`), or full screen would fill an 800 × 600 screen.
- Wheel deltas reach the page as sent (no DPR scaling). A pinch zoom of `deltaY` scales a bluedoc canvas by
  `exp(-deltaY * 0.012)`.
- Input events wait for a frame to be acked; moves and wheels keep a few in flight to reach 60 Hz.

## Using a clip on the site

```astro
---
import Clip from '../components/Clip.astro';
---
<Clip name="docs-blueprint-zoom" label="A blueprint plays its data flows, then zooms into orders-api and pricing" url="localhost:8740/acme-orders" />
```

It plays muted on a loop only while in view. With reduced motion it shows the poster and a play button.
