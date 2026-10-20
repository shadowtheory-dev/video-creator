#!/usr/bin/env bash
# Contact sheet from a video: frames at given times (or every STEP seconds), tiled with timecodes.
#   sheet.sh <video> <out.jpg> [t1,t2,...]      default: every STEP (1) seconds
# env: STEP (1), COLS (6), CELL (320 px wide)
set -euo pipefail
V="$1"; OUT="$2"; TIMES="${3:-}"
COLS="${COLS:-6}"; CELL="${CELL:-320}"
if [ -z "$TIMES" ]; then
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
  TIMES=$(python3 -c "import math;s=float('${STEP:-1}');d=float('$DUR');print(','.join(f'{i*s:.2f}' for i in range(int(d//s)+1) if i*s<d-0.02))")
fi
TMP="$(mktemp -d)"; i=0
IFS=',' read -ra TS <<< "$TIMES"
for t in "${TS[@]}"; do
  ffmpeg -v error -y -ss "$t" -i "$V" -frames:v 1 -vf "scale=$CELL:-2,drawtext=text='$t s':x=8:y=8:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=4" "$TMP/$(printf %04d $i).png" 2>/dev/null \
    || ffmpeg -v error -y -ss "$t" -i "$V" -frames:v 1 -vf "scale=$CELL:-2" "$TMP/$(printf %04d $i).png"
  i=$((i+1))
done
ROWS=$(( (i + COLS - 1) / COLS ))
ffmpeg -v error -y -pattern_type glob -i "$TMP/*.png" -vf "tile=${COLS}x${ROWS}:padding=4:color=white" -frames:v 1 "$OUT"
echo "wrote $OUT ($i frames)"
