// src/algorithms/polylogarithmic.js

/**
 * 1) Repeated Logarithmic Reduction (O((log n)^2))
 *    Repeatedly applies a logarithmic reduction to the input size until it reaches 1.
 */
export function getRepeatedLogReductionData(scale) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("RepeatedLogReduction: Scale is empty, nothing to reduce.");
    return { notes, steps };
  }

  let size = scale.length;
  let index = 0;

  while (size > 1) {
    size = Math.floor(Math.log2(size));
    const element = scale[index];
    steps.push(`RepeatedLogReduction: size=${size}, element=${element.toFixed(2)} Hz`);
    notes.push(element);
    index = (index + 1) % scale.length;
  }

  return { notes, steps };
}