/* ---------- the film: one deterministic render(t) ----------
   Every frame is a pure function of t (seconds), so the player, the stills and the MP4 agree. Never use Date, rAF time,
   CSS transitions or Math.random in render: use cues, easings and the seeded rng below.
   The capture contract (render.mjs): window.__ready = true once built; window.__seek(t) resolves when frame t is drawn
   (await image decodes); window.FILM.DUR. Add layers as DOM (type, UI) or canvas (backgrounds, light, grain). */
(function () {
'use strict';
const C = window.CUES, b = C.b, DUR = C.DUR, W = C.W, H = C.H;
const $ = s => document.querySelector(s);

/* time and easing */
const cl = (v, a = 0, c = 1) => v < a ? a : v > c ? c : v;
const lp = (a, c, k) => a + (c - a) * k;
const seg = (t, a, c) => cl((t - a) / (c - a));
const sb = (t, a, c) => seg(t, b(a), b(c));                 /* a segment in beats */
const OUT = t => 1 - Math.pow(1 - cl(t), 3), IN = t => Math.pow(cl(t), 3);
const EXPO = t => { t = cl(t); return t >= 1 ? 1 : (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10)); };
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

let pending = [];
const setImg = (img, src) => { if (img.getAttribute('src') !== src) { img.setAttribute('src', src); pending.push(img.decode().catch(() => {})); } };

/* ---------- layers ---------- */
let bg, bx, pill, big = {};
function build() {
  bg = $('#bg'); bg.width = W; bg.height = H; bx = bg.getContext('2d');
  pill = $('#pill');
  const ty = $('#type');
  big.idea = Object.assign(document.createElement('p'), { className: 'big', textContent: 'One idea.' }); ty.appendChild(big.idea);
}
const LINES = { hook: 'The first line, typed.', idea: 'The second line.' };

/* type a line into the pill, a key every 1/30 s from t0 */
function typed(t, t0, s, head = 0) { const n = Math.max(0, Math.floor((t - t0) * 30) + head); return s.slice(0, n) + (n < s.length || Math.floor(t * 2) % 2 ? '|' : ''); }

/* the brand's colours come from the page's CSS tokens */
let TONES = null;
const hex = (v) => { const h = getComputedStyle(document.documentElement).getPropertyValue(v).trim().replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };

function render(t) {
  pending = [];
  /* background: a slow gradient that changes on the bar */
  const k = sb(t, C.proof.at, C.end.at);
  TONES = TONES || ['--ink', '--accent'].map(hex);
  bx.fillStyle = `rgb(${[0, 1, 2].map(i => Math.round(lp(TONES[0][i], TONES[1][i], k))).join(',')})`; bx.fillRect(0, 0, W, H);
  /* the narrator: one line at a time */
  const line = t < b(C.idea.at) ? typed(t, b(C.hook.line), LINES.hook, 9) :   /* frame 0 already reads */ typed(t, b(C.idea.line), LINES.idea);
  pill.textContent = line;
  pill.style.opacity = t < b(C.proof.at) ? '1' : String(1 - OUT(sb(t, C.proof.at, C.proof.at + .5)));
  /* a big word that smear-snaps in on its beat */
  const p = sb(t, C.proof.at - .25, C.proof.at + .35), e = EXPO(p);
  big.idea.style.transform = `translate3d(${lp(-700, 110, e).toFixed(1)}px,380px,0)`;
  big.idea.style.filter = p > 0 && p < 1 ? `blur(${((1 - e) * 12).toFixed(1)}px)` : '';
  big.idea.style.opacity = String(cl(p * 4) * (1 - sb(t, C.end.at - .5, C.end.at)));
  return Promise.all(pending);
}

/* ---------- player ---------- */
let TT = 0, playing = false, start = 0;
function fit() {
  const f = $('#frame'), cap = document.documentElement.classList.contains('capture');
  /* in capture the frame fills the render size (a smaller size makes a scaled-down draft) */
  const s = cap ? Math.min(innerWidth / W, innerHeight / H) : Math.min((innerWidth - 32) / W, (innerHeight - 150) / H, 1);
  f.style.width = W * s + 'px'; f.style.height = H * s + 'px';
  Object.assign($('#stage').style, { width: W + 'px', height: H + 'px', transform: `scale(${s})` });
}
function sync() {
  $('#scrub').value = TT; $('#tc').textContent = `${TT.toFixed(2)} / ${DUR.toFixed(2)}`;
  const c = C.chapters.reduce((a, x, i) => TT >= b(x[1]) ? i : a, 0);
  [...$('#chap').children].forEach((bt, i) => bt.setAttribute('aria-current', String(i === c)));
}
function loop(now) {
  if (!playing) return;
  const au = $('#score');
  TT = $('#snd').checked && au.readyState >= 2 && !au.paused ? au.currentTime : (now - start) / 1000;
  if (TT >= DUR) { TT = DUR - 1e-4; play(false); }
  render(TT); sync(); if (playing) requestAnimationFrame(loop);
}
function play(on) {
  const au = $('#score'); playing = on; $('#play').textContent = on ? 'Pause' : 'Play';
  if (on) { if (TT >= DUR - .01) TT = 0; start = performance.now() - TT * 1000; if ($('#snd').checked) { au.currentTime = TT; au.play().catch(() => {}); } requestAnimationFrame(loop); }
  else au.pause();
}
function seek(t) { TT = cl(t, 0, DUR - 1e-4); if (playing) play(false); render(TT); sync(); }
async function init() {
  await document.fonts.ready;
  build();
  $('#scrub').max = DUR;
  C.chapters.forEach(([n, at]) => { const bt = document.createElement('button'); bt.type = 'button'; bt.textContent = n; bt.onclick = () => seek(b(at)); $('#chap').appendChild(bt); });
  $('#play').onclick = () => play(!playing);
  $('#scrub').oninput = e => seek(+e.target.value);
  addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); play(!playing); }
    if (e.key === 'ArrowRight') seek(TT + (e.shiftKey ? 1 : 1 / 60));
    if (e.key === 'ArrowLeft') seek(TT - (e.shiftKey ? 1 : 1 / 60));
  });
  addEventListener('resize', fit); fit();
  const q = new URLSearchParams(location.search); TT = q.has('t') ? +q.get('t') : 0;
  await render(TT); sync();
  window.__seek = async tt => { await render(tt); };
  window.__ready = true;
}
window.FILM = { render, seek, DUR, W, H };
init();
})();
