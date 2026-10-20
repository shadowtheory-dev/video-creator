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

## Works well with

These companions were used alongside the harness on the films it was built from. Each is optional; `references/companions.md` says what each adds and when the skill reaches for it.

| Companion | For | Install |
|---|---|---|
| [cinetic](https://github.com/Leonxlnx/cinetic) | Motion craft: transitions, camera, kinetic type, finishing | `npx skills add Leonxlnx/cinetic` |
| [anatomy](https://github.com/wheresryan22/anatomy) | Isometric drawn objects (machines, devices) as SVG | `npx skills add wheresryan22/anatomy -g` |
| [earshot](https://github.com/Leonxlnx/earshot) | Sound effects: render kits, listen to and review audio | `git clone https://github.com/Leonxlnx/earshot`, then its README |
| [animate](https://github.com/cth9191/animate) | Short procedural canvas spots in a set style | `/plugin marketplace add cth9191/animate`, then `/plugin install animate@animate` |
| [marketingskills](https://github.com/coreyhaines31/marketingskills) | Copywriting for on-screen lines | `npx skills add coreyhaines31/marketingskills` |

References and footage: [Prompt Motion](https://prompt-motion.com) (motion pieces with their prompts), [Wikimedia Commons](https://commons.wikimedia.org) (PD, CC0 and CC BY archive clips), and [Pexels](https://www.pexels.com/videos/) and [Pixabay](https://pixabay.com/videos/) (stock, no credit needed). Music needs a track editor (any DAW works) and a sample library you have the rights to.

## Contents

- `SKILL.md`: the producer role, phases, sessions, review and the never-list
- `references/`: workflow, sessions (with brief templates), engine, sound, review, taste, brand profile, companions
- `scripts/`: new-film, render, render-parallel, score, master, finish, check, sheet
- `assets/engine/`: the film template (`index.html`, `film.js`, `cues.js`, `score.html`)

## Quick start

```bash
scripts/new-film.sh films/launch "Launch film"
node scripts/render.mjs films/launch 1920x1080 --stills 0,4,8
FPS=30 SUB=1 CRF=23 PRESET=veryfast node scripts/render.mjs films/launch 1920x1080 draft.mp4
scripts/finish.sh draft.mp4 discord
```
