export function getAckermannData(scale, m, n) {
    let notes = [];
    let steps = [];
    let recursionDepth = 0;
    const maxDepth = 20; // Limit recursion depth to prevent freezing

    function ackermann(m, n) {
        recursionDepth++;
        if (recursionDepth > maxDepth) {
            steps.push("Max recursion depth reached — stopping further recursion.");
            recursionDepth--;
            return 0;
        }

        if (m === 0) {
            steps.push(`Ackermann(${m}, ${n}) = ${n + 1}`);
            notes.push(scale[(n + 1) % scale.length]);
            recursionDepth--;
            return n + 1;
        }
        if (n === 0) {
            steps.push(`Ackermann(${m}, ${n}) = Ackermann(${m - 1}, 1)`);
            const result = ackermann(m - 1, 1);
            notes.push(scale[result % scale.length]);
            recursionDepth--;
            return result;
        }
        steps.push(`Ackermann(${m}, ${n}) = Ackermann(${m - 1}, Ackermann(${m}, ${n - 1}))`);
        const innerResult = ackermann(m, n - 1);
        const result = ackermann(m - 1, innerResult);
        notes.push(scale[result % scale.length]);
        recursionDepth--;
        return result;
    }

    const result = ackermann(m, n);
    steps.push(`Ackermann(${m}, ${n}) = ${result}`);
    notes.push(scale[result % scale.length]);

    return { notes, steps };
}