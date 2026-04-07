export const KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function keyToSemitone(root) {
  return KEYS.indexOf(root);
}

export function quantizeToScale(midiNote, root, scale) {
  const rootSemitone = keyToSemitone(root);
  const intervals = SCALES[scale] ?? SCALES.major;

  if (rootSemitone < 0) {
    return midiNote;
  }

  let bestMidi = midiNote;
  let bestDistance = Infinity;

  for (let octave = -2; octave <= 2; octave += 1) {
    const octaveBase = Math.floor(midiNote / 12) * 12 + octave * 12;
    intervals.forEach((interval) => {
      const candidate = octaveBase + rootSemitone + interval;
      const distance = Math.abs(candidate - midiNote);

      if (
        distance < bestDistance ||
        (distance === bestDistance && candidate < bestMidi)
      ) {
        bestDistance = distance;
        bestMidi = candidate;
      }
    });
  }

  return bestMidi;
}

export function degreeToMidi(degree, octaveOffset, root, scale, baseOctave = 4) {
  const normalizedDegree = Math.min(7, Math.max(1, Number(degree) || 1));
  const rootSemitone = keyToSemitone(root);
  const intervals = SCALES[scale] ?? SCALES.major;
  const midiBase = 12 * (baseOctave + 1);

  return midiBase + rootSemitone + intervals[normalizedDegree - 1] + octaveOffset * 12;
}

export function getSequencedDegree(stepDegree, oscillatorDegree) {
  const stepIndex = Math.max(1, Number(stepDegree) || 1) - 1;
  const oscillatorIndex = Math.max(1, Number(oscillatorDegree) || 1) - 1;
  return ((stepIndex + oscillatorIndex) % 7) + 1;
}

export function getDegreeOctaveShift(stepDegree, oscillatorDegree) {
  const stepIndex = Math.max(1, Number(stepDegree) || 1) - 1;
  const oscillatorIndex = Math.max(1, Number(oscillatorDegree) || 1) - 1;
  return Math.floor((stepIndex + oscillatorIndex) / 7);
}
