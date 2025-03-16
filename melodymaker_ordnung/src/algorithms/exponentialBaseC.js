export function getTowersOfHanoiData(scale, n) {
    let notes = [];
    let steps = [];

    function hanoi(n, from, to, aux) {
        if (n === 0) {
            return;
        }
        hanoi(n - 1, from, aux, to);
        steps.push(`Move disk ${n} from ${from} to ${to}`);
        notes.push(scale[n % scale.length]);
        hanoi(n - 1, aux, to, from);
    }

    hanoi(n, 'A', 'C', 'B');
    return { notes, steps };
}

export function getPermutationsData(scale, maxPermutations = 1000) {
    let notes = [];
    let steps = [];
    let permutationCount = 0;

    function permute(arr, l, r) {
        if (l === r) {
            steps.push(`Permutation: [${arr.join(", ")}]`);
            arr.forEach((val) => notes.push(scale[val % scale.length]));
            permutationCount++;
            if (permutationCount >= maxPermutations) {
                throw new Error("Max permutations limit reached");
            }
        } else {
            for (let i = l; i <= r; i++) {
                [arr[l], arr[i]] = [arr[i], arr[l]];
                permute(arr, l + 1, r);
                [arr[l], arr[i]] = [arr[i], arr[l]]; // backtrack
            }
        }
    }

    const n = scale.length;
    const arr = Array.from({ length: n }, (_, i) => i);
    try {
        permute(arr, 0, n - 1);
    } catch (error) {
        steps.push(error.message);
    }
    return { notes, steps };
}