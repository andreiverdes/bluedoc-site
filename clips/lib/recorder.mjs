// Records a tab with Page.startScreencast: each frame Chrome paints is written with its timestamp, then the frames
// are resampled onto a steady 30 fps timeline (a frame is held until the next paint) and encoded with ffmpeg
// (mp4, webm, gif) and sharp (the poster: Homebrew's ffmpeg comes without a WebP encoder).
import { spawnSync } from 'node:child_process';
import { copyFileSync, linkSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

export const FPS = 30;

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
    this.off = this.tab.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
      const file = join(this.raw, `${String(this.frames.length).padStart(5, '0')}.jpg`);
      writeFileSync(file, Buffer.from(data, 'base64'));
      this.frames.push({ ts: metadata.timestamp, file });
      this.tab.call('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await this.tab.call('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: this.size.width, maxHeight: this.size.height, everyNthFrame: 1 });
    // the first frame is the clip's time zero: wait for it, so the clip never opens on nothing
    const deadline = Date.now() + 5000;
    while (!this.frames.length && Date.now() < deadline) await new Promise((r) => setTimeout(r, 20));
    if (!this.frames.length) throw new Error('the screencast sent no frame');
    this.t0 = this.frames[0].ts;
  }

  async stop() {
    this.t1 = Date.now() / 1000;
    await this.tab.call('Page.stopScreencast');
    this.off();
  }

  /**
   * Hard-links the frame shown at each 1/30 s tick into seq/: 00000.jpg, 00001.jpg, … Returns stats, with the
   * stalls: gaps of over 100 ms between paints (where the clip holds one frame), as [clip time s, gap ms].
   */
  resample() {
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
    return { frames: n, painted: this.frames.length, seconds: n / FPS, stalls };
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
 * Encodes seq/%05d.jpg (total frames) into out/<name>.{mp4,webm,poster.webp,gif}; returns [file, bytes][].
 * posterAt: the poster frame's time in s; a negative time counts back from the end.
 */
export async function encode(seqDir, total, outDir, name, { posterAt = 0, width = 1280, gifWidth = 960, gifFps = 15 } = {}) {
  mkdirSync(outDir, { recursive: true });
  const input = ['-framerate', String(FPS), '-i', join(seqDir, '%05d.jpg')];
  const scale = `scale=${width}:-2:flags=lanczos`;
  const files = {
    mp4: join(outDir, `${name}.mp4`),
    webm: join(outDir, `${name}.webm`),
    poster: join(outDir, `${name}.poster.webp`),
    gif: join(outDir, `${name}.gif`),
  };
  ff([...input, '-vf', `${scale},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', files.mp4]);
  ff([...input, '-vf', `${scale},format=yuv420p`, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1',
    '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', files.webm]);
  const pi = Math.max(0, Math.min(total - 1, Math.round((posterAt < 0 ? total / FPS + posterAt : posterAt) * FPS)));
  const posterFrame = join(seqDir, `${String(pi).padStart(5, '0')}.jpg`);
  await sharp(posterFrame).resize({ width, kernel: 'lanczos3' }).webp({ quality: 82 }).toFile(files.poster);
  ff([...input, '-vf', `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
    '-loop', '0', files.gif]);
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
