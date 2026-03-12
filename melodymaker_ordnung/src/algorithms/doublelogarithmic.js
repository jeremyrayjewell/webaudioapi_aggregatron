// src/algorithms/doublelogarithmic.js

/**
 * Canonical exemplar: interpolation search.
 * Average-case complexity is O(log log n) on uniformly distributed sorted data.
 */
export function getInterpolationSearchData(scale) {
  let notes = [];
  let steps = [];

  const sortedScale = [...scale].sort((a, b) => a - b);
  const n = sortedScale.length;

  if (n === 0) {
    steps.push("InterpolationSearch: Scale is empty, nothing to search.");
    return { notes, steps };
  }

  const target = sortedScale[Math.floor(n / 2)];
  let low = 0;
  let high = n - 1;

  while (
    low <= high &&
    target >= sortedScale[low] &&
    target <= sortedScale[high]
  ) {
    if (low === high) {
      steps.push(`InterpolationSearch: low=${low}, high=${high}, pos=${low}`);
      notes.push(sortedScale[low]);
      break;
    }

    const denominator = sortedScale[high] - sortedScale[low];
    const ratio = denominator === 0 ? 0 : (target - sortedScale[low]) / denominator;
    const pos = low + Math.floor((high - low) * ratio);

    steps.push(`InterpolationSearch: low=${low}, high=${high}, pos=${pos}`);
    notes.push(sortedScale[pos]);

    if (sortedScale[pos] === target) {
      steps.push(`Found target ${target.toFixed(2)} Hz at index ${pos}`);
      break;
    }

    if (sortedScale[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }

  return { notes, steps };
}
