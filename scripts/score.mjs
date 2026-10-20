#!/usr/bin/env node
// Render a film's code score (a score.html that exposes window.renderScore()) to a WAV.
//   node score.mjs <score.html> <out.wav>
// renderScore() returns { b64, peak, secs } (a 16-bit WAV as base64), as in assets/engine/score.html.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node score.mjs <score.html> <out.wav>'); process.exit(2); }
async function loadPuppeteer() {
  for (const t of [process.env.PUPPETEER, 'puppeteer-core', 'puppeteer'].filter(Boolean)) {
    try { return (await import(t.startsWith('/') ? pathToFileURL(t).href : t)).default; } catch {}
    try { return createRequire(path.join(process.cwd(), 'x.js'))(t); } catch {}
  }
  console.error('puppeteer-core not found (set PUPPETEER=/path/to/puppeteer-core)'); process.exit(2);
}
const exe = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => fs.existsSync(p));
const puppeteer = await loadPuppeteer();
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(pathToFileURL(path.resolve(src)).href, { waitUntil: 'load' });
const t0 = Date.now();
const r = await page.evaluate(() => window.renderScore());
fs.writeFileSync(path.resolve(out), Buffer.from(r.b64, 'base64'));
console.log('wrote', out, r.secs.toFixed(2) + ' s, peak', r.peak.toFixed(3), ((Date.now() - t0) / 1000).toFixed(1) + 's');
await browser.close();
