// src/algorithms/sublinear.js

/**
 * 1) Random Sampling (O(sqrt(n)))
 *    Randomly samples a subset of elements from the input array.
 */
export function getRandomSamplingData(scale) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("RandomSampling: Scale is empty, nothing to sample.");
    return { notes, steps };
  }

  const sampleSize = Math.floor(Math.sqrt(scale.length));
  const sampledIndices = new Set();

  while (sampledIndices.size < sampleSize) {
    const randomIndex = Math.floor(Math.random() * scale.length);
    if (!sampledIndices.has(randomIndex)) {
      sampledIndices.add(randomIndex);
      const element = scale[randomIndex];
      steps.push(`RandomSampling: Sampled element at index ${randomIndex} is ${element.toFixed(2)} Hz`);
      notes.push(element);
    }
  }

  return { notes, steps };
}

/**
 * 2) Jump Search (O(sqrt(n)))
 *    Searches for a target value by jumping ahead by fixed steps and then performing a linear search within the block.
 */
export function getJumpSearchData(scale, target) {
  let notes = [];
  let steps = [];

  const n = scale.length;
  if (n === 0) {
    steps.push("JumpSearch: Scale is empty, nothing to search.");
    return { notes, steps };
  }

  const step = Math.floor(Math.sqrt(n));
  let prev = 0;

  while (scale[Math.min(step, n) - 1] < target) {
    steps.push(`JumpSearch: Jumping from index ${prev} to ${Math.min(step, n) - 1}`);
    notes.push(scale[Math.min(step, n) - 1]);
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) {
      steps.push("JumpSearch: Target not found.");
      return { notes, steps };
    }
  }

  while (scale[prev] < target) {
    steps.push(`JumpSearch: Linear search at index ${prev}`);
    notes.push(scale[prev]);
    prev++;
    if (prev === Math.min(step, n)) {
      steps.push("JumpSearch: Target not found.");
      return { notes, steps };
    }
  }

  if (scale[prev] === target) {
    steps.push(`JumpSearch: Found target ${target.toFixed(2)} Hz at index ${prev}`);
    notes.push(scale[prev]);
  } else {
    steps.push("JumpSearch: Target not found.");
  }

  return { notes, steps };
}

