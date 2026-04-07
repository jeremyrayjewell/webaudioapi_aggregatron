import { average, clamp } from "../utils/math.js";

const FRAME_SIZE = 1024;
const HOP_SIZE = 512;
const MIN_BPM = 60;
const MAX_BPM = 180;

function computeEnergyEnvelope(signal) {
  const energies = [];

  for (let start = 0; start + FRAME_SIZE <= signal.length; start += HOP_SIZE) {
    let energy = 0;
    for (let index = start; index < start + FRAME_SIZE; index += 1) {
      energy += Math.abs(signal[index]);
    }
    energies.push(energy / FRAME_SIZE);
  }

  return energies;
}

function computeOnsetEnvelope(energies) {
  const envelope = [0];
  for (let index = 1; index < energies.length; index += 1) {
    envelope.push(Math.max(0, energies[index] - energies[index - 1]));
  }

  const mean = average(envelope);
  return envelope.map((value) => Math.max(0, value - mean * 0.5));
}

function autocorrelateEnvelope(envelope, sampleRate) {
  const minLag = Math.floor((60 * sampleRate) / (MAX_BPM * HOP_SIZE));
  const maxLag = Math.ceil((60 * sampleRate) / (MIN_BPM * HOP_SIZE));
  const candidates = [];

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let score = 0;
    for (let index = lag; index < envelope.length; index += 1) {
      score += envelope[index] * envelope[index - lag];
    }

    candidates.push({ lag, score });
  }

  return candidates.sort((left, right) => right.score - left.score).slice(0, 8);
}

function scoreTempoCandidate(envelope, sampleRate, bpm) {
  const beatFrames = (60 / bpm) * sampleRate / HOP_SIZE;
  const halfBeatFrames = beatFrames / 2;
  let score = 0;

  for (let anchor = 0; anchor < envelope.length; anchor += 1) {
    score += envelope[anchor] || 0;

    const beatIndex = Math.round(anchor + beatFrames);
    const halfBeatIndex = Math.round(anchor + halfBeatFrames);
    if (beatIndex < envelope.length) {
      score += (envelope[beatIndex] || 0) * 1.4;
    }
    if (halfBeatIndex < envelope.length) {
      score += (envelope[halfBeatIndex] || 0) * 0.35;
    }
  }

  if (bpm >= 96 && bpm <= 132) {
    score *= 1.08;
  }

  return score;
}

function chooseBestBpm(envelope, sampleRate, lagCandidates) {
  const testedBpms = new Set();
  let bestBpm = 120;
  let bestScore = -Infinity;

  for (const candidate of lagCandidates) {
    const baseBpm = (60 * sampleRate) / (candidate.lag * HOP_SIZE);
    const aliases = [baseBpm, baseBpm * 2, baseBpm / 2, baseBpm * 1.5, baseBpm / 1.5];

    for (const alias of aliases) {
      const bpm = clamp(Math.round(alias), MIN_BPM, MAX_BPM);
      if (testedBpms.has(bpm)) {
        continue;
      }
      testedBpms.add(bpm);

      const score = scoreTempoCandidate(envelope, sampleRate, bpm) + candidate.score * 0.15;
      if (score > bestScore) {
        bestScore = score;
        bestBpm = bpm;
      }
    }
  }

  return bestBpm;
}

function extractBeatPeaks(envelope, sampleRate, bpm) {
  const stepFrames = (60 / bpm) * sampleRate / HOP_SIZE;
  const threshold = average(envelope) * 1.15;
  const peaks = [];

  let index = 0;
  while (index < envelope.length) {
    const windowEnd = Math.min(envelope.length, Math.round(index + stepFrames));
    let peakIndex = -1;
    let peakValue = threshold;

    for (let cursor = Math.round(index); cursor < windowEnd; cursor += 1) {
      if (envelope[cursor] > peakValue) {
        peakValue = envelope[cursor];
        peakIndex = cursor;
      }
    }

    if (peakIndex !== -1) {
      peaks.push((peakIndex * HOP_SIZE) / sampleRate);
      index = peakIndex + stepFrames * 0.5;
    } else {
      index += stepFrames;
    }
  }

  return peaks;
}

export function detectBpm(signal, sampleRate) {
  const energies = computeEnergyEnvelope(signal);
  const onsetEnvelope = computeOnsetEnvelope(energies);
  const lagCandidates = autocorrelateEnvelope(onsetEnvelope, sampleRate);
  const bpm = chooseBestBpm(onsetEnvelope, sampleRate, lagCandidates);

  return {
    bpm,
    energies,
    peaks: extractBeatPeaks(onsetEnvelope, sampleRate, bpm),
  };
}
