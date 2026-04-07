const DIVISION_MULTIPLIERS = {
  "1/1": 4,
  "1/2": 2,
  "1/4": 1,
  "1/8": 0.5,
  "1/16": 0.25,
  triplet: 1 / 3,
};

export function getInterval(bpm, division) {
  const safeBpm = Math.max(1, Number(bpm) || 120);
  const secondsPerBeat = 60 / safeBpm;
  const multiplier = DIVISION_MULTIPLIERS[division] ?? 1;
  return secondsPerBeat * multiplier;
}

export function getSecondsPerBeat(bpm) {
  return 60 / Math.max(1, Number(bpm) || 120);
}
