export function getBubbleSortData(scale) {
    let notes = [];
    let steps = [];
    let arr = [...scale];

    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            steps.push(`Compare: ${arr[j].toFixed(2)} and ${arr[j + 1].toFixed(2)}`);
            notes.push(arr[j], arr[j + 1]); // Add notes for comparison
            if (arr[j] > arr[j + 1]) {
                steps.push(`Swap: ${arr[j].toFixed(2)} with ${arr[j + 1].toFixed(2)}`);
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }

    return { notes, steps };
}

export function getSelectionSortData(scale) {
    let notes = [];
    let steps = [];
    let arr = [...scale];

    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            steps.push(`Compare: ${arr[j].toFixed(2)} and ${arr[minIndex].toFixed(2)}`);
            notes.push(arr[j], arr[minIndex]); // Add notes for comparison
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            steps.push(`Swap: ${arr[i].toFixed(2)} with ${arr[minIndex].toFixed(2)}`);
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }

    return { notes, steps };
}

export function getInsertionSortData(scale) {
    let notes = [];
    let steps = [];
    let arr = [...scale];

    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        steps.push(`Insert: ${key.toFixed(2)}`);
        notes.push(key); // Add note for insertion
        while (j >= 0 && arr[j] > key) {
            steps.push(`Move: ${arr[j].toFixed(2)} to position ${j + 1}`);
            notes.push(arr[j]); // Add note for movement
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }

    return { notes, steps };
}