export function getKCliqueSearchData(scale, coefficients, x) {
    let notes = [];
    let steps = [];

    const n = scale.length;
    const cliqueSize = Math.max(3, coefficients?.length || 3);

    if (n === 0) {
        steps.push("KClique: Scale is empty, no graph to search.");
        return { notes, steps };
    }

    const adjacency = Array.from({ length: n }, () => Array(n).fill(false));
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const connected = Math.abs(scale[i] - scale[j]) <= (x + 1) * 220;
            adjacency[i][j] = connected;
            adjacency[j][i] = connected;
        }
    }

    const chosen = [];

    function search(start) {
        if (chosen.length === cliqueSize) {
            steps.push(`KClique: clique=[${chosen.join(", ")}]`);
            chosen.forEach((index) => notes.push(scale[index]));
            return;
        }

        for (let v = start; v < n; v++) {
            let valid = true;
            for (const u of chosen) {
                if (!adjacency[u][v]) {
                    valid = false;
                    break;
                }
            }
            steps.push(`KClique: try vertex=${v}, depth=${chosen.length}`);
            notes.push(scale[v]);
            if (!valid) continue;
            chosen.push(v);
            search(v + 1);
            chosen.pop();
        }
    }

    search(0);
    return { notes, steps };
}

export function getKSumEnumerationData(scale, k) {
    let notes = [];
    let steps = [];

    const n = scale.length;
    const tupleSize = Math.max(1, Math.min(n, k || 4));
    const target = scale
        .slice(0, tupleSize)
        .reduce((sum, value) => sum + value, 0);
    const chosen = [];
    let solutionCount = 0;

    if (n === 0) {
        steps.push("KSum: Scale is empty, no tuples to inspect.");
        return { notes, steps };
    }

    function search(start, depth, runningSum) {
        if (depth === tupleSize) {
            steps.push(`KSum: tuple=[${chosen.join(", ")}], sum=${runningSum.toFixed(2)}`);
            chosen.forEach((index) => notes.push(scale[index]));

            if (runningSum === target) {
                solutionCount++;
                steps.push(
                    `KSum: solution #${solutionCount} tuple=[${chosen.join(", ")}], sum=${runningSum.toFixed(2)}`
                );
                chosen.forEach((index) => notes.push(scale[index]));
            }
            return;
        }

        for (let i = start; i < n; i++) {
            chosen.push(i);
            search(i + 1, depth + 1, runningSum + scale[i]);
            chosen.pop();
        }
    }

    steps.push(`KSum: target=${target.toFixed(2)}, k=${tupleSize}`);
    search(0, 0, 0);
    if (solutionCount === 0) {
        steps.push("KSum: no tuple matched the target");
    }
    return { notes, steps };
}
