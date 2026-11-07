// A clip's length in seconds, read at build time from its MP4's movie header (the `mvhd` box: a timescale and a
// duration in its ticks), so a re-recorded take never leaves a stale number behind. Undefined when the clip isn't
// recorded yet.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function clipSeconds(name: string): number | undefined {
  const file = join(process.cwd(), 'public', 'clips', `${name}.mp4`);
  if (!existsSync(file)) return undefined;
  const buf = readFileSync(file);
  const at = buf.indexOf('mvhd');
  if (at < 0) return undefined;
  const v1 = buf[at + 4] === 1;
  const scale = buf.readUInt32BE(at + (v1 ? 24 : 16));
  const ticks = v1 ? Number(buf.readBigUInt64BE(at + 28)) : buf.readUInt32BE(at + 20);
  return scale ? ticks / scale : undefined;
}
