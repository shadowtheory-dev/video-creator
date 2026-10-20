#!/usr/bin/env bash
# Scaffold a new film folder from the engine template.
#   new-film.sh <dir> [title]
# Writes index.html, film.js, cues.js, score.html, and BRIEF.md / TREATMENT.md / CHANGES.md / README.md to fill in.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$1"; TITLE="${2:-Untitled film}"
if [ -e "$DIR/index.html" ]; then echo "$DIR already has a film; pick a new folder" >&2; exit 1; fi
mkdir -p "$DIR"
cp "$HERE/assets/engine/"{index.html,film.js,cues.js,score.html} "$DIR/"
sed -i '' "s#<title>Film</title>#<title>$TITLE</title>#" "$DIR/index.html" 2>/dev/null || sed -i "s#<title>Film</title>#<title>$TITLE</title>#" "$DIR/index.html"
cat > "$DIR/BRIEF.md" <<EOF
# $TITLE: brief

The requirements log. Every round of the user's notes goes here as requirements, in their words where it matters, newest last.

- **Spec:** <W>x<H>, <fps>, <length>, <BPM>, <format: launch / feature / supercut / loop / cut of …>
- **Message:** one sentence the film says.
- **Audience and stage:**
- **Brand profile:** <path to the project's VIDEO-BRAND.md>
- **References:** <breakdowns, libraries, moodboards>
EOF
cat > "$DIR/TREATMENT.md" <<EOF
# $TITLE

## The idea

## The caption (every line, its beats, placement and move)

| Section | Beats | Line | Placement and move |
|---|---|---|---|

## The shots

## The sound

## Files
EOF
cat > "$DIR/CHANGES.md" <<EOF
# $TITLE: change list

Each review round: the notes, the changes, the cue sheet after them. Current positions only; no process log.
EOF
cat > "$DIR/README.md" <<EOF
# $TITLE

- Play: open index.html (scrub, chapters, arrow keys step a frame; ?t=12 opens at 12 s).
- Score: node <skill>/scripts/score.mjs score.html score-raw.wav, then <skill>/scripts/master.sh score-raw.wav score.wav
- Stills: node <skill>/scripts/render.mjs . 1920x1080 --stills 0,4,8
- Draft: FPS=30 SUB=1 CRF=23 PRESET=veryfast WAV=score.wav node <skill>/scripts/render.mjs . 1920x1080 <out.mp4>, then finish.sh <out> discord
- Final: <skill>/scripts/render-parallel.sh . 1920x1080 <out.mp4> 2 score.wav, then check.py and finish.sh <out> all
EOF
echo "new film in $DIR: edit cues.js first (BPM, length, sections), then film.js and score.html"
