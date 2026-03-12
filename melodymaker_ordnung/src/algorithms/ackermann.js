export function getAckermannData(scale, m, n) {
    let notes = [];
    let steps = [];

    function ackermann(mValue, nValue) {
        if (mValue === 0) {
            const result = nValue + 1;
            steps.push(`Ackermann(${mValue}, ${nValue}) = ${result}`);
            notes.push(scale[result % scale.length]);
            return result;
        }

        if (nValue === 0) {
            steps.push(`Ackermann(${mValue}, ${nValue}) = Ackermann(${mValue - 1}, 1)`);
            const result = ackermann(mValue - 1, 1);
            notes.push(scale[result % scale.length]);
            return result;
        }

        steps.push(
            `Ackermann(${mValue}, ${nValue}) = Ackermann(${mValue - 1}, Ackermann(${mValue}, ${nValue - 1}))`
        );
        const innerResult = ackermann(mValue, nValue - 1);
        const result = ackermann(mValue - 1, innerResult);
        notes.push(scale[result % scale.length]);
        return result;
    }

    const result = ackermann(m, n);
    steps.push(`Ackermann(${m}, ${n}) = ${result}`);
    notes.push(scale[result % scale.length]);

    return { notes, steps };
}
