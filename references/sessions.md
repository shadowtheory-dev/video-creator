# Running the work across sessions

The producer chat (where this skill was invoked) talks to the user, keeps the plan, writes briefs, and routes notes. Specialist sessions do the heavy, long or parallel work. In the Claude desktop app use `start_session`; elsewhere use subagents (Agent tool) for research and critique, and run builds sequentially.

## When to split

- **Split:** anything long-running or parallel (renders, overnight variants), a specialist piece with its own review loop (a drawn asset, the music in a track editor, a reference breakdown, a footage search), or a second direction to compare.
- **Keep here:** quick edits, decisions, the brief and plan, relaying, small fixes to the producer's own files.
- **Effort:** ask the session for the effort the user named ("extra effort" = xhigh, "max" = max); default to inheriting.
- **Context:** `fresh` with a complete brief once the conversation is long; `fork` only early, for a subtask of the current topic.
- **Folder:** `use_worktree: false` when the session needs git-ignored media (footage, renders, B-roll frames); give each session its own folder and say which files it owns.

## Coordination rules (put the relevant ones in every brief)

1. **Ownership.** Each session owns named files. The locked film's folder is read-only to variant sessions. When two sessions must touch one file (the cue table), one owns it and the other asks.
2. **One source of timing.** The cue table drives picture and sound. Whoever re-times it tells the sound session; sound derives every boundary from the cues (relative to the anchor moment, e.g. the drop), never from hard-coded beats.
3. **One cut, one music.** A change asked for one cut touches only that cut and only the track type named (music or effects). Never change a shared default that rebuilds other cuts.
4. **Locked means locked.** Don't replace the approved soundtrack or master until the user approves the replacement; keep the old one backed up.
5. **Renders.** At most two render processes per session when others are rendering. Drafts while scoping (FPS=30 SUB=1, fast preset) plus a Discord copy every time; 60 fps finals only after approval.
6. **Never commit, push, post or publish** unless the user asked, and then commit by explicit path (other sessions stage in the same index).
7. **Talk to the user in plain text.** No question cards or next-step buttons; lay out options and let them choose.
8. **Report** files (as Finder reveals or file cards, not bare paths), what changed, what's open, and stills.

## Routing

- A note about a piece goes to the session that has its context (SendMessage to its id), quoted in the user's words, with the reading you'd act on. If the producer can't tell who owns something, check the files' recent edits and forward with "if this isn't yours, say so".
- When a session's report arrives, check the output exists before telling the user it's done, then tell them in one or two lines with a link to the session.
- Ownership moves: when a session makes a variant the film's real timing (re-edit D becomes the film), it says so and the docs change owner with it.

## Brief templates

Every brief: the goal in the user's words, the files and folder it owns, what it must not touch, how to see the work, the checks, what done looks like, and the rules above. Background (for fresh sessions): the film, its folder, the brand profile path, decisions so far.

### Reference breakdown
Break down <reference> so it can be pointed at: sections with timings, shot list, edit grammar, pacing, sound, why it works, a reusable structure, a beat sheet for our film. Dated folder in <research dir>, breakdown.md, sheets/ per section, a page version. Don't watch videos where a prompt or write-up says what happens.

### Footage and photo search
Find <n> licence-clean (PD, CC0, CC BY; never SA/NC/ND/unknown) <subject, era, places> stills or clips where something visibly happens; verify each licence from the source; save resized copies with a CREDITS.md row each; contact sheet; no near-duplicates; report doubts. Respect rate limits (Wikimedia: one file a minute with backoff).

### Drawn asset (iso object, device, machine)
Rework only <asset> from the user's notes: <quotes>. Generator script <file> → <output>; the film consumes <meta fields>. Review live in the browser pane (launch config, zoom and presets), PNG crops only for own checks. Brand object rules from the profile. Every cable runs where a real one would. Re-render only the segments that show it after approval.

### Music in a track editor
Rebuild the score in <editor> so every element is a visible track and the film plays muted in sync beside it: one layer per element, sections and cues from the cue table, a tab per cut. Picture sounds stay their own stem. Export, master (−14 LUFS, TP ≤ −1), mux with the film for review. Don't replace the soundtrack until approved.

### Phone cut
Same film, same timing, same soundtrack, re-laid out shot by shot for <9:16 | 4:5 | 1:1> (make the call and say why): type sizes, grids, objects, panes, so everything reads at phone size and nothing is cut. Own folder, own page; never edit the film's folder.

### Short cut
<n> seconds. Review first: what carries the message, what goes; write the edit plan as a beat sheet; then build its own cue table and its own music edit on bars, continuous. Never re-time the locked soundtrack.

### Supercut
Text and image only (no UI, no drawn objects): clips and the type system carry the story, fast cuts on the beat, the words as the main event. Scope first (treatment, beat sheet, clip list with licences, format), then build.

### Remix
Something different from the style stack: <stack summary>. Pick the idea, length, format and copy (from the brand's copy files; flag new lines). Two or three ideas in a short treatment, the pick and why, then build with its own cue table and score.

### Final render
Render the locked film at 60 fps with motion blur in <n> parallel segments, mux <soundtrack>, check.py, finish.sh all, reveal the folder.
