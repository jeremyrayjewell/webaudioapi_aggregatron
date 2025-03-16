export function getMatrixMultiplicationData(scale) {
    let notes = [];
    let steps = [];

    const n = scale.length;
    if (n === 0) {
        steps.push("MatrixMultiplication: Scale is empty, nothing to multiply.");
        return { notes, steps };
    }

    // Create two n x n matrices filled with scale values
    const matrixA = Array.from({ length: n }, (_, i) => scale.slice());
    const matrixB = Array.from({ length: n }, (_, i) => scale.slice());
    const resultMatrix = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
                steps.push(`Multiplying A[${i}][${k}] * B[${k}][${j}] and adding to result[${i}][${j}]`);
                notes.push(matrixA[i][k], matrixB[k][j]);
            }
        }
    }

    return { notes, steps };
}

export function getThreeSumData(scale, target) {
    let notes = [];
    let steps = [];

    const n = scale.length;
    if (n < 3) {
        steps.push("ThreeSum: Scale has fewer than 3 elements, no triplets to find.");
        return { notes, steps };
    }

    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const sum = scale[i] + scale[j] + scale[k];
                steps.push(`Checking triplet: ${scale[i].toFixed(2)}, ${scale[j].toFixed(2)}, ${scale[k].toFixed(2)} (sum: ${sum.toFixed(2)})`);
                notes.push(scale[i], scale[j], scale[k]);
                if (sum === target) {
                    steps.push(`Found triplet: ${scale[i].toFixed(2)}, ${scale[j].toFixed(2)}, ${scale[k].toFixed(2)} that sums to ${target.toFixed(2)}`);
                    return { notes, steps };
                }
            }
        }
    }

    steps.push(`No triplet found that sums to ${target.toFixed(2)}`);
    return { notes, steps };
}