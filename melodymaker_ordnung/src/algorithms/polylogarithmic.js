// src/algorithms/polylogarithmic.js

/**
 * Canonical exemplar: 2D Fenwick tree prefix query.
 * Query cost is O(log^2 n).
 */
export function getFenwick2DQueryData(scale) {
  let notes = [];
  let steps = [];

  const side = Math.max(2, Math.floor(Math.sqrt(scale.length)));
  const values = scale.slice(0, side * side);

  if (values.length === 0) {
    steps.push("Fenwick2DQuery: Scale is empty, nothing to query.");
    return { notes, steps };
  }

  const matrix = Array.from({ length: side }, (_, row) =>
    Array.from({ length: side }, (_, col) => values[(row * side + col) % values.length])
  );
  const bit = Array.from({ length: side + 1 }, () => Array(side + 1).fill(0));

  const update = (x, y, delta) => {
    for (let i = x; i <= side; i += i & -i) {
      for (let j = y; j <= side; j += j & -j) {
        bit[i][j] += delta;
      }
    }
  };

  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      update(row + 1, col + 1, matrix[row][col]);
    }
  }

  const targetRow = side;
  const targetCol = side;
  let sum = 0;

  for (let i = targetRow; i > 0; i -= i & -i) {
    for (let j = targetCol; j > 0; j -= j & -j) {
      steps.push(
        `Fenwick2DQuery: i=${i}, j=${j}, contribution=${bit[i][j].toFixed(2)}`
      );
      notes.push(matrix[(i - 1) % side][(j - 1) % side]);
      sum += bit[i][j];
    }
  }

  steps.push(`Fenwick2DQuery: prefixSum=${sum.toFixed(2)}`);
  return { notes, steps };
}
