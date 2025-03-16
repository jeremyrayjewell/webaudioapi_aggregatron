export function getPolynomialEvaluationData(scale, coefficients, x) {
    let notes = [];
    let steps = [];

    const n = coefficients.length;
    if (n === 0) {
        steps.push("PolynomialEvaluation: No coefficients provided.");
        return { notes, steps };
    }

    let result = 0;
    for (let i = 0; i < n; i++) {
        const term = coefficients[i] * Math.pow(x, i);
        result += term;
        steps.push(`Term: ${coefficients[i]} * ${x}^${i} = ${term.toFixed(2)}`);
        notes.push(scale[i % scale.length]);
    }

    steps.push(`Polynomial result: ${result.toFixed(2)}`);
    return { notes, steps };
}

export function getMatrixExponentiationData(scale, k) {
    let notes = [];
    let steps = [];

    const n = scale.length;
    if (n === 0) {
        steps.push("MatrixExponentiation: Scale is empty, nothing to exponentiate.");
        return { notes, steps };
    }

    // Create an n x n matrix filled with scale values
    const matrix = Array.from({ length: n }, (_, i) => scale.slice());
    let resultMatrix = Array.from({ length: n }, (_, i) => (i === 0 ? scale.slice() : Array(n).fill(0)));

    for (let exp = 1; exp < k; exp++) {
        const newMatrix = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let l = 0; l < n; l++) {
                    newMatrix[i][j] += resultMatrix[i][l] * matrix[l][j];
                    steps.push(`Multiplying resultMatrix[${i}][${l}] * matrix[${l}][${j}] and adding to newMatrix[${i}][${j}]`);
                    notes.push(resultMatrix[i][l], matrix[l][j]);
                }
            }
        }
        resultMatrix = newMatrix;
    }

    return { notes, steps };
}