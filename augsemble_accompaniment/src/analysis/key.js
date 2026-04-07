import { dotProduct, normalizeVector } from "../utils/math.js";
import { noteNameToPitchClass, pitchClassToName } from "../utils/midi.js";

const MAJOR_PROFILE = normalizeVector([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]);
const MINOR_PROFILE = normalizeVector([6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]);

function rotate(values, amount) {
  const size = values.length;
  return values.map((_, index) => values[((index - amount) % size + size) % size]);
}

function buildPitchFrameChroma(pitchFrames) {
  const chroma = new Array(12).fill(0);

  for (const frame of pitchFrames) {
    if (!frame || frame.note === null) {
      continue;
    }

    const pitchClass = ((frame.note % 12) + 12) % 12;
    chroma[pitchClass] += Math.max(0.2, frame.confidence || 0.2);
  }

  return chroma;
}

function buildMelodyTonicWeights(melody) {
  const weights = new Array(12).fill(0);
  if (!melody.length) {
    return weights;
  }

  for (const note of melody) {
    const pitchClass = ((note.note % 12) + 12) % 12;
    weights[pitchClass] += Math.max(0.25, note.duration || 0.25);
  }

  const firstPitchClass = ((melody[0].note % 12) + 12) % 12;
  const lastPitchClass = ((melody[melody.length - 1].note % 12) + 12) % 12;
  weights[firstPitchClass] += 0.75;
  weights[lastPitchClass] += 1.5;

  return weights;
}

function getMelodyCenterHints(melody) {
  if (!melody.length) {
    return {
      openingPitchClass: null,
      endingPitchClass: null,
      longestPitchClass: null,
    };
  }

  let longestNote = melody[0];
  for (const note of melody) {
    if ((note.duration || 0) > (longestNote.duration || 0)) {
      longestNote = note;
    }
  }

  return {
    openingPitchClass: ((melody[0].note % 12) + 12) % 12,
    endingPitchClass: ((melody[melody.length - 1].note % 12) + 12) % 12,
    longestPitchClass: ((longestNote.note % 12) + 12) % 12,
  };
}

function scoreCandidate(chroma, tonicWeights, tonic, scale, endingPitchClass, openingPitchClass, longestPitchClass) {
  const profile = scale === "minor" ? MINOR_PROFILE : MAJOR_PROFILE;
  const profileScore = dotProduct(chroma, rotate(profile, tonic));
  const tonicSupport = tonicWeights[tonic] || 0;
  const dominantSupport = tonicWeights[(tonic + 7) % 12] || 0;
  const mediantSupport = tonicWeights[(tonic + (scale === "minor" ? 3 : 4)) % 12] || 0;
  const endingBonus = endingPitchClass === tonic ? 0.12 : 0;
  const openingBonus = openingPitchClass === tonic ? 0.05 : 0;
  const longestBonus = longestPitchClass === tonic ? 0.18 : 0;

  return profileScore
    + tonicSupport * 0.05
    + dominantSupport * 0.015
    + mediantSupport * 0.01
    + endingBonus
    + openingBonus
    + longestBonus;
}

export function detectKey(pitchFrames, melody = []) {
  const frameChroma = buildPitchFrameChroma(pitchFrames);
  const tonicWeights = buildMelodyTonicWeights(melody);
  const normalizedChroma = normalizeVector(frameChroma);
  const { openingPitchClass, endingPitchClass, longestPitchClass } = getMelodyCenterHints(melody);

  let bestMatch = { key: "C", scale: "major", score: -Infinity };
  let secondBest = { key: "A", scale: "minor", score: -Infinity };

  for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
    const majorScore = scoreCandidate(
      normalizedChroma,
      tonicWeights,
      pitchClass,
      "major",
      endingPitchClass,
      openingPitchClass,
      longestPitchClass,
    );
    const minorScore = scoreCandidate(
      normalizedChroma,
      tonicWeights,
      pitchClass,
      "minor",
      endingPitchClass,
      openingPitchClass,
      longestPitchClass,
    );

    if (majorScore > bestMatch.score) {
      secondBest = bestMatch;
      bestMatch = { key: pitchClassToName(pitchClass), scale: "major", score: majorScore };
    } else if (majorScore > secondBest.score) {
      secondBest = { key: pitchClassToName(pitchClass), scale: "major", score: majorScore };
    }
    if (minorScore > bestMatch.score) {
      secondBest = bestMatch;
      bestMatch = { key: pitchClassToName(pitchClass), scale: "minor", score: minorScore };
    } else if (minorScore > secondBest.score) {
      secondBest = { key: pitchClassToName(pitchClass), scale: "minor", score: minorScore };
    }
  }

  const closeScores = Math.abs(bestMatch.score - secondBest.score) < 0.2;
  const bestPitchClass = noteNameToPitchClass(bestMatch.key);
  const secondPitchClass = noteNameToPitchClass(secondBest.key);
  const relativePair = (
    (bestMatch.scale === "major" && secondBest.scale === "minor" && bestPitchClass === (secondPitchClass + 3) % 12)
    || (bestMatch.scale === "minor" && secondBest.scale === "major" && secondPitchClass === (bestPitchClass + 3) % 12)
  );

  const ambiguous = closeScores && relativePair;
  if (ambiguous) {
    const bestTonicSupport = tonicWeights[bestPitchClass] || 0;
    const secondTonicSupport = tonicWeights[secondPitchClass] || 0;
    const secondLooksLikeCadence = endingPitchClass === secondPitchClass || longestPitchClass === secondPitchClass;
    if (secondLooksLikeCadence || secondTonicSupport > bestTonicSupport * 0.9) {
      [bestMatch, secondBest] = [secondBest, bestMatch];
    }
  }

  return {
    key: bestMatch.key,
    scale: bestMatch.scale,
    chroma: normalizedChroma,
    confidence: Math.max(0, Math.min(1, (bestMatch.score - secondBest.score + 0.25) / 0.5)),
    candidates: [bestMatch, secondBest],
    ambiguousRelative: ambiguous
      ? {
          primary: { key: bestMatch.key, scale: bestMatch.scale },
          secondary: { key: secondBest.key, scale: secondBest.scale },
        }
      : null,
  };
}
