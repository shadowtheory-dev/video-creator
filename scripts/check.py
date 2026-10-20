#!/usr/bin/env python3
"""Measure a rendered film before anyone calls it done.
usage: python3 check.py film.mp4 [--seams 7.333,22.5] [--cuts 1.33,2.67] [--fps 60]
Reports: duration and frame count; integrated loudness, LRA and true peak (ffmpeg ebur128); pops (single-frame
jumps much larger than their neighbours, outside the --cuts you meant); flashes (big luminance jumps, most in any
one second: keep it at 3 or fewer); segment seams (frame differences at the joins, should look like their neighbours);
gaps (any 0.4 s of near-silence in the audio)."""
import subprocess, sys, json, re, math, struct

def arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name); return sys.argv[i + 1]
    return default

src = sys.argv[1]
cuts = [float(x) for x in arg('--cuts', '').split(',') if x]
seams = [float(x) for x in arg('--seams', '').split(',') if x]
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', src], capture_output=True, text=True).stdout)
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
has_audio = any(s['codec_type'] == 'audio' for s in probe['streams'])
fps = float(arg('--fps', 0)) or eval(v['r_frame_rate'])
dur = float(probe['format']['duration'])
print(f"{src}\n  {v['width']}x{v['height']} @ {fps:g} fps, {dur:.3f} s, about {round(dur*fps)} frames, {int(probe['format']['size'])/1e6:.1f} MB")

if has_audio:
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', out); L = re.findall(r'LRA:\s+([\d.]+) LU', out); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', out)
    i, lra, tp = (float(I[-1]) if I else None), (float(L[-1]) if L else None), (float(P[-1]) if P else None)
    ok = i is not None and -15 <= i <= -13 and tp is not None and tp <= -1
    print(f"  loudness {i} LUFS, LRA {lra} LU, true peak {tp} dBTP  {'ok' if ok else 'CHECK: aim -14 LUFS, true peak <= -1'}")
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout
    n = len(raw) // 2; s = struct.unpack('<%dh' % n, raw); w = 400; quiet = 0; gaps = []
    for k in range(0, n - w, w):
        seg = s[k:k + w]; r = math.sqrt(sum(x * x for x in seg) / w) / 32768
        db = 20 * math.log10(r + 1e-9)
        quiet = quiet + 1 if db < -45 else 0
        if quiet == 8 and k / 8000 < dur - 1.5: gaps.append(round(k / 8000 - 0.35, 2))
    print(f"  audio gaps (0.4 s under -45 dB, before the last 1.5 s): {gaps or 'none'}")
else:
    print("  no audio stream")

W, H = 160, 90
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
N = len(raw) // (W * H); fr = [raw[k * W * H:(k + 1) * W * H] for k in range(N)]
diff = [0] + [sum(abs(fr[k - 1][j] - fr[k][j]) for j in range(0, W * H, 3)) / (W * H / 3) for k in range(1, N)]
mean = [sum(f) / len(f) for f in fr]
pops = []
for k in range(1, N):
    t = k / fps
    ctx = sorted(diff[max(1, k - 4):k] + diff[k + 1:k + 5]); med = ctx[len(ctx) // 2] if ctx else 0
    if diff[k] > 6 and diff[k] > 3 * med + 2 and not any(abs(t - c) < 0.1 for c in cuts):
        pops.append((round(t, 3), round(diff[k], 1)))
print(f"  pops (one-frame jumps not in --cuts): {pops or 'none'}")
jumps = [k / fps for k in range(1, N) if abs(mean[k] - mean[k - 1]) > 25.5]
worst = max((sum(1 for j in jumps if s0 <= j < s0 + 1) for s0 in [k / fps for k in range(N)]), default=0)
print(f"  flashes: {len(jumps)} big luminance jumps, most in one second {worst} {'ok' if worst <= 3 else 'CHECK: 3 a second at most'}")
for sm in seams:
    k = round(sm * fps)
    if 2 <= k < N - 2: print(f"  seam {sm}s: frame diffs {[round(diff[j], 1) for j in range(k - 2, k + 3)]}")
print(f"  frame 0 mean luminance {mean[0]:.0f} (a black or empty first frame makes a bad thumbnail)")
