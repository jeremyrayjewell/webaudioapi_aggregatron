export function getDoubleExponentialData(scale, n = 3) {
    let notes = [];
    let steps = [];

    if (scale.length === 0) {
        steps.push("BooleanFunctionEnumeration: Scale is empty, no functions to enumerate.");
        return { notes, steps };
    }

    const variableCount = Math.max(1, Math.min(n, 3));
    const truthTableLength = Math.pow(2, variableCount);
    const outputs = Array(truthTableLength).fill(0);

    function enumerate(position) {
        if (position === truthTableLength) {
            steps.push(`BooleanFunctionEnumeration: truthTable=[${outputs.join("")}]`);
            outputs.forEach((bit, index) => {
                notes.push(scale[(index + bit) % scale.length]);
            });
            return;
        }

        outputs[position] = 0;
        enumerate(position + 1);
        outputs[position] = 1;
        enumerate(position + 1);
    }

    steps.push(
        `BooleanFunctionEnumeration: enumerate all Boolean functions on ${variableCount} variables (input capped at n <= 3 for interactive visualization)`
    );
    enumerate(0);
    return { notes, steps };
}
