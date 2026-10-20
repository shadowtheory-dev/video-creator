# The engine: one render(t) per film

A film is a web page whose every frame is a pure function of time. The same page is the player for review, the source of stills, and the MP4 (headless Chrome, frame by frame). Scaffold one with `scripts/new-film.sh <dir> "<title>"`.

## Files

- `cues.js`: BPM, BEAT, b(n) (beats → seconds), W/H, DUR, every section and moment in beats, chapters. Shared by film and score. Comments say what happens at each cue.
- `film.js`: `render(t)` plus the player. Exposes `window.FILM = { render, seek, DUR, W, H }`, `window.__seek(t)` (async, resolves when frame t is drawn, including image and video-frame decodes) and `window.__ready = true` when everything is built (fonts loaded, assets rasterised).
- `index.html`: the stage at W×H with layers in a fixed order, the player UI (Play, scrub, time, chapters, Sound toggle playing `score.wav`), and `#capture` mode (no UI, stage at 1:1).
- `score.html`: the code score with `window.renderScore()`.
- Generated assets (e.g. `machine.mjs` → `machine.js`) and per-film data (`grid.js` listing grid cells and clips).

## Rules for render(t)

- Deterministic: no Date, rAF time, CSS transitions/animations, unseeded randomness or video `.play()`. Video in a film is extracted frames (`media/<clip>/001.jpg…` at 30 fps) set per frame and awaited; ping-pong loops for cells that hold longer than the clip.
- Everything from cues: `sb(t, a, c)` segments in beats; easing curves named and few (a snap ease-out, a swift in-out, a glide, expo ease-out for things that enter already moving).
- One thing moves at a time: type animates while the picture holds; once it lands the picture can move under it.
- Layers: canvas for grounds, light, pools, grain; SVG for drawn objects (transform the whole SVG by a camera matrix); DOM for type and UI (transform with matrices so UI can sit in a 3D plane, e.g. a screen); a second canvas for crossfading between two states of an expensive surface rather than cutting.
- Motion smear for fast type: an SVG feGaussianBlur filter per element with x/y deviation set from velocity.
- Crisp rendering at any zoom: lay out DOM at final size (don't scale a container up), keep strokes `vector-effect: non-scaling-stroke`.
- The first frame is the thumbnail: design frame 0 (the brand, a strong still), and make the hook's first line legible at t = 0.

## Rendering

- `render.mjs <page> WxH out.mp4` with env FPS, SUB (sub-frames for motion blur, blended with tmix), SHUTTER, FROM/TO, CRF, PRESET, WAV, MUTE. `--stills t1,t2` for review stills into `shots/`.
- Draft while scoping: `FPS=30 SUB=1 CRF=23 PRESET=veryfast`. Final: 60 fps, SUB 4–6 (6 for fast punches and zooms), CRF 14–15.
- Long renders: `render-parallel.sh` splits on whole frames, renders picture-only segments in parallel, joins with the concat demuxer (no re-encode, invisible seams) and muxes the soundtrack with `-shortest`. A full 40 s film at 60 fps SUB 6 is about 25–40 minutes with 2–3 segments on a laptop.
- If a render crashes mid-way (Target closed), re-render only the missing segment range and splice.
- Other frame sizes: the same page can read W/H from its cues or a `?size=` query; a phone cut usually deserves its own page with re-laid-out shots rather than a crop.

## Checks before calling anything done

`check.py out.mp4 --seams <segment edges> --cuts <intended hard cuts>`: duration and frames, −14 LUFS and true peak ≤ −1 dBTP, no audio gaps, no pops, at most 3 flashes a second, seams like their neighbours, frame 0 not black. Then a contact sheet (`sheet.sh`) and look at it.
