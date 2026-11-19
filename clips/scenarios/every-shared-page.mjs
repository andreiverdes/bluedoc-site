// Every doc type: the page a shared link opens. acme-dev picked on three findings of acme-review-findings and shared
// it with those picks; bluedoc.ai's viewer draws the gist view-only ("Shared · view only", no dock), each answered
// finding marked "acme-dev answered" and the picked option "acme-dev's answer". Make a copy then offers to open it
// in the reader's own bluedoc. The share goes through bluedoc's stand-in gh (fixtures/share-standin, never GitHub)
// and the viewer is staged locally as tests/test_shared_page.py stages it.
import { linkIn, onlyGist, sharedViewer, standinServer } from '../fixtures/share-standin/standin.mjs';

const DOC = 'acme-review-findings';
const ROW = (item) => `#pr-412 .bd-mrow[data-item="t412/${item}"]`;
// the sharer's picks, as the page stores them (share.answers_slot carries them)
const PICKS = [['t412:tier-boundary', '=fix|'], ['t412:float-cents', '=ticket|'], ['t412:tiers-map', '=decline|'], ['t415:latency:custom', 'Measure the p95 first']];
let bd = null, viewer = null;

export default {
  url: () => viewer.url,
  posterAt: 2.4,
  cursor: [980, 560],

  async prepare(ctx) {
    bd = await standinServer({ repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-shared` });
    const file = bd.docPath(DOC);
    const { json } = await bd.req('GET', `/__bluedoc/url?doc=${encodeURIComponent(file)}`);
    const put = await bd.req('PUT', '/__bluedoc/state', { path: json.url, ops: PICKS });
    if (put.status !== 200) throw new Error(`state: ${put.status} ${JSON.stringify(put.json)}`);
    const link = linkIn(bd.py('serve.py', 'share', file, '--answers', 'picks'));
    viewer = await sharedViewer({ repo: ctx.repo, gh: bd.env.STANDIN_GH_DIR, gist: onlyGist(bd.env.STANDIN_GH_DIR), link });
    return async () => {
      await viewer.stop();
      await bd.stop();
    };
  },

  async setup(c) {
    await c.waitFor(`!!window.BP && !!document.querySelector('.bd-bar .bd-vo') && !!document.querySelector(${JSON.stringify(`${ROW('tier-boundary')} .bd-ansc`)})`);
    await c.ev(`BP.sidebar({ open: false }), BP.contents({ open: false })`);
    await c.pause(300);
    await c.ev(`scrollTo({ top: document.querySelector(${JSON.stringify(ROW('tier-boundary'))}).getBoundingClientRect().top + scrollY - 330, behavior: 'instant' })`);
    await c.pause(600);
  },

  async run(c) {
    await c.pause(900);
    // an answered finding opens on the sharer's pick
    await c.click(`${ROW('tier-boundary')} .bd-mchev`, { ms: 650 });
    await c.waitFor(`document.querySelector(${JSON.stringify(ROW('tier-boundary'))}).classList.contains('open')`);
    await c.pause(1600);

    // Make a copy: open it in my own bluedoc
    await c.click('.bd-bar-r .bd-mkc', { ms: 700 });
    await c.waitForSelector('dialog.bd-mkcs[open]');
    await c.pause(1800);
  },
};
