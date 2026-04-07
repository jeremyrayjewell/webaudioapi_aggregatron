import { quantize } from "../utils/math.js";

const MAX_NOTE_GAP_SECONDS = 0.09;
const MIN_NOTE_DURATION_SECONDS = 0.12;
const BEAT_QUANTIZATION = 0.25;
const NOTE_MERGE_TOLERANCE = 1;
const MIN_CONSECUTIVE_FRAMES = 2;

export function extractMelody(pitchFrames, bpm) {
  const melody = [];
  const secondsPerBeat = 60 / bpm;
  let active = null;

  function flushActive(nextTime) {
    if (!active) return;

    const durationSeconds = nextTime - active.startTime;
    if (durationSeconds >= MIN_NOTE_DURATION_SECONDS && active.frames >= MIN_CONSECUTIVE_FRAMES) {
      melody.push({
        time: quantize(active.startTime / secondsPerBeat, BEAT_QUANTIZATION),
        note: active.note,
        duration: Math.max(BEAT_QUANTIZATION, quantize(durationSeconds / secondsPerBeat, BEAT_QUANTIZATION)),
      });
    }

    active = null;
  }

  for (const frame of pitchFrames) {
    if (!frame) continue;

    if (frame.note === null) {
      flushActive(frame.time);
      continue;
    }

    if (!active) {
      active = { note: frame.note, startTime: frame.time, lastTime: frame.time, frames: 1 };
      continue;
    }

    const noteChanged = Math.abs(frame.note - active.note) > NOTE_MERGE_TOLERANCE;
    const gapTooLarge = frame.time - active.lastTime > MAX_NOTE_GAP_SECONDS;

    if (noteChanged || gapTooLarge) {
      flushActive(frame.time);
      active = { note: frame.note, startTime: frame.time, lastTime: frame.time, frames: 1 };
      continue;
    }

    active.note = Math.round((active.note * active.frames + frame.note) / (active.frames + 1));
    active.lastTime = frame.time;
    active.frames += 1;
  }

  const finalTime = pitchFrames[pitchFrames.length - 1]?.time || 0;
  flushActive(finalTime + MAX_NOTE_GAP_SECONDS);

  return melody.filter((note, index, notes) => index === 0 || note.time !== notes[index - 1].time || note.note !== notes[index - 1].note);
}
