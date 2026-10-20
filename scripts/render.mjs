#!/usr/bin/env node
// Render any render(t) film page to MP4, or to stills.
//   node render.mjs <page dir or .html> <W>x<H> <out.mp4>          60 fps, motion blur from sub-frames, audio muxed if given
//   node render.mjs <page dir or .html> <W>x<H> --stills 0,2.5,9   PNG stills into <page dir>/shots/
// env:
//   FPS (60)  SUB sub-frames per frame (4; 1 = no motion blur)  SHUTTER fraction of a frame (.5)
//   FROM / TO seconds (a segment; frames are FROM*FPS .. TO*FPS)  CRF (15)  PRESET (slow)
//   WAV audio to mux (none by default)  MUTE=1 picture only  CHROME path to Chrome/Chromium
//   PUPPETEER path to a puppeteer-core module if it isn't resolvable from here
// The page contract (see references/engine.md): it loads with #capture in the URL, sets window.__ready = true when
// built, exposes window.FILM.DUR (seconds) and window.__seek(t) returning a promise that resolves once frame t is drawn.
// Draft while scoping: FPS=30 SUB=1 CRF=23 PRESET=veryfast. Final: the defaults.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const [pageArg, size, ...args] = process.argv.slice(2);
if (!pageArg || !/^\d+x\d+$/.test(size || '')) {
  console.error('usage: node render.mjs <page dir|.html> <W>x<H> (<out.mp4> | --stills t1,t2,...)'); process.exit(2);
}
const pagePath = path.resolve(pageArg.endsWith('.html') ? pageArg : path.join(pageArg, 'index.html'));
const dir = path.dirname(pagePath), [W, H] = size.split('x').map(Number);
const stillsAt = args[0] === '--stills' ? args[1].split(',').map(Number) : null;

async function loadPuppeteer() {
  const tries = [process.env.PUPPETEER, 'puppeteer-core', 'puppeteer'].filter(Boolean);
  for (const t of tries) {
    try { return (await import(t.startsWith('/') ? pathToFileURL(t).href : t)).default; } catch {}
    try { return createRequire(path.join(process.cwd(), 'x.js'))(t); } catch {}
  }
  console.error('puppeteer-core not found: npm i puppeteer-core in the project, or set PUPPETEER=/path/to/puppeteer-core'); process.exit(2);
}
const chromeCandidates = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
const executablePath = chromeCandidates.find(p => fs.existsSync(p));
if (!executablePath) { console.error('Chrome not found: set CHROME=/path/to/chrome'); process.exit(2); }

const puppeteer = await loadPuppeteer();
const browser = await puppeteer.launch({
  executablePath, headless: 'new',
  args: ['--hide-scrollbars', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files', '--force-color-profile=srgb',
    '--run-all-compositor-stages-before-draw', '--disable-checker-imaging', '--disable-threaded-animation', '--force-gpu-mem-available-mb=4096',
    '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[console]', m.text()); });
await page.goto(pathToFileURL(pagePath).href + '#capture', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 120000 });
const DUR = await page.evaluate(() => window.FILM.DUR);
const seek = (t) => page.evaluate((tt) => Promise.resolve(window.__seek(tt)).then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))), t);

if (stillsAt) {
  const out = path.join(dir, 'shots'); fs.mkdirSync(out, { recursive: true });
  for (const t of stillsAt) {
    await seek(t);
    const f = path.join(out, `t${t.toFixed(2).padStart(6, '0')}.png`);
    await page.screenshot({ path: f });
    console.log('still', f);
  }
  await browser.close(); process.exit(0);
}

const outFile = path.resolve(args[0] || path.join(dir, `render-${W}x${H}.mp4`));
const FPS = +(process.env.FPS || 60), SUB = +(process.env.SUB || 4), SHUTTER = +(process.env.SHUTTER || 0.5);
const FROM = +(process.env.FROM || 0), TO = Math.min(DUR, +(process.env.TO || DUR)), CRF = process.env.CRF || '15', PRESET = process.env.PRESET || 'slow';
const f0 = Math.round(FROM * FPS), f1 = Math.round(TO * FPS);
const wav = process.env.WAV ? path.resolve(process.env.WAV) : null, withAudio = wav && fs.existsSync(wav) && !process.env.MUTE;
const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB),` : '';
const ff = ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS * SUB), '-i', '-'];
if (withAudio) ff.push('-ss', String(FROM), '-t', String(TO - FROM), '-i', wav);
ff.push('-filter_complex', `[0:v]${vf}format=yuv420p[v]`, '-map', '[v]');
if (withAudio) ff.push('-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest');
ff.push('-r', String(FPS), '-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-profile:v', 'high',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', outFile);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const proc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => proc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  for (let k = 0; k < SUB; k++) {
    const t = Math.min(DUR - 1e-4, Math.max(0, (f + (SUB > 1 ? ((k + 0.5) / SUB - 0.5) * SHUTTER : 0)) / FPS));
    await seek(t);
    const png = await page.screenshot({ type: 'png', optimizeForSpeed: true });
    if (!proc.stdin.write(png)) await new Promise((r) => proc.stdin.once('drain', r));
  }
  if ((f - f0) % 60 === 59) { const el = (Date.now() - t0) / 1000, per = el / (f - f0 + 1); console.log(`frame ${f + 1}/${f1}  ${el.toFixed(0)}s, ~${(per * (f1 - f - 1)).toFixed(0)}s left`); }
}
proc.stdin.end(); await done; await browser.close();
console.log('wrote', outFile, ((Date.now() - t0) / 1000).toFixed(0) + 's');
