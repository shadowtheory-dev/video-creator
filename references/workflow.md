# The workflow, phase by phase

Each phase writes a file and ends at a gate: the user has seen the output and said go. Skip a phase only when the user does (a "just build it" skips storyboard rounds; a known format skips research). Phases 6 to 9 are where parallel sessions earn their keep.

## 0. Intake (the producer, in chat)

Get, in one plain-text message, only what you can't find yourself: the message (one sentence), the audience or funnel stage, length and format, the reference film if any, and where the work lives. Find the project's brand profile (`VIDEO-BRAND.md`, or the brand docs it names); if there is none, write one from the brand docs before anything visual (template in `brand-profile.md`). Create the film's folder and `BRIEF.md` (`scripts/new-film.sh`). From here on BRIEF.md is the requirements log: every round of notes goes in, in the user's words where it matters.

## 1. Research and references (optional, can run as a session)

- **Reference breakdown.** When the user points at a film they like, break it down so it can be pointed at later: a dated research folder with `breakdown.md` (sections with timings, shot list, edit grammar, pacing, sound, why it works, a reusable structure, a beat sheet for our film) and `sheets/` (contact strips per section, `scripts/sheet.sh`), plus a page version for reading. Commit it with pointers from the plan and the storyboard so other work can cite it.
- **Technique library.** Moves and sounds worth stealing, tagged (rolling captions, smear-snap, echo stacks, slat assembly, lens streaks, morph-don't-cut, continuous score, sounds placed by peak). Read prompts and write-ups rather than watching videos.
- **Footage and photos.** Licence-clean sources only (public domain, CC0, CC BY with a credit line; never SA, NC, ND or unknown). Clips where something visibly happens beat pans and still objects. Keep a CREDITS.md with every source, and convert webm/ogv to MP4 so Finder previews them.

## 2. Plan

A short plan doc (or page): the stage it serves, the message, the structure borrowed from the reference, the draft lines, open questions, what's out of scope. Settle the draft lines and open questions before building anything.

## 3. Storyboards (low-fi, fast, many rounds)

One HTML page per round (`storyboard.html`, keep `storyboard-v1.html`… for history), published or opened for review: panels per shot with picture notes, the caption as it will sit, the move, the sound, and a timing strip. Keep it low-fi and low-effort while the story moves: the point is the order of ideas, the copy and the transitions, not finish. Each round, log the notes in BRIEF.md and update the board in place. When the user stops changing the story, write TREATMENT.md (idea, caption table with beats and placement, shots, sound) and the cue sheet.

## 4. Build the film (one render(t))

- `cues.js` first: BPM, length, sections on bar lines, every moment in beats. It is the single source of truth for picture and sound.
- `film.js`: one deterministic render(t) (`engine.md`). Layers: photos/video, canvas for backgrounds and light, SVG for drawn objects, DOM for type and UI.
- Drawn assets (iso objects, a machine, a device) are built from code (an SVG generator script) and reviewed live in the browser pane at film scale and zoomed, never only from PNG crops (`review.md`).
- Check stills of every section (`render.mjs --stills`), then a fast draft of the whole film.

## 5. Sound

A code score (`score.html`) cut to the same cue table gives a continuous first pass. When the user wants to shape the music, rebuild it in a track editor where every element is a visible track and the film plays in sync beside it, keeping the picture's sounds as their own stem (`sound.md`). Master: about −14 LUFS, true peak at or under −1 dBTP, no gaps.

## 6. Review rounds

Every round: fast draft render plus a Discord copy (always), stills of what changed, and a plain-text list of what changed and what's open. When there are options, build them side by side (`review.md`): A/B tabs of the live film, cuts as tabs in the track editor, before/after pages. Log every note in BRIEF.md; write CHANGES.md (the change list) when a round is big. Never declare a direction final in exploration; the user decides.

## 7. Final render and delivery

Only on approval: 60 fps with motion blur in parallel segments (`render-parallel.sh`), mux the locked soundtrack, `check.py` (loudness, true peak, pops, flashes, seams, gaps, frame 0), then `finish.sh all`: master, post copy, social copy, Discord copy, poster (frame 0 is the thumbnail, so design it). Reveal the folder in Finder for the user rather than printing paths. Update TREATMENT.md, CHANGES.md and memory with the current positions.

## 8. Variants (parallel sessions)

Once a film is locked, its cuts run as their own sessions, each in its own folder, never touching the locked film: phone (9:16, 4:5 or 1:1, re-laid out shot by shot, same timing and soundtrack), short (an edit plan first, then its own cue table and its own music edit on bars), supercut (text and image only, type carries the story), remix (new piece from the style stack, own treatment and score). Briefs in `sessions.md`.

## 9. Close out

Commit only when asked, by explicit path, never rendered video or big WAVs. Push only when asked. Never post or publish anywhere unless asked.
