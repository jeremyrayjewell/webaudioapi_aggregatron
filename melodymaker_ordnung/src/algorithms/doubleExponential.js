export function getDoubleExponentialData(scale, maxDepth = 4) {
    let notes = [];
    let steps = [];
    let stack = [];

    const n = Math.min(scale.length, maxDepth);
    const workingScale = scale.slice(0, n);

    if (n < 1) {
        steps.push("DoubleExponential: Need at least 1 element to generate subsets.");
        return { notes, steps };
    }

    stack.push({ subset: [], index: 0, depth: 0 });

    while (stack.length > 0) {
        const { subset, index, depth } = stack.pop();

        if (depth > maxDepth) {
            steps.push("Max recursion depth reached — stopping further recursion.");
            continue;
        }

        if (index === n) {
            steps.push(`Subset: [${subset.join(", ")}]`);
            subset.forEach((val) => notes.push(workingScale[val % workingScale.length]));
            continue;
        }

        // Include the current element
        stack.push({ subset: [...subset, index], index: index + 1, depth: depth + 1 });

        // Exclude the current element
        stack.push({ subset, index: index + 1, depth: depth + 1 });
    }

    return { notes, steps };
}