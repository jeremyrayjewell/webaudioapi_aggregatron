/**
 * Canonical O(log n) exemplars.
 */
function buildMaxHeap(values) {
    const heap = [...values];

    const siftDown = (index, size) => {
        let current = index;

        for (;;) {
            const left = 2 * current + 1;
            const right = 2 * current + 2;
            let largest = current;

            if (left < size && heap[left] > heap[largest]) {
                largest = left;
            }

            if (right < size && heap[right] > heap[largest]) {
                largest = right;
            }

            if (largest === current) break;

            [heap[current], heap[largest]] = [heap[largest], heap[current]];
            current = largest;
        }
    };

    for (let index = Math.floor(heap.length / 2) - 1; index >= 0; index--) {
        siftDown(index, heap.length);
    }

    return heap;
}

function createHeapDemo(scale) {
    const usableValues = [...scale];

    if (usableValues.length === 0) {
        return { heap: [], insertValue: null };
    }

    if (usableValues.length === 1) {
        return { heap: [usableValues[0]], insertValue: usableValues[0] };
    }

    return {
        heap: buildMaxHeap(usableValues.slice(0, usableValues.length - 1)),
        insertValue: usableValues[usableValues.length - 1],
    };
}

export function getBinarySearchData(scale, target, sortOrder = "ascending") {
    let notes = [];
    let steps = [];
    const sortedScale = [...scale].sort((a, b) =>
      sortOrder === "descending" ? b - a : a - b
    );
    const actualTarget =
      target ?? (sortedScale.length > 0 ? sortedScale[Math.floor(sortedScale.length / 2)] : undefined);
    
    let left = 0;
    let right = sortedScale.length - 1;
    let foundIndex = -1;
  
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      steps.push(`BinarySearch: left=${left}, right=${right}, mid=${mid}`);
      notes.push(sortedScale[mid]);
  
      if (sortedScale[mid] === actualTarget) {
        foundIndex = mid;
        break;
      } else if (
        (sortOrder === "descending" && sortedScale[mid] > actualTarget) ||
        (sortOrder !== "descending" && sortedScale[mid] < actualTarget)
      ) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  
    return { notes, steps, foundIndex };
}
  
export function getExponentiationBySquaringData(scale, exponent) {
    let notes = [];
    let steps = [];
  
    function exponentiationBySquaring(index, n) {
      if (n === 0) {
        steps.push(`Base case: scale[${index}]^0 = 1`);
        return 1;
      }
      if (n % 2 === 0) {
        steps.push(`Even exponent: scale[${index}]^${n} = (scale[${index}]^${n / 2})^2`);
        const halfPower = exponentiationBySquaring(index, n / 2);
        notes.push(scale[index]);
        return halfPower * halfPower;
      }

      steps.push(`Odd exponent: scale[${index}]^${n} = scale[${index}] * scale[${index}]^${n - 1}`);
      const reducedPower = exponentiationBySquaring(index, n - 1);
      notes.push(scale[index]);
      return scale[index] * reducedPower;
    }
  
    const index = Math.floor(Math.random() * scale.length);
    const result = exponentiationBySquaring(index, Math.max(1, exponent));
    steps.push(`Result: scale[${index}]^${exponent} = ${result}`);
    notes.push(scale[index]);
    return { notes, steps };
}

export function getEuclideanAlgorithmData(scale) {
    let notes = [];
    let steps = [];

    if (scale.length < 2) {
      steps.push("EuclideanGCD: Need at least 2 values.");
      return { notes, steps };
    }

    let a = Math.round(scale[0]);
    let b = Math.round(scale[1]);

    while (b !== 0) {
      steps.push(`EuclideanGCD: a=${a}, b=${b}`);
      notes.push(scale[Math.abs(a) % scale.length], scale[Math.abs(b) % scale.length]);
      const temp = b;
      b = a % b;
      a = temp;
    }

    steps.push(`EuclideanGCD: gcd=${Math.abs(a)}`);
    return { notes, steps };
}
  
export function getBinaryHeapInsertData(scale) {
    let notes = [];
    let steps = [];

    if (scale.length === 0) {
      steps.push("HeapInsert: Scale is empty.");
      return { notes, steps };
    }

    const { heap, insertValue: value } = createHeapDemo(scale);
    steps.push(`HeapInsert: initialMaxHeap=[${heap.map((entry) => entry.toFixed(2)).join(", ")}]`);

    heap.push(value);
    steps.push(`HeapInsert: append value=${value.toFixed(2)} at index=${heap.length - 1}`);
    notes.push(value);
    let index = heap.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      steps.push(
        `HeapInsert: compare parent=${parent} (${heap[parent].toFixed(2)}) with child=${index} (${heap[index].toFixed(2)})`
      );
      notes.push(heap[index], heap[parent]);

      if (heap[parent] >= heap[index]) {
        steps.push(`HeapInsert: settled at index=${index}`);
        break;
      }

      steps.push(
        `HeapInsert: swap parent=${parent} (${heap[parent].toFixed(2)}) with child=${index} (${heap[index].toFixed(2)})`
      );
      [heap[parent], heap[index]] = [heap[index], heap[parent]];
      index = parent;
    }

    if (index === 0) {
      steps.push("HeapInsert: settled at root");
    }

    return { notes, steps };
}
  
export function getHeapRootPathData(scale) {
    let notes = [];
    let steps = [];

    const { heap, insertValue } = createHeapDemo(scale);
    if (heap.length === 0) {
      steps.push("HeapPath: Scale is empty.");
      return { notes, steps };
    }

    if (insertValue != null) {
      heap.push(insertValue);
      let bubbleIndex = heap.length - 1;
      while (bubbleIndex > 0) {
        const parent = Math.floor((bubbleIndex - 1) / 2);
        if (heap[parent] >= heap[bubbleIndex]) break;
        [heap[parent], heap[bubbleIndex]] = [heap[bubbleIndex], heap[parent]];
        bubbleIndex = parent;
      }
    }

    let index = heap.length - 1;
    steps.push(`HeapPath: heap=[${heap.map((entry) => entry.toFixed(2)).join(", ")}]`);

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      steps.push(`HeapPath: visit index=${index}, value=${heap[index].toFixed(2)}`);
      notes.push(heap[index]);
      index = parent;
    }

    steps.push(`HeapPath: visit index=0, value=${heap[0].toFixed(2)}`);
    notes.push(heap[0]);
    return { notes, steps };
}
