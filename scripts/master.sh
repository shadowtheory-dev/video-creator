#!/usr/bin/env bash
# Master a soundtrack to delivery loudness: two-pass loudnorm to -14 LUFS integrated, true peak -1.5 dBTP
# (AAC adds about 1 dB, so the muxed file stays at or under -1), 48 kHz 24-bit WAV, length kept.
#   master.sh <in.wav> <out.wav> [target LUFS = -14]
set -euo pipefail
IN="$1"; OUT="$2"; I="${3:--14}"; TP=-1.5; LRA=11
J=$(ffmpeg -hide_banner -nostats -i "$IN" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2 | sed "s#^#  $OUT #"
