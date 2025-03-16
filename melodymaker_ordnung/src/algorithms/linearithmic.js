export function getMergeSortData(scale, steps = []) {
    const notesInOrder = [];

    function mergeSortRecursive(arr) {
        if (arr.length <= 1) {
            steps.push(`Base case: [${arr.map((f) => f.toFixed(2)).join(", ")}]`);
            notesInOrder.push(...arr);
            return arr;
        }
        const mid = Math.floor(arr.length / 2);
        const leftPart = arr.slice(0, mid);
        const rightPart = arr.slice(mid);

        steps.push(
            `Split: left=[${leftPart.map((f) => f.toFixed(2)).join(", ")}], right=[${rightPart
                .map((f) => f.toFixed(2))
                .join(", ")}]`
        );
        const leftSorted = mergeSortRecursive(leftPart);
        const rightSorted = mergeSortRecursive(rightPart);

        // Merge sorted parts and record notes in order
        const merged = merge(leftSorted, rightSorted);
        steps.push(
            `Merge: [${leftSorted.map((f) => f.toFixed(2)).join(", ")}] + ` +
            `[${rightSorted.map((f) => f.toFixed(2)).join(", ")}] => [${merged.map((f) => f.toFixed(2)).join(", ")}]`
        );
        return merged;
    }

    function merge(left, right) {
        let result = [], i = 0, j = 0;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                steps.push(`Consider: [${left[i].toFixed(2)}] from left`);
                notesInOrder.push(left[i]);
                result.push(left[i++]);
            } else {
                steps.push(`Consider: [${right[j].toFixed(2)}] from right`);
                notesInOrder.push(right[j]);
                result.push(right[j++]);
            }
        }
        while (i < left.length) {
            steps.push(`Consider: [${left[i].toFixed(2)}] from left`);
            notesInOrder.push(left[i]);
            result.push(left[i++]);
        }
        while (j < right.length) {
            steps.push(`Consider: [${right[j].toFixed(2)}] from right`);
            notesInOrder.push(right[j]);
            result.push(right[j++]);
        }
        return result;
    }

    mergeSortRecursive(scale);
    return { notes: notesInOrder, steps };
}

export function getHeapSortData(scale) {
    let notes = [];
    let steps = [];

    function heapify(arr, n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }

        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }

        if (largest !== i) {
            steps.push(`Swap: ${arr[i].toFixed(2)} with ${arr[largest].toFixed(2)}`);
            notes.push(arr[i], arr[largest]);
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            heapify(arr, n, largest);
        }
    }

    function heapSort(arr) {
        let n = arr.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }

        for (let i = n - 1; i > 0; i--) {
            steps.push(`Swap: ${arr[0].toFixed(2)} with ${arr[i].toFixed(2)}`);
            notes.push(arr[0], arr[i]);
            [arr[0], arr[i]] = [arr[i], arr[0]];
            heapify(arr, i, 0);
        }
    }

    heapSort(scale);
    return { notes, steps };
}

export function getQuickSortData(scale) {
    let notes = [];
    let steps = [];

    function quickSort(arr, low, high) {
        if (low < high) {
            let pi = partition(arr, low, high);

            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    function partition(arr, low, high) {
        let pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                steps.push(`Swap: ${arr[i].toFixed(2)} with ${arr[j].toFixed(2)}`);
                notes.push(arr[i], arr[j]);
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        steps.push(`Swap: ${arr[i + 1].toFixed(2)} with ${arr[high].toFixed(2)}`);
        notes.push(arr[i + 1], arr[high]);
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }

    quickSort(scale, 0, scale.length - 1);
    return { notes, steps };
}