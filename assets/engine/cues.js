/* ---------- the cue table ----------
   One table for the picture (film.js) and the score (score.html). Times are in beats from the first frame; b(n) turns
   them into seconds. Re-time the film here and both follow. Keep sections on bar lines (4 beats). */
(function (root) {
  const BPM = 90, BEAT = 60 / BPM, b = n => n * BEAT;
  const C = {
    BPM, BEAT, b,
    W: 1920, H: 1080,
    DUR: b(32),
    /* each section: when it starts, and the moments inside it */
    hook:  { at: 0, line: 0.25, cuts: [0, 1, 2, 3] },
    idea:  { at: 8, line: 8.25 },
    proof: { at: 16, hits: [16, 18, 20, 22] },
    end:   { at: 24, lock: 26, fade: [28, 32] },
    /* chapters for the player */
    chapters: [['Hook', 0], ['Idea', 8], ['Proof', 16], ['End', 24]]
  };
  root.CUES = C;
  if (typeof module !== 'undefined') module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);
