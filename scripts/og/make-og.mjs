// Renders scripts/og/og.html to public/og.png (1200 × 630) with headless Chrome.
// Chrome is found at CHROME_PATH, or the usual install paths on macOS and Linux.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(here, '../..');
const out = join(root, 'public/og.png');

const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.');
  process.exit(1);
}

const mtime = () => (existsSync(out) ? statSync(out).mtimeMs : 0);
const before = mtime();
const profile = mkdtempSync(join(tmpdir(), 'bd-og-'));
const proc = spawn(
  chrome,
  [
    '--headless=new',
    `--user-data-dir=${profile}`,
    '--allow-file-access-from-files',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=3000',
    `--screenshot=${out}`,
    pathToFileURL(join(here, 'og.html')).href,
  ],
  { stdio: 'ignore' },
);

// Headless Chrome sometimes stays up after writing the screenshot; stop it once the file is written.
const started = Date.now();
const timer = setInterval(() => {
  const written = mtime() > before;
  if (written || proc.exitCode !== null || Date.now() - started > 60_000) {
    clearInterval(timer);
    if (proc.exitCode === null) proc.kill();
    setTimeout(() => rmSync(profile, { recursive: true, force: true }), 500);
    if (!written) {
      console.error('Chrome did not write the screenshot.');
      process.exitCode = 1;
      return;
    }
    console.log(`Wrote ${out}`);
  }
}, 250);
