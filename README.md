# video-creator

A Claude Code skill for producing brand videos end to end: launch films, feature videos, supercuts, remixes and their phone and short cuts. Claude acts as the producer. It writes the brief, storyboards, builds each film as a deterministic `render(t)` web page, scores it, runs review rounds and renders finals, and hands long or parallel work to specialist sessions.

The skill holds no brand. Each project keeps a `VIDEO-BRAND.md` (palette, type, drawing language, voice, sound, assets, where things go), and the skill reads it first. `references/brand-profile.md` is the template.

## Install

```bash
git clone https://github.com/shadowtheory-dev/video-creator ~/.claude/skills/video-creator
```

## Needs

- Node with `puppeteer-core` (in the project, or point `PUPPETEER=` at it)
- Google Chrome or Chromium (or set `CHROME=`)
- ffmpeg and python3

## Contents

- `SKILL.md`: the producer role, phases, sessions, review and the never-list
- `references/`: workflow, sessions (with brief templates), engine, sound, review, taste, brand profile
- `scripts/`: new-film, render, render-parallel, score, master, finish, check, sheet
- `assets/engine/`: the film template (`index.html`, `film.js`, `cues.js`, `score.html`)

## Quick start

```bash
scripts/new-film.sh films/launch "Launch film"
node scripts/render.mjs films/launch 1920x1080 --stills 0,4,8
FPS=30 SUB=1 CRF=23 PRESET=veryfast node scripts/render.mjs films/launch 1920x1080 draft.mp4
scripts/finish.sh draft.mp4 discord
```
