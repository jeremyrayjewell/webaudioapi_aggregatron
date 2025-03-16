export function getFibonacciData(scale, n) {
    let notes = [];
    let steps = [];

    function fibonacci(num) {
        if (num <= 1) {
            steps.push(`Fibonacci(${num}) = ${num}`);
            notes.push(scale[num % scale.length]);
            return num;
        }
        steps.push(`Fibonacci(${num}) = Fibonacci(${num - 1}) + Fibonacci(${num - 2})`);
        const result = fibonacci(num - 1) + fibonacci(num - 2);
        notes.push(scale[result % scale.length]);
        return result;
    }

    const result = fibonacci(n);
    steps.push(`Fibonacci(${n}) = ${result}`);
    return { notes, steps };
}

export function getSubsetSumData(scale, targetSum) {
    let notes = [];
    let steps = [];

    function subsetSum(arr, n, sum) {
        if (sum === 0) {
            steps.push(`SubsetSum: Found a subset with sum ${targetSum}`);
            return true;
        }
        if (n === 0 && sum !== 0) {
            return false;
        }
        if (arr[n - 1] > sum) {
            return subsetSum(arr, n - 1, sum);
        }
        const include = subsetSum(arr, n - 1, sum - arr[n - 1]);
        const exclude = subsetSum(arr, n - 1, sum);
        steps.push(`SubsetSum: Checking element ${arr[n - 1]} with sum ${sum}`);
        notes.push(arr[n - 1]);
        return include || exclude;
    }

    const result = subsetSum(scale, scale.length, targetSum);
    steps.push(`SubsetSum: ${result ? "Found" : "Did not find"} a subset with sum ${targetSum}`);
    return { notes, steps };
}