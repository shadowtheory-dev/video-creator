#!/usr/bin/env bash
# Render a film in N parallel segments (picture only), join them losslessly, then mux the soundtrack.
#   render-parallel.sh <page dir|.html> <W>x<H> <out.mp4> [segments=2] [soundtrack.wav]
# env passes through to render.mjs (FPS, SUB, CRF, PRESET, CHROME, PUPPETEER). Keep segments at 2 when other
# sessions are rendering on the same machine; 3 is the most worth running on an 8-core laptop.
# Segment edges land on whole frames, so the joins are invisible (check.py reports the seams).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PAGE="$1"; SIZE="$2"; OUT="$3"; N="${4:-2}"; WAV="${5:-}"
FPS="${FPS:-60}"
DUR=$(node -e "
  const p=require('path'),fs=require('fs');const page=p.resolve(process.argv[1]);
  const dir=page.endsWith('.html')?p.dirname(page):page;
  for (const f of ['cues.js','cues-short.js']) { const c=p.join(dir,f); if (fs.existsSync(c)) { try { const C=require(c); if (C.DUR) { console.log(C.DUR); process.exit(0); } } catch {} } }
  console.log('')" "$PAGE")
if [ -z "$DUR" ]; then echo "Set DUR=<seconds> (no cues.js with DUR found next to the page)" >&2; DUR="${DUR_OVERRIDE:?}"; fi
DUR="${DUR_OVERRIDE:-$DUR}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/render-parts.XXXX")"
FRAMES=$(python3 -c "print(round($DUR*$FPS))")
echo "duration ${DUR}s, ${FRAMES} frames at ${FPS} fps, ${N} segments, parts in $WORK"
pids=()
for i in $(seq 0 $((N-1))); do
  a=$(python3 -c "print(round($FRAMES*$i/$N)/$FPS)"); b=$(python3 -c "print(round($FRAMES*($i+1)/$N)/$FPS)")
  FROM=$a TO=$b MUTE=1 node "$HERE/render.mjs" "$PAGE" "$SIZE" "$WORK/part$i.mp4" > "$WORK/part$i.log" 2>&1 &
  pids+=($!)
done
fail=0; for p in "${pids[@]}"; do wait "$p" || fail=1; done
if [ "$fail" = 1 ]; then echo "a segment failed; logs in $WORK" >&2; tail -5 "$WORK"/part*.log >&2; exit 1; fi
for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'"; done > "$WORK/list.txt"
( cd "$WORK" && ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy joined.mp4 )
mkdir -p "$(dirname "$OUT")"
if [ -n "$WAV" ]; then
  ffmpeg -v error -y -i "$WORK/joined.mp4" -i "$WAV" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
else
  ffmpeg -v error -y -i "$WORK/joined.mp4" -c copy -movflags +faststart "$OUT"
fi
echo "wrote $OUT"
