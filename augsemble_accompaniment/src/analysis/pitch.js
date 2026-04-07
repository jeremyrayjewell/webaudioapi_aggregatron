import { clamp, rootMeanSquare } from "../utils/math.js";
import { frequencyToMidi } from "../utils/midi.js";

const FRAME_SIZE = 2048;
const HOP_SIZE = 512;
const MIN_FREQUENCY = 70;
const MAX_FREQUENCY = 1000;
const MIN_RMS = 0.01;
const MIN_CONFIDENCE = 0.55;

function autoCorrelate(frame, sampleRate) {
  const rms = rootMeanSquare(frame);
  if (rms < MIN_RMS) return null;

  const minLag = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY);
  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;

    for (let index = 0; index < frame.length - lag; index += 1) {
      const a = frame[index];
      const b = frame[index + lag];
      correlation += a * b;
      energyA += a * a;
      energyB += b * b;
    }

    const normalizedCorrelation = correlation / Math.sqrt(Math.max(energyA * energyB, 1e-12));
    if (normalizedCorrelation > bestCorrelation) {
      bestCorrelation = normalizedCorrelation;
      bestLag = lag;
    }
  }

  if (bestLag === -1) return null;

  const confidence = clamp(bestCorrelation, 0, 1);
  if (confidence < MIN_CONFIDENCE) return null;

  return { frequency: sampleRate / bestLag, confidence };
}

function smoothNotes(frames) {
  return frames.map((frame, index) => {
    if (!frame || frame.note === null) return frame;

    const neighbors = [];
    for (let offset = -2; offset <= 2; offset += 1) {
      const candidate = frames[index + offset];
      if (candidate && candidate.note !== null) neighbors.push(candidate.note);
    }

    if (!neighbors.length) return frame;

    const sorted = neighbors.sort((left, right) => left - right);
    const middle = sorted[Math.floor(sorted.length / 2)];
    return { ...frame, note: middle };
  });
}

export function detectPitch(signal, sampleRate) {
  const frames = [];

  for (let start = 0; start + FRAME_SIZE <= signal.length; start += HOP_SIZE) {
    const frame = signal.subarray(start, start + FRAME_SIZE);
    const result = autoCorrelate(frame, sampleRate);
    frames.push({
      time: start / sampleRate,
      frequency: result?.frequency || null,
      confidence: result?.confidence || 0,
      note: result ? frequencyToMidi(result.frequency) : null,
    });
  }

  return { frameSize: FRAME_SIZE, hopSize: HOP_SIZE, frames: smoothNotes(frames) };
}
