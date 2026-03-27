import { chunkEvents } from "./streaming.js";

function* derangementEvents(scale, maxPermutations = 300) {
    const maxElements = 6;
    const n = Math.min(scale.length, maxElements);
    const workingScale = scale.slice(0, n);

    if (n < 2) {
        yield {
            note: null,
            step: "Derangement: Need at least 2 elements to create a derangement.",
        };
        return;
    }

    let permutationCount = 0;
    const used = Array(n).fill(false);
    const current = [];

    function* generate() {
        if (permutationCount >= maxPermutations) return;

        if (current.length === n) {
            permutationCount++;
            yield {
                note: null,
                step: `Found derangement #${permutationCount}: [${current.join(", ")}]`,
            };
            for (const index of current) {
                yield { note: workingScale[index] };
            }
            return;
        }

        for (let i = 0; i < n; i++) {
            if (used[i] || i === current.length) continue;
            used[i] = true;
            current.push(i);
            yield* generate();
            current.pop();
            used[i] = false;
        }
    }

    yield* generate();

    if (permutationCount === 0) {
      yield { note: null, step: "No derangements found within limits" };
      for (const freq of workingScale) {
          yield { note: freq };
      }
    }

    yield { note: null, step: `Total derangements found: ${permutationCount}` };
}

export function getDerangementData(scale, maxPermutations = 300) {
    return {
        notes: [],
        steps: [],
        stream: chunkEvents(derangementEvents(scale, maxPermutations)),
    };
}
