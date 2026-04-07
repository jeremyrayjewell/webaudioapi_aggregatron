const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function frequencyToMidi(frequency) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

export function midiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

export function midiToPitchClass(note) {
  return ((note % 12) + 12) % 12;
}

export function pitchClassToName(pitchClass) {
  return NOTE_NAMES[((pitchClass % 12) + 12) % 12];
}

export function noteNameToPitchClass(name) {
  return NOTE_NAMES.indexOf(name);
}

export function buildScalePitchClasses(rootName, scale) {
  const root = noteNameToPitchClass(rootName);
  const intervals = scale === "minor" ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  return intervals.map((interval) => (root + interval) % 12);
}

export function snapMidiToScale(note, rootName, scale) {
  const allowed = buildScalePitchClasses(rootName, scale);
  if (allowed.includes(midiToPitchClass(note))) return note;

  for (let offset = 1; offset <= 6; offset += 1) {
    if (allowed.includes(midiToPitchClass(note - offset))) return note - offset;
    if (allowed.includes(midiToPitchClass(note + offset))) return note + offset;
  }

  return note;
}
