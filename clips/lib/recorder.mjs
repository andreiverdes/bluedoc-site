// Records a tab with Page.startScreencast: each frame Chrome paints is written with its timestamp, then the frames
// are resampled onto a steady 30 fps timeline (a frame is held until the next paint) and encoded with ffmpeg
// (mp4, webm) and sharp (the poster: Homebrew's ffmpeg comes without a WebP encoder).
import { spawnSync } from 'node:child_process';
import { copyFileSync, linkSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

export const FPS = 30;

/** [width, height] of a baseline or progressive JPEG, from its SOF marker. */
function jpegSize(b) {
  for (let i = 2; i + 9 < b.length; ) {
    if (b[i] !== 0xff) return [0, 0];
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  return [0, 0];
}

export class Recorder {
  constructor(tab, dir, { width, height, dpr }) {
    this.tab = tab;
    this.raw = join(dir, 'raw');
    this.seq = join(dir, 'seq');
    this.size = { width: width * dpr, height: height * dpr };
    this.frames = []; // { ts (s), file }
  }

  async start() {
    rmSync(this.raw, { recursive: true, force: true });
    mkdirSync(this.raw, { recursive: true });
    await this.#cast();
    // the first frame is the clip's time zero: wait for it, so the clip never opens on nothing
    const deadline = Date.now() + 5000;
    while (!this.frames.length && Date.now() < deadline) await new Promise((r) => setTimeout(r, 20));
    if (!this.frames.length) throw new Error('the screencast sent no frame');
    this.t0 = this.frames[0].ts;
  }

  async #cast() {
    const tab = this.tab;
    this.off = tab.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
      tab.call('Page.screencastFrameAck', { sessionId }).catch(() => {});
      // a frame painted at another size (mid full-screen change, before the metrics override is back; its
      // metadata still says 1280 × 800) would put two sizes in one clip: drop it, and the clip holds the one before
      const jpg = Buffer.from(data, 'base64');
      const [w, h] = jpegSize(jpg);
      if (w !== this.size.width || h !== this.size.height) {
        this.offSize = (this.offSize || 0) + 1;
        return;
      }
      const file = join(this.raw, `${String(this.frames.length).padStart(5, '0')}.jpg`);
      writeFileSync(file, jpg);
      this.frames.push({ ts: metadata.timestamp, file });
    });
    await tab.call('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: this.size.width, maxHeight: this.size.height, everyNthFrame: 1 });
  }

  /** Goes on recording another tab (a new tab the page opened); the clip holds the last frame until it paints. */
  async switchTo(tab) {
    await this.tab.call('Page.stopScreencast').catch(() => {});
    this.off();
    this.tab = tab;
    await this.#cast();
  }

  async stop() {
    this.t1 = Date.now() / 1000;
    await this.tab.call('Page.stopScreencast');
    this.off();
  }

  /**
   * Finds suspect glitch frames (dropping them with dropGlitches), then hard-links the frame shown at each 1/30 s
   * tick into seq/: 00000.jpg, 00001.jpg, … Returns stats, with the stalls: gaps of over 100 ms between paints
   * (where the clip holds one frame), as [clip time s, gap ms], and the suspect frames, as clip times.
   */
  async resample({ dropGlitches = false } = {}) {
    const glitches = await this.#findGlitches(dropGlitches);
    rmSync(this.seq, { recursive: true, force: true });
    mkdirSync(this.seq, { recursive: true });
    const end = Math.max(this.t1, this.frames.at(-1).ts);
    const n = Math.round((end - this.t0) * FPS);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const t = this.t0 + i / FPS + 1e-6;
      while (j + 1 < this.frames.length && this.frames[j + 1].ts <= t) j++;
      const dst = join(this.seq, `${String(i).padStart(5, '0')}.jpg`);
      try {
        linkSync(this.frames[j].file, dst);
      } catch {
        copyFileSync(this.frames[j].file, dst);
      }
    }
    const stalls = [];
    for (let k = 1; k < this.frames.length; k++) {
      const gap = this.frames[k].ts - this.frames[k - 1].ts;
      if (gap > 0.1) stalls.push([+(this.frames[k - 1].ts - this.t0).toFixed(2), Math.round(gap * 1000)]);
    }
    return { frames: n, painted: this.frames.length, offSize: this.offSize || 0, glitches, seconds: n / FPS, stalls };
  }

  /**
   * A headless compositor now and then paints a frame with tiles not yet rastered: dark boxes where parts of the
   * page should be, for one or two frames mid-animation (a blueprint canvas zooming, mostly). In such a frame
   * several regions differ from the frames on both sides, are darker than both, while those two look alike there.
   * A cut or a steady motion doesn't do that, but a quick real change can (a tooltip that comes and goes, a screen
   * a board unmounts mid-glide), so suspects are only reported, and dropped (the clip holds the frame before) when
   * the scenario asks. Compared on 64 × 40 greyscale thumbnails, in 4 × 4 cells (16 × 10 regions of the frame).
   */
  async #findGlitches(drop) {
    const W = 64, H = 40, C = 4, N = (W / C) * (H / C);
    const thumbs = await Promise.all(this.frames.map((f) => sharp(f.file).resize(W, H, { fit: 'fill' }).greyscale().raw().toBuffer()));
    // per cell: the mean absolute difference of two thumbnails, the mean of one
    const cells = (a, b) => {
      const out = new Float64Array(N);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[((y / C) | 0) * (W / C) + ((x / C) | 0)] += Math.abs(a[y * W + x] - b[y * W + x]);
      return out.map((s) => s / (C * C));
    };
    const means = thumbs.map((t) => {
      const out = new Float64Array(N);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[((y / C) | 0) * (W / C) + ((x / C) | 0)] += t[y * W + x];
      return out.map((s) => s / (C * C));
    });
    const glitch = (a, run, b) => {
      const ab = cells(thumbs[a], thumbs[b]);
      const outs = run.map((k) => [cells(thumbs[a], thumbs[k]), cells(thumbs[k], thumbs[b])]);
      let n = 0, darker = 0;
      for (let c = 0; c < N; c++) {
        const out = Math.min(...outs.map(([p, q]) => Math.min(p[c], q[c])));
        if (out <= 18 || ab[c] >= out * 0.3) continue;
        n++;
        if (run.every((k) => means[k][c] < means[a][c] && means[k][c] < means[b][c])) darker++;
      }
      return n >= 3 && darker >= n * 0.6;
    };
    const found = new Set();
    for (let i = 1; i + 1 < thumbs.length; i++) {
      if (found.has(i)) continue;
      for (const len of [1, 2]) {
        const run = Array.from({ length: len }, (_, k) => i + k);
        if (i + len < thumbs.length && glitch(i - 1, run, i + len)) {
          run.forEach((k) => found.add(k));
          break;
        }
      }
    }
    const times = [...found].sort((x, y) => x - y).map((k) => +(this.frames[k].ts - this.t0).toFixed(2));
    if (drop) this.frames = this.frames.filter((_, k) => !found.has(k));
    return times;
  }
}

function ff(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}\n${r.stderr}`);
}

export function haveFfmpeg() {
  return spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }).status === 0;
}

/**
 * Encodes seq/%05d.jpg (total frames) into out/<name>.{mp4,webm,poster.webp}; returns [file, bytes][].
 * posterAt: the poster frame's time in s; negative counts from the end.
 */
export async function encode(seqDir, total, outDir, name, { posterAt = 0, crf = 23, webmCrf = crf + 13, width = 1280 } = {}) {
  mkdirSync(outDir, { recursive: true });
  const input = ['-framerate', String(FPS), '-i', join(seqDir, '%05d.jpg')];
  const scale = `scale=${width}:-2:flags=lanczos`;
  const files = {
    mp4: join(outDir, `${name}.mp4`),
    webm: join(outDir, `${name}.webm`),
    poster: join(outDir, `${name}.poster.webp`),
  };
  ff([...input, '-vf', `${scale},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', files.mp4]);
  ff([...input, '-vf', `${scale},format=yuv420p`, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(webmCrf), '-row-mt', '1',
    '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', files.webm]);
  const pi = Math.max(0, Math.min(total - 1, Math.round((posterAt < 0 ? total / FPS + posterAt : posterAt) * FPS)));
  const posterFrame = join(seqDir, `${String(pi).padStart(5, '0')}.jpg`);
  await sharp(posterFrame).resize({ width, kernel: 'lanczos3' }).webp({ quality: 82 }).toFile(files.poster);
  return Object.values(files).map((f) => [f, statSync(f).size]);
}

/** n frames spread evenly over seq/, copied to dir, for looking at a take. */
export function reviewFrames(seqDir, dir, total, n = 6) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const out = [];
  for (let k = 0; k < n; k++) {
    const i = Math.min(total - 1, Math.round((k * (total - 1)) / (n - 1)));
    const dst = join(dir, `frame-${k + 1}-${(i / FPS).toFixed(2)}s.jpg`);
    copyFileSync(join(seqDir, `${String(i).padStart(5, '0')}.jpg`), dst);
    out.push(dst);
  }
  return out;
}
