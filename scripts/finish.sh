#!/usr/bin/env bash
# Make the delivery copies from a master MP4.
#   finish.sh <master.mp4> [what...]     what: discord (default), post, social, poster, all
#   discord  <name>-discord.mp4, two-pass H.264 aimed at 9.5 MB (always made: every render gets one)
#   post     <name>-post.mp4, CRF 21 at full size
#   social   <name>-social.mp4, LinkedIn / X: High 4.2, max 14 Mb/s, AAC-LC 192k
#   poster   <name>-poster.jpg, frame 0 unless POSTER_T=<seconds>
# env: DISCORD_MB (9.5) target size; DISCORD_H force a height (else 1080 if it fits, else 720)
set -euo pipefail
M="$1"; shift || true
WHAT="${*:-discord}"; [ "$WHAT" = all ] && WHAT="discord post social poster"
BASE="${M%.mp4}"; BASE="${BASE%-1920x1080}"; DIR="$(dirname "$M")"; NAME="$(basename "$BASE")"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$M")
for w in $WHAT; do case "$w" in
  discord)
    TARGET=$(python3 -c "print(${DISCORD_MB:-9.5}*8*1024*1024)"); ABR=128000
    VBR=$(python3 -c "print(int(($TARGET/$DUR - $ABR)*0.97))")
    SRC_H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$M")
    if [ -n "${DISCORD_H:-}" ]; then HH=$DISCORD_H; elif [ "$VBR" -gt 3500000 ]; then HH=$SRC_H; else HH=720; fi
    [ "$HH" -gt "$SRC_H" ] && HH=$SRC_H
    OUT="$DIR/$NAME-discord.mp4"; LOG="$(mktemp -d)/x"
    ffmpeg -v error -y -i "$M" -vf "scale=-2:$HH:flags=lanczos,fps=30" -c:v libx264 -preset slow -b:v "$VBR" -pass 1 -passlogfile "$LOG" -an -f mp4 /dev/null
    ffmpeg -v error -y -i "$M" -vf "scale=-2:$HH:flags=lanczos,fps=30" -c:v libx264 -preset slow -b:v "$VBR" -pass 2 -passlogfile "$LOG" -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT"
    SZ=$(stat -f%z "$OUT" 2>/dev/null || stat -c%s "$OUT")
    echo "discord $OUT  $((SZ/1000)) kB  ${HH}p30  $( [ "$SZ" -lt 10000000 ] && echo 'under 10 MB' || echo 'OVER 10 MB: rerun with DISCORD_MB=8.5' )";;
  post)
    ffmpeg -v error -y -i "$M" -c:v libx264 -preset slow -crf 21 -profile:v high -pix_fmt yuv420p -c:a copy -movflags +faststart "$DIR/$NAME-post.mp4"; echo "post $DIR/$NAME-post.mp4";;
  social)
    ffmpeg -v error -y -i "$M" -c:v libx264 -preset slow -crf 18 -maxrate 14M -bufsize 28M -profile:v high -level 4.2 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$DIR/$NAME-social.mp4"; echo "social $DIR/$NAME-social.mp4";;
  poster)
    ffmpeg -v error -y -ss "${POSTER_T:-0}" -i "$M" -frames:v 1 -q:v 2 "$DIR/$NAME-poster.jpg"; echo "poster $DIR/$NAME-poster.jpg";;
  *) echo "unknown: $w" >&2;;
esac; done
