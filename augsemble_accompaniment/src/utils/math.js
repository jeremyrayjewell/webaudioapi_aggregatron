export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const lerp = (start, end, amount) => start + (end - start) * amount;

export function average(values) {
  if (!values.length) return 0;
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function rootMeanSquare(frame) {
  let total = 0;
  for (let index = 0; index < frame.length; index += 1) total += frame[index] * frame[index];
  return Math.sqrt(total / Math.max(frame.length, 1));
}

export function frameSignal(signal, frameSize, hopSize) {
  const frames = [];
  for (let start = 0; start + frameSize <= signal.length; start += hopSize) {
    frames.push(signal.subarray(start, start + frameSize));
  }
  return frames;
}

export function normalizeVector(values) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return values.map(() => 0);
  return values.map((value) => value / norm);
}

export function dotProduct(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index += 1) total += left[index] * right[index];
  return total;
}

export function quantize(value, step) {
  return Math.round(value / step) * step;
}
