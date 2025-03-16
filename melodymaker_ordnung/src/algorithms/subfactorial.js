export function getDerangementData(scale, maxPermutations = 300) {
    let notes = [];
    let steps = [];
    let permutationCount = 0;

    // Limit input size to prevent freezing
    const maxElements = 6;
    const n = Math.min(scale.length, maxElements);
    const workingScale = scale.slice(0, n);

    if (n < 2) {
        steps.push("Derangement: Need at least 2 elements to create a derangement.");
        return { notes, steps };
    }

    function isDerangement(perm) {
        for (let i = 0; i < perm.length; i++) {
            if (perm[i] === i) return false;
        }
        return true;
    }

    function generateDerangement(arr, used, current) {
        // Stop if we've generated enough permutations
        if (permutationCount >= maxPermutations) {
            return;
        }

        if (current.length === arr.length) {
            if (isDerangement(current)) {
                permutationCount++;
                steps.push(`Found derangement #${permutationCount}: [${current.join(", ")}]`);
                
                // Add notes for the derangement
                current.forEach(index => {
                    notes.push(workingScale[index]);
                });
            }
            return;
        }

        for (let i = 0; i < arr.length; i++) {
            if (!used[i] && i !== current.length) {  // i !== current.length ensures no element in original position
                used[i] = true;
                current.push(i);
                generateDerangement(arr, used, current);
                current.pop();
                used[i] = false;
            }
        }
    }

    // Initialize arrays for tracking used elements and current permutation
    const used = Array(n).fill(false);
    const current = [];

    // Generate derangements
    generateDerangement(Array.from({length: n}, (_, i) => i), used, current);

    if (permutationCount === 0) {
        steps.push("No derangements found within limits");
        // Add some notes anyway so we have audio output
        workingScale.forEach(freq => notes.push(freq));
    }

    steps.push(`Total derangements found: ${permutationCount}`);
    return { notes, steps };
}