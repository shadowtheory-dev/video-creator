# Sound

Picture and sound share the cue table. Every sound has a picture twin and is placed so its peak, not its file start, lands on the event.

## Three layers

1. **Code score** (`score.html`, OfflineAudioContext): fast to iterate, rendered by `scripts/score.mjs`. Good for the first pass and for the picture's sounds. Derive every section boundary from cues relative to an anchor (e.g. `Bn.fuse − 1` for the roll into a drop), harmony and two-bar phrasing counted from the anchor so an inserted bar repeats the bar before and everything after keeps its chords.
2. **Music in a track editor.** When the user wants to shape the music, rebuild it where every element is a visible, editable track and the film plays muted, locked to the transport, beside it, with a tab per cut. The user asks for changes track by track. The brand profile names the editor and its path. The pattern: a project file per cut, generated from the cue table by a script, rendered headless to a WAV.
3. **Effects** from a sound bank or kit (earshot, MIT, github.com/Leonxlnx/earshot: render a kit, place takes on logged moments, level-matched per group), plus a few made in code. Keep effects as their own stem.

## Rules the user set (defaults)

- One continuous track: the beat never stops; section sounds sit inside it; fills and swells bridge sections instead of gaps.
- A "low" section is filtered and sparse but keeps time; come back up with a double kick ("bump bump") on the bar line.
- No silence before the payoff unless asked; the ending rides out and fades rather than stopping hard. Fewer separate sounds at the end.
- Subdued and slowed under the closing line drives it home (half time, one chord a bar).
- Peaks on the events: whooshes peak at the cut, clicks on the contact frame, typing per key.

## Master and stems

- Sum music and effects (music a few dB under effects for UI-heavy films), limit with oversampling, trim after the limiter to land −14.0 LUFS integrated, true peak ≤ −1 dBTP (check again after AAC; it adds about 1 dB).
- Or simply run `scripts/master.sh mix.wav score-final.wav` (two-pass loudnorm to −14 LUFS, true peak −1.5 dBTP).
- Keep `score-final.wav` plus `-music` and `-effects` stems; never overwrite the locked final with a regenerated code score.
- Measure: `check.py` on the muxed file (loudness, true peak, gaps). Look at a waveform and a spectrogram (`ffmpeg showwavespic / showspectrumpic`) to confirm low sections are filtered, not gapped.

## Brand sound

The project profile names the brand's sonic rules (tempo range, key, payoff hit, sonic logo, loudness). The user's notes on a film win over brand defaults; record the deviation in the film's TREATMENT.md.
