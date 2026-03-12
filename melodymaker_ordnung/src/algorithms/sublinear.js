// src/algorithms/sublinear.js

/**
 * Canonical exemplar: sqrt decomposition range-sum query.
 * Query cost is O(sqrt n).
 */
export function getSqrtDecompositionData(scale) {
  let notes = [];
  let steps = [];

  if (scale.length === 0) {
    steps.push("SqrtDecomposition: Scale is empty, nothing to query.");
    return { notes, steps };
  }

  const n = scale.length;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
  const blocks = Array(Math.ceil(n / blockSize)).fill(0);

  for (let i = 0; i < n; i++) {
    blocks[Math.floor(i / blockSize)] += scale[i];
  }

  const left = Math.floor(n / 4);
  const right = Math.max(left, Math.floor((3 * n) / 4));
  let sum = 0;

  let index = left;
  while (index <= right) {
    if (index % blockSize === 0 && index + blockSize - 1 <= right) {
      const blockIndex = Math.floor(index / blockSize);
      steps.push(
        `SqrtDecomposition: block=${blockIndex}, sum=${blocks[blockIndex].toFixed(2)}`
      );
      notes.push(scale[index]);
      sum += blocks[blockIndex];
      index += blockSize;
    } else {
      steps.push(`SqrtDecomposition: index=${index}, value=${scale[index].toFixed(2)}`);
      notes.push(scale[index]);
      sum += scale[index];
      index += 1;
    }
  }

  steps.push(`SqrtDecomposition: rangeSum=${sum.toFixed(2)}`);
  return { notes, steps };
}

/**
 * Canonical exemplar: jump search.
 */
export function getJumpSearchData(scale, target, sortOrder = "ascending") {
  let notes = [];
  let steps = [];

  const sortedScale = [...scale].sort((a, b) =>
    sortOrder === "descending" ? b - a : a - b
  );
  const n = sortedScale.length;
  if (n === 0) {
    steps.push("JumpSearch: Scale is empty, nothing to search.");
    return { notes, steps };
  }
  const actualTarget =
    target ?? sortedScale[Math.floor(sortedScale.length / 2)];
  const isBeforeTarget = (value) =>
    sortOrder === "descending" ? value > actualTarget : value < actualTarget;

  const jumpSize = Math.max(1, Math.floor(Math.sqrt(n)));
  let step = jumpSize;
  let prev = 0;

  while (isBeforeTarget(sortedScale[Math.min(step, n) - 1])) {
    steps.push(
      `JumpSearch: Jumping from index ${prev} to ${Math.min(step, n) - 1}`
    );
    notes.push(sortedScale[Math.min(step, n) - 1]);
    prev = step;
    step += jumpSize;

    if (prev >= n) {
      steps.push("JumpSearch: Target not found.");
      return { notes, steps };
    }
  }

  while (prev < Math.min(step, n) && isBeforeTarget(sortedScale[prev])) {
    steps.push(`JumpSearch: Linear search at index ${prev}`);
    notes.push(sortedScale[prev]);
    prev++;
  }

  if (prev < n && sortedScale[prev] === actualTarget) {
    steps.push(
      `JumpSearch: Found target ${actualTarget.toFixed(2)} Hz at index ${prev}`
    );
    notes.push(sortedScale[prev]);
  } else {
    steps.push("JumpSearch: Target not found.");
  }

  return { notes, steps };
}
