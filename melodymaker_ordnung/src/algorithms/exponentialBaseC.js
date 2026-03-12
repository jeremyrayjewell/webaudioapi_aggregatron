export function getGraph3ColoringData(scale) {
    let notes = [];
    let steps = [];

    const vertexCount = Math.max(3, Math.min(scale.length, 6));
    const colors = Array(vertexCount).fill(-1);
    const adjacency = Array.from({ length: vertexCount }, () => Array(vertexCount).fill(false));

    for (let i = 0; i < vertexCount; i++) {
        adjacency[i][(i + 1) % vertexCount] = true;
        adjacency[(i + 1) % vertexCount][i] = true;
    }
    if (vertexCount > 3) {
        adjacency[0][2] = true;
        adjacency[2][0] = true;
    }

    function backtrack(vertex) {
        if (vertex === vertexCount) {
            steps.push(`Graph3Coloring: coloring=[${colors.join(", ")}]`);
            colors.forEach((color, index) => notes.push(scale[(index + color + scale.length) % scale.length]));
            return;
        }

        for (let color = 0; color < 3; color++) {
            let valid = true;
            for (let other = 0; other < vertexCount; other++) {
                if (adjacency[vertex][other] && colors[other] === color) {
                    valid = false;
                    break;
                }
            }

            steps.push(`Graph3Coloring: vertex=${vertex}, color=${color}`);
            notes.push(scale[(vertex + color) % scale.length]);
            if (!valid) continue;
            colors[vertex] = color;
            backtrack(vertex + 1);
            colors[vertex] = -1;
        }
    }

    backtrack(0);
    return { notes, steps };
}

export function getThreeWayPartitionData(scale, maxOutputs = 243) {
    let notes = [];
    let steps = [];

    const n = Math.max(1, Math.min(scale.length, 5));
    const subsetSums = [0, 0, 0];
    const assignment = Array(n).fill(0);
    let outputs = 0;
    let solutionCount = 0;

    function backtrack(index) {
        if (outputs >= maxOutputs) return;

        if (index === n) {
            outputs++;
            const isBalanced =
                subsetSums[0] === subsetSums[1] &&
                subsetSums[1] === subsetSums[2];
            steps.push(
                `ThreeWayPartition: assignment=[${assignment.join(", ")}], sums=[${subsetSums
                    .map((value) => value.toFixed(2))
                    .join(", ")}]`
            );
            assignment.forEach((bucket, position) => notes.push(scale[(position + bucket) % scale.length]));
            if (isBalanced) {
                solutionCount++;
                steps.push(
                    `ThreeWayPartition: solution #${solutionCount} assignment=[${assignment.join(", ")}]`
                );
                assignment.forEach((bucket, position) =>
                    notes.push(scale[(position + bucket) % scale.length])
                );
            }
            return;
        }

        for (let bucket = 0; bucket < 3; bucket++) {
            assignment[index] = bucket;
            subsetSums[bucket] += scale[index];
            backtrack(index + 1);
            subsetSums[bucket] -= scale[index];
        }
    }

    backtrack(0);
    if (solutionCount === 0) {
        steps.push("ThreeWayPartition: no equal-sum partition found within bounds");
    }
    return { notes, steps };
}
