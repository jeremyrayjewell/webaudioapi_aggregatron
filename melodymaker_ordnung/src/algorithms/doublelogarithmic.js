// src/algorithms/doublelogarithmic.js

/**
 * 1) Repeated Halving (O(log log n))
 *    Repeatedly halves the input size until it reaches 1.
 */
export function getRepeatedHalvingData(scale) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("RepeatedHalving: Scale is empty, nothing to halve.");
    return { notes, steps };
  }

  let size = scale.length;
  let index = 0;

  while (size > 1) {
    size = Math.floor(size / 2);
    const element = scale[index];
    steps.push(`RepeatedHalving: size=${size}, element=${element.toFixed(2)} Hz`);
    for (let i = 0; i < size; i++) {
      notes.push(element);
    }
    index = (index + 1) % scale.length;
  }

  return { notes, steps };
}