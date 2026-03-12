export function getBubbleSortData(scale, sortOrder = "ascending") {
    let notes = [];
    let steps = [];
    let arr = [...scale];
    const shouldSwap = (left, right) =>
        sortOrder === "descending" ? left < right : left > right;

    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            steps.push(`Compare: ${arr[j].toFixed(2)} and ${arr[j + 1].toFixed(2)}`);
            notes.push(arr[j], arr[j + 1]); // Add notes for comparison
            if (shouldSwap(arr[j], arr[j + 1])) {
                steps.push(`Swap: ${arr[j].toFixed(2)} with ${arr[j + 1].toFixed(2)}`);
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }

    return { notes, steps };
}

export function getSelectionSortData(scale, sortOrder = "ascending") {
    let notes = [];
    let steps = [];
    let arr = [...scale];
    const isPreferred = (left, right) =>
        sortOrder === "descending" ? left > right : left < right;

    for (let i = 0; i < arr.length - 1; i++) {
        let selectedIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            steps.push(`Compare: ${arr[j].toFixed(2)} and ${arr[selectedIndex].toFixed(2)}`);
            notes.push(arr[j], arr[selectedIndex]); // Add notes for comparison
            if (isPreferred(arr[j], arr[selectedIndex])) {
                selectedIndex = j;
            }
        }
        if (selectedIndex !== i) {
            steps.push(`Swap: ${arr[i].toFixed(2)} with ${arr[selectedIndex].toFixed(2)}`);
            [arr[i], arr[selectedIndex]] = [arr[selectedIndex], arr[i]];
        }
    }

    return { notes, steps };
}

export function getInsertionSortData(scale, sortOrder = "ascending") {
    let notes = [];
    let steps = [];
    let arr = [...scale];
    const shouldShift = (value, key) =>
        sortOrder === "descending" ? value < key : value > key;

    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        steps.push(`Insert: ${key.toFixed(2)}`);
        notes.push(key); // Add note for insertion
        while (j >= 0 && shouldShift(arr[j], key)) {
            steps.push(`Move: ${arr[j].toFixed(2)} to position ${j + 1}`);
            notes.push(arr[j]); // Add note for movement
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }

    return { notes, steps };
}
