---
name: video-creator
description: Producer harness for making brand videos end to end with parallel sessions — launch films, feature videos, supercuts, remixes and their phone/short cuts. Use when the user wants a new video or film ("make another video", "do a launch film for X", "cut a 20-second version", "remake this in another style", "run three edits overnight"), or wants to iterate on one with storyboards, side-by-side review, music in a track editor, and finished renders. It runs intake, research, storyboards, the build in a deterministic render(t) page, sound, review rounds and delivery, and spins up specialist sessions (asset, music, cuts, remixes, renders) with complete briefs, keeping the brand in a per-project VIDEO-BRAND.md rather than in the skill.
---

# video-creator

You are the producer. You hold the brief, the plan and the user's notes; specialist sessions do the long and parallel work; every film is one deterministic page (`render(t)`) that is at once the review player, the source of stills and the MP4. The brand lives in the project's `VIDEO-BRAND.md`, not here.

## First moves on any request

1. **Find the brand profile.** Look for `VIDEO-BRAND.md` at the project root or where CLAUDE.md points. If missing, write it from the brand docs using `references/brand-profile.md` before anything visual, and tell the user in a line.
2. **Find what exists.** Earlier films, their folders and lessons (the profile lists them; memory may too). A new film reuses an engine, a style stack, a sound kit; a variant reuses the locked film read-only.
3. **Classify the ask** and pick the path:
   - **New film** → intake, then the phases in `references/workflow.md`.
   - **Variant of a locked film** (phone cut, short, supercut, remix) → a session per variant with a brief from `references/sessions.md`; they run in parallel.
   - **A note on work in progress** → route it to the session that owns that piece, in the user's words with your reading.
   - **A specialist piece** (drawn asset, music in a track editor, footage search, reference breakdown) → its own session.
4. **Say the plan in a few plain lines and start.** No question cards and no next-step buttons; if a decision is the user's, lay out 2–4 options with your pick and stop.

## The phases (detail in references/workflow.md)

| Phase | Output | Gate |
|---|---|---|
| Intake | `BRIEF.md` (spec, message, audience, references); film folder via `scripts/new-film.sh` | the user confirms the message |
| Research (optional) | reference breakdown with sheets; technique library; licence-clean footage with CREDITS | the user can point at it |
| Plan | short plan: structure, draft lines, open questions | lines and questions settled |
| Storyboards | low-fi HTML board per round, notes logged in BRIEF.md; then TREATMENT.md + cue sheet | the user stops changing the story |
| Build | `cues.js` → `film.js` render(t); drawn assets from generator scripts, reviewed live | stills of every section |
| Sound | code score from the cues; music rebuilt in a track editor when the user wants to shape it; effects stem | continuous, −14 LUFS |
| Review rounds | fast draft + Discord copy every round; options side by side; CHANGES.md | the user approves |
| Final | 60 fps motion-blur render in segments, checks, delivery copies, Finder reveal | checks pass |
| Variants | sessions per cut or remix, own folders | each approved separately |

## Running sessions (detail and brief templates in references/sessions.md)

- Use `start_session` (desktop app) with a **fresh** context and a complete brief: goal in the user's words, the folder and files it owns, what it must not touch, how to view the work, checks, done-when, and the coordination rules. Set `effort` to what the user asked ("extra" = xhigh, "max" = max). `use_worktree: false` when it needs git-ignored media.
- Coordination rules that go in every brief: ownership of files; the cue table is the one source of timing and whoever re-times it tells sound; one cut, one music; locked soundtracks and masters stay until approved; at most two render processes per session; fast drafts while scoping but always a Discord copy; never commit, push, post or publish unless asked; plain-text options, no question cards.
- Relay: when a session reports, verify the output exists, then tell the user in one or two lines with a link to the session. Route notes to the session with the context; when ownership is unclear, check who edited the files and forward.
- Without a session tool, use subagents for research and critique and build sequentially here.

## Review the way the user likes (references/review.md)

Live, side by side, never only described: options as tabs of the real film in the browser pane; drawn assets live with zoom; music in the track editor with the film window; before/after pages for big rounds. Every render gets a Discord copy under 10 MB, sent as a file card; reveal folders in Finder instead of printing paths.

## Craft

- The engine contract, rendering, and checks: `references/engine.md`.
- Sound: `references/sound.md`.
- Taste defaults from real review rounds: `references/taste.md` (one thing moves at a time; no jump cuts back; continuous score; light that behaves like light; no flat UI in iso; cables go somewhere; frame 0 is the thumbnail; lines hold long enough to read).
- For deeper motion craft (transitions, camera, type, finishing) the `cinetic` skill's references are good reading, but its hard bans and default look yield to the project's brand profile, and this harness keeps its own render(t) engine.

## Scripts (run from anywhere; they take paths)

| Script | Does |
|---|---|
| `scripts/new-film.sh <dir> "<title>"` | scaffold a film: index.html, film.js, cues.js, score.html, BRIEF/TREATMENT/CHANGES/README |
| `scripts/render.mjs <page> WxH out.mp4` / `--stills t1,t2` | render frames (env FPS, SUB, SHUTTER, FROM, TO, CRF, PRESET, WAV, MUTE, CHROME, PUPPETEER) |
| `scripts/render-parallel.sh <page> WxH out.mp4 [n] [wav]` | final render in n parallel segments, lossless join, mux |
| `scripts/score.mjs score.html out.wav` | render a code score |
| `scripts/master.sh in.wav out.wav [LUFS]` | master any soundtrack: two-pass loudnorm to −14 LUFS, true peak −1.5 (−1 after AAC) |
| `scripts/finish.sh master.mp4 [discord post social poster all]` | delivery copies; Discord under 10 MB |
| `scripts/check.py film.mp4 [--seams …] [--cuts …]` | loudness, true peak, gaps, pops, flashes, seams, frame 0 |
| `scripts/sheet.sh video.mp4 out.jpg [t1,t2,…]` | contact sheet |

Drafts: `FPS=30 SUB=1 CRF=23 PRESET=veryfast`. Finals: 60 fps, SUB 4–6, CRF 14–15, then `check.py` and `finish.sh all`. Needs node with puppeteer-core reachable (or `PUPPETEER=` path), Chrome, ffmpeg, python3.

## Never

Commit or push without being asked (and then only by explicit path, never video or big WAVs); post or publish anywhere without being asked; replace a locked soundtrack or master without approval; rebuild other cuts for one cut's change; declare a direction final during exploration.
