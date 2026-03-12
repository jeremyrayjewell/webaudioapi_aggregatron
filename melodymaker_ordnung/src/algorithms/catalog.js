const sortAware = (sortOrder, ascendingLines, descendingLines) =>
  sortOrder === "descending" ? descendingLines : ascendingLines;

export const COMPLEXITY_TABS = [
  { id: "constant", navLabel: "O(1)", title: "01. O(1) Constant" },
  { id: "doublelogarithmic", navLabel: "O(log log n)", title: "02. O(log log n) Double Logarithmic" },
  { id: "logarithmic", navLabel: "O(log n)", title: "03. O(log n) Logarithmic" },
  { id: "polylogarithmic", navLabel: "O((log n)^2)", title: "04. O((log n)^2) Polylogarithmic" },
  { id: "sublinear", navLabel: "O(sqrt(n))", title: "05. O(sqrt(n)) Sublinear" },
  { id: "linear", navLabel: "O(n)", title: "06. O(n) Linear" },
  { id: "linearithmic", navLabel: "O(n log n)", title: "07. O(n log n) Linearithmic" },
  { id: "quadratic", navLabel: "O(n^2)", title: "08. O(n^2) Quadratic" },
  { id: "cubic", navLabel: "O(n^3)", title: "09. O(n^3) Cubic" },
  { id: "polynomial", navLabel: "O(n^k)", title: "10. O(n^k) Polynomial" },
  { id: "exponential", navLabel: "O(2^n)", title: "11. O(2^n) Exponential" },
  { id: "exponentialBaseC", navLabel: "O(c^n), c>2", title: "12. O(c^n) Exponential Base C" },
  { id: "factorial", navLabel: "O(n!)", title: "13. O(n!) Factorial" },
  { id: "subfactorial", navLabel: "O(n!/k^n)", title: "14. O(n!/k^n) Subfactorial" },
  { id: "ackermann", navLabel: "O(A(n, n))", title: "15. O(A(n,n)) Ackermann" },
  { id: "doubleExponential", navLabel: "O(2^(2^n))", title: "16. O(2^(2^n)) Double Exponential" },
];

export const ALGORITHM_CATALOG = {
  accessElement: {
    id: "accessElement",
    tab: "constant",
    buttonLabel: "Access Element",
    description: "Direct array indexing with constant time complexity.",
    setupName: "Access Element (canonical O(1))",
    pseudocode: ["index <- random()", "return A[index]"],
    source: [
      "for (let i = 0; i < numNotes; i++) {",
      "  const index = Math.floor(Math.random() * scale.length);",
      "  notes.push(scale[index]);",
      "}",
    ],
    highlightLine: () => 1,
  },
  parityCheck: {
    id: "parityCheck",
    tab: "constant",
    buttonLabel: "Parity Check",
    description: "Constant-time parity test on an integer index.",
    setupName: "Parity Check (canonical O(1))",
    pseudocode: ["index <- random()", "if index mod 2 matches filter", "  emit A[index]", "else emit rest"],
    source: [
      "for (let i = 0; i < numNotes; i++) {",
      "  const index = Math.floor(Math.random() * scale.length);",
      "  const isEvenIndex = index % 2 === 0;",
      "  notes.push(matchesCriteria ? scale[index] : null);",
      "}",
    ],
    highlightLine: (step) => (step.includes("rest") ? 3 : 2),
  },
  firstElement: {
    id: "firstElement",
    tab: "constant",
    buttonLabel: "First Element",
    description: "Immediately access the first element of an array.",
    setupName: "First Element (canonical O(1))",
    pseudocode: ["return A[0]"],
    source: ["if (scale.length === 0) return;", "const element = scale[0];", "notes.push(element);"],
    highlightLine: () => 0,
  },
  interpolationSearch: {
    id: "interpolationSearch",
    tab: "doublelogarithmic",
    buttonLabel: "Interpolation Search",
    description: "Canonical average-case O(log log n) search on sorted, near-uniform data.",
    setupName: "Interpolation Search (average canonical O(log log n))",
    pseudocode: ["low <- 0", "high <- n - 1", "while low <= high and target in range", "  pos <- low + ((target - A[low]) * (high - low)) / (A[high] - A[low])", "  if A[pos] == target return pos", "  if A[pos] < target low <- pos + 1", "  else high <- pos - 1"],
    source: [
      "const sortedScale = [...scale].sort((a, b) => a - b);",
      "let low = 0;",
      "let high = sortedScale.length - 1;",
      "while (low <= high && target >= sortedScale[low] && target <= sortedScale[high]) {",
      "  const pos = low + Math.floor(((target - sortedScale[low]) * (high - low)) / Math.max(1, sortedScale[high] - sortedScale[low]));",
      "  notes.push(sortedScale[pos]);",
      "}",
    ],
    highlightLine: (step) => (step.includes("pos=") ? 3 : step.includes("Found target") ? 4 : 5),
  },
  binarySearch: {
    id: "binarySearch",
    tab: "logarithmic",
    buttonLabel: "Binary Search",
    description: "Divide a sorted array in half repeatedly to find a target value.",
    setupName: "Binary Search (canonical O(log n))",
    pseudocode: ({ sortOrder }) =>
      sortAware(
        sortOrder,
        ["function binarySearch(sortedA, target)", "  left <- 0", "  right <- len(sortedA) - 1", "  while left <= right", "    mid <- floor((left + right) / 2)", "    if sortedA[mid] == target return mid", "    if sortedA[mid] < target left <- mid + 1", "    else right <- mid - 1", "  return not_found"],
        ["function binarySearch(sortedA, target)", "  left <- 0", "  right <- len(sortedA) - 1", "  while left <= right", "    mid <- floor((left + right) / 2)", "    if sortedA[mid] == target return mid", "    if sortedA[mid] > target left <- mid + 1", "    else right <- mid - 1", "  return not_found"]
      ),
    source: ({ sortOrder }) =>
      sortAware(
        sortOrder,
        [
          "const sortedScale = [...scale].sort((a, b) => a - b);",
          "let left = 0;",
          "let right = sortedScale.length - 1;",
          "while (left <= right) {",
          "  const mid = Math.floor((left + right) / 2);",
          "  if (sortedScale[mid] < target) left = mid + 1;",
          "  else right = mid - 1;",
          "}",
        ],
        [
          "const sortedScale = [...scale].sort((a, b) => b - a);",
          "let left = 0;",
          "let right = sortedScale.length - 1;",
          "while (left <= right) {",
          "  const mid = Math.floor((left + right) / 2);",
          "  if (sortedScale[mid] > target) left = mid + 1;",
          "  else right = mid - 1;",
          "}",
        ]
      ),
    highlightLine: (step) => (step.includes("mid=") ? 4 : step.includes("Found target") ? 5 : 3),
  },
  exponentiationBySquaring: {
    id: "exponentiationBySquaring",
    tab: "logarithmic",
    buttonLabel: "Exponentiation by Squaring",
    description: "Efficiently compute large powers by squaring.",
    setupName: "Exponentiation by Squaring (canonical O(log n))",
    pseudocode: ["function pow(x, n)", "  if n == 0 return 1", "  if n < 0 return 1 / pow(x, -n)", "  if n is even", "    half <- pow(x, n / 2)", "    return half * half", "  return x * pow(x, n - 1)"],
    source: ["function exponentiationBySquaring(index, n) {", "  if (n === 0) return 1;", "  if (n % 2 === 0) {", "    const halfPower = exponentiationBySquaring(index, n / 2);", "    return halfPower * halfPower;", "  }", "  return scale[index] * exponentiationBySquaring(index, n - 1);", "}"],
    highlightLine: (step) => (step.includes("Base case") ? 1 : step.includes("Even exponent") ? 3 : step.includes("Odd exponent") ? 6 : 5),
  },
  euclideanAlgorithm: {
    id: "euclideanAlgorithm",
    tab: "logarithmic",
    buttonLabel: "Euclidean Algorithm",
    description: "Compute the greatest common divisor by repeated remainder reduction.",
    setupName: "Euclidean Algorithm (canonical O(log n))",
    pseudocode: ["function gcd(a, b)", "  while b != 0", "    temp <- a mod b", "    a <- b", "    b <- temp", "  return a"],
    source: ["let a = scale[0];", "let b = scale[Math.min(1, scale.length - 1)] || 1;", "while (b !== 0) {", "  const remainder = a % b;", "  a = b;", "  b = remainder;", "}"],
    highlightLine: (step) => (step.includes("gcd=") ? 5 : 2),
  },
  binaryHeapInsert: {
    id: "binaryHeapInsert",
    tab: "logarithmic",
    buttonLabel: "Binary Heap Insert",
    description: "Insert into a max-heap and bubble upward until the heap invariant is restored.",
    setupName: "Binary Heap Insert (canonical O(log n))",
    pseudocode: ["build max_heap(A)", "append x to heap", "i <- last index", "while i > 0 and heap[parent(i)] < heap[i]", "  swap heap[parent(i)], heap[i]", "  i <- parent(i)"],
    source: ["const heap = buildMaxHeap(initialValues);", "heap.push(value);", "while (index > 0) {", "  if (heap[parent] >= heap[index]) break;", "  [heap[parent], heap[index]] = [heap[index], heap[parent]];", "  index = parent;", "}"],
    highlightLine: (step) => (step.includes("swap") ? 4 : step.includes("compare") ? 3 : 1),
  },
  heapRootPath: {
    id: "heapRootPath",
    tab: "logarithmic",
    buttonLabel: "Heap Root Path",
    description: "Follow parent indices from a node in an implicit binary heap array back to the root.",
    setupName: "Heap Root Path (canonical O(log n))",
    pseudocode: ["heap <- build max_heap(A)", "i <- chosen node index", "while i >= 0", "  visit heap[i]", "  if i == 0 break", "  i <- parent(i)"],
    source: ["const heap = buildMaxHeap(values);", "let index = heap.length - 1;", "while (index > 0) {", "  visit(heap[index]);", "  index = Math.floor((index - 1) / 2);", "}", "visit(heap[0]);"],
    highlightLine: () => 3,
  },
  fenwick2d: {
    id: "fenwick2d",
    tab: "polylogarithmic",
    buttonLabel: "2D Fenwick Tree Query",
    description: "Query a 2D Binary Indexed Tree in O(log^2 n).",
    setupName: "2D Fenwick Tree Query (canonical O((log n)^2))",
    pseudocode: ["sum <- 0", "for x <- row downto 0 by lowbit(x)", "  for y <- col downto 0 by lowbit(y)", "    sum <- sum + tree[x][y]", "return sum"],
    source: ["const bit = Array.from({ length: side + 1 }, () => Array(side + 1).fill(0));", "for (let row = 0; row < side; row++) {", "  for (let col = 0; col < side; col++) update(row + 1, col + 1, matrix[row][col]);", "}", "for (let row = targetRow; row > 0; row -= row & -row) {", "  for (let col = targetCol; col > 0; col -= col & -col) {", "    sum += bit[row][col];", "  }", "}"],
    highlightLine: () => 2,
  },
  sqrtDecomposition: {
    id: "sqrtDecomposition",
    tab: "sublinear",
    buttonLabel: "Sqrt Decomposition Query",
    description: "Answer a range query using sqrt decomposition blocks.",
    setupName: "Sqrt Decomposition Query (canonical O(sqrt(n)))",
    pseudocode: ["build sqrt-sized blocks", "sum <- 0", "while index <= right", "  if full block fits use block sum", "  else add A[index]", "return sum"],
    source: ["const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));", "for (let i = 0; i < n; i++) blocks[Math.floor(i / blockSize)] += scale[i];", "while (index <= right) {", "  if (index % blockSize === 0 && index + blockSize - 1 <= right) use block;", "  else use single value;", "}"],
    highlightLine: (step) => (step.includes("block=") ? 3 : step.includes("rangeSum") ? 5 : 4),
  },
  jumpSearch: {
    id: "jumpSearch",
    tab: "sublinear",
    buttonLabel: "Jump Search",
    description: "Canonical sublinear search by jumping ahead in sqrt(n)-sized blocks.",
    setupName: "Jump Search (canonical O(sqrt(n)))",
    pseudocode: ({ sortOrder }) =>
      sortAware(
        sortOrder,
        ["step <- floor(sqrt(n))", "prev <- 0", "while A[min(step,n)-1] < target", "  prev <- step", "  step <- step + floor(sqrt(n))", "while A[prev] < target", "  prev <- prev + 1", "if A[prev] == target return prev"],
        ["step <- floor(sqrt(n))", "prev <- 0", "while A[min(step,n)-1] > target", "  prev <- step", "  step <- step + floor(sqrt(n))", "while A[prev] > target", "  prev <- prev + 1", "if A[prev] == target return prev"]
      ),
    source: ({ sortOrder }) =>
      sortAware(
        sortOrder,
        ["const sortedScale = [...scale].sort((a, b) => a - b);", "const jumpSize = Math.max(1, Math.floor(Math.sqrt(n)));", "let step = jumpSize;", "let prev = 0;", "while (sortedScale[Math.min(step, n) - 1] < target) {", "  prev = step;", "  step += jumpSize;", "}", "while (prev < Math.min(step, n) && sortedScale[prev] < target) prev++;"],
        ["const sortedScale = [...scale].sort((a, b) => b - a);", "const jumpSize = Math.max(1, Math.floor(Math.sqrt(n)));", "let step = jumpSize;", "let prev = 0;", "while (sortedScale[Math.min(step, n) - 1] > target) {", "  prev = step;", "  step += jumpSize;", "}", "while (prev < Math.min(step, n) && sortedScale[prev] > target) prev++;"]
      ),
    highlightLine: (step) => (step.includes("Jumping") ? 2 : step.includes("Linear search") ? 5 : 7),
  },
  linearSearch: {
    id: "linearSearch", tab: "linear", buttonLabel: "Linear Search", description: "Sequentially check each element in a collection.", setupName: "Linear Search (canonical O(n))",
    pseudocode: ["for i <- 0 to n - 1", "  if A[i] == target", "    return i", "return not_found"],
    source: ["const target = scale[scale.length - 1];", "for (let i = 0; i < scale.length; i++) {", "  notes.push(scale[i]);", "  if (scale[i] === target) break;", "}"],
    highlightLine: (step) => (step.includes("Found target") ? 2 : 1),
  },
  sumOfElements: {
    id: "sumOfElements", tab: "linear", buttonLabel: "Sum of Elements", description: "Add up all elements in an array.", setupName: "Sum of Elements (canonical O(n))",
    pseudocode: ["sum <- 0", "for each value in A", "  sum <- sum + value", "return sum"],
    source: ["let sum = 0;", "for (let i = 0; i < scale.length; i++) {", "  sum += scale[i];", "  notes.push(scale[i]);", "}"],
    highlightLine: (step) => (step.includes("Final sum") ? 3 : 2),
  },
  findMaximum: {
    id: "findMaximum", tab: "linear", buttonLabel: "Find Maximum", description: "Scan through array once to find highest value.", setupName: "Find Maximum (canonical O(n))",
    pseudocode: ["max <- A[0]", "for i <- 1 to n - 1", "  if A[i] > max", "    max <- A[i]", "return max"],
    source: ["let max = scale[0];", "for (let i = 1; i < scale.length; i++) {", "  if (scale[i] > max) max = scale[i];", "  notes.push(scale[i]);", "}"],
    highlightLine: (step) => (step.includes("Initialize") ? 0 : step.includes("New max") ? 3 : 2),
  },
  countOccurrences: {
    id: "countOccurrences", tab: "linear", buttonLabel: "Count Occurrences", description: "Count how many times a value appears in array.", setupName: "Count Occurrences (canonical O(n))",
    pseudocode: ["count <- 0", "for each value in A", "  if value == target", "    count <- count + 1", "return count"],
    source: ["let count = 0;", "for (let i = 0; i < scale.length; i++) {", "  if (scale[i] === target) count++;", "  notes.push(scale[i]);", "}"],
    highlightLine: (step) => (step.includes("Match found") ? 3 : 2),
  },
  mergeSort: {
    id: "mergeSort", tab: "linearithmic", buttonLabel: "Merge Sort", description: "Divide, sort, and merge approach.", setupName: "Merge Sort (canonical O(n log n))", supportsResort: true,
    pseudocode: ({ sortOrder }) => sortAware(sortOrder, ["function mergeSort(A)", "  if len(A) <= 1 return A", "  split A into left, right", "  left <- mergeSort(left)", "  right <- mergeSort(right)", "  return merge(left, right)"], ["function mergeSort(A)", "  if len(A) <= 1 return A", "  split A into left, right", "  left <- mergeSort(left)", "  right <- mergeSort(right)", "  return merge_desc(left, right)"]),
    source: ["function mergeSortRecursive(arr) {", "  if (arr.length <= 1) return arr;", "  const leftSorted = mergeSortRecursive(leftPart);", "  const rightSorted = mergeSortRecursive(rightPart);", "  return merge(leftSorted, rightSorted);", "}"],
    highlightLine: (step) => (step.includes("Split") ? 2 : step.includes("Merge") ? 5 : 4),
  },
  heapSort: {
    id: "heapSort", tab: "linearithmic", buttonLabel: "Heap Sort", description: "Sort using a binary heap data structure.", setupName: "Heap Sort (canonical O(n log n))", supportsResort: true,
    pseudocode: ({ sortOrder }) => sortAware(sortOrder, ["build max_heap(A)", "for end <- n-1 down to 1", "  swap A[0], A[end]", "  heapify(A, 0, end)"], ["build min_heap(A)", "for end <- n-1 down to 1", "  swap A[0], A[end]", "  heapify(A, 0, end)"]),
    source: ["function heapSort(arr) {", "  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);", "  for (let i = n - 1; i > 0; i--) {", "    [arr[0], arr[i]] = [arr[i], arr[0]];", "    heapify(arr, i, 0);", "  }", "}"],
    highlightLine: (step) => (step.includes("Swap") ? 2 : 1),
  },
  quickSort: {
    id: "quickSort", tab: "linearithmic", buttonLabel: "Quick Sort", description: "Partition and conquer sorting algorithm.", setupName: "Quick Sort (canonical O(n log n))", supportsResort: true,
    pseudocode: ({ sortOrder }) => sortAware(sortOrder, ["function quickSort(A, low, high)", "  if low < high", "    pivot <- partition(A)", "    quickSort(left part)", "    quickSort(right part)"], ["function quickSort(A, low, high)", "  if low < high", "    pivot <- partition_desc(A)", "    quickSort(left part)", "    quickSort(right part)"]),
    source: ["function partition(arr, low, high) {", "  let pivot = arr[high];", "  for (let j = low; j < high; j++) {", "    if (shouldMoveLeft(arr[j], pivot)) swap;", "  }", "}"],
    highlightLine: (step) => (step.includes("Swap") ? 2 : 1),
  },
  bubbleSort: {
    id: "bubbleSort", tab: "quadratic", buttonLabel: "Bubble Sort", description: "Repeatedly swap adjacent elements if they are in wrong order.", setupName: "Bubble Sort (canonical O(n^2))", supportsResort: true,
    pseudocode: ({ sortOrder }) => sortAware(sortOrder, ["for i <- 0 to n - 2", "  for j <- 0 to n - i - 2", "    if A[j] > A[j+1]", "      swap A[j], A[j+1]"], ["for i <- 0 to n - 2", "  for j <- 0 to n - i - 2", "    if A[j] < A[j+1]", "      swap A[j], A[j+1]"]),
    source: ["for (let i = 0; i < n - 1; i++) {", "  for (let j = 0; j < n - i - 1; j++) {", "    if (outOfOrder(arr[j], arr[j + 1])) swap;", "  }", "}"],
    highlightLine: (step) => (step.includes("Swap") || step.includes("Move") ? 3 : 1),
  },
  selectionSort: {
    id: "selectionSort", tab: "quadratic", buttonLabel: "Selection Sort", description: "Find smallest element and place at the beginning.", setupName: "Selection Sort (canonical O(n^2))", supportsResort: true,
    pseudocode: ({ sortOrder }) => sortAware(sortOrder, ["for i <- 0 to n - 2", "  min <- i", "  for j <- i+1 to n-1", "    if A[j] < A[min] min <- j", "  swap A[i], A[min]"], ["for i <- 0 to n - 2", "  max <- i", "  for j <- i+1 to n-1", "    if A[j] > A[max] max <- j", "  swap A[i], A[max]"]),
    source: ["for (let i = 0; i < n - 1; i++) {", "  let selected = i;", "  for (let j = i + 1; j < n; j++) {", "    if (morePreferred(arr[j], arr[selected])) selected = j;", "  }", "}"],
    highlightLine: (step) => (step.includes("Swap") || step.includes("Move") ? 3 : 1),
  },
  insertionSort: {
    id: "insertionSort", tab: "quadratic", buttonLabel: "Insertion Sort", description: "Build sorted array one element at a time.", setupName: "Insertion Sort (canonical O(n^2))", supportsResort: true,
    pseudocode: ({ sortOrder }) => sortAware(sortOrder, ["for i <- 1 to n - 1", "  key <- A[i]", "  while j >= 0 and A[j] > key", "    A[j+1] <- A[j]", "  A[j+1] <- key"], ["for i <- 1 to n - 1", "  key <- A[i]", "  while j >= 0 and A[j] < key", "    A[j+1] <- A[j]", "  A[j+1] <- key"]),
    source: ["for (let i = 1; i < n; i++) {", "  const key = arr[i];", "  while (j >= 0 && outOfOrder(arr[j], key)) {", "    arr[j + 1] = arr[j];", "  }", "}"],
    highlightLine: (step) => (step.includes("Swap") || step.includes("Move") ? 3 : 1),
  },
  matrixMultiplication: {
    id: "matrixMultiplication", tab: "cubic", buttonLabel: "Matrix Multiplication", description: "Multiply two n x n matrices using the standard algorithm.", setupName: "Matrix Multiplication (canonical O(n^3))",
    pseudocode: ["for i <- 0 to n - 1", "  for j <- 0 to n - 1", "    for k <- 0 to n - 1", "      C[i][j] <- C[i][j] + A[i][k] * B[k][j]"],
    source: ["for (let i = 0; i < n; i++) {", "  for (let j = 0; j < n; j++) {", "    for (let k = 0; k < n; k++) {", "      result[i][j] += a[i][k] * b[k][j];", "    }", "  }", "}"],
    highlightLine: () => 3,
  },
  threeSum: {
    id: "threeSum", tab: "cubic", buttonLabel: "3-Sum Problem", description: "Find all triplets in an array that sum to a given value.", setupName: "3-Sum Problem (canonical O(n^3))",
    pseudocode: ["for i <- 0 to n - 3", "  for j <- i+1 to n - 2", "    for k <- j+1 to n - 1", "      if A[i] + A[j] + A[k] == target", "        return triplet"],
    source: ["for (let i = 0; i < n - 2; i++) {", "  for (let j = i + 1; j < n - 1; j++) {", "    for (let k = j + 1; k < n; k++) {", "      const sum = scale[i] + scale[j] + scale[k];", "      if (sum === target) return;", "    }", "  }", "}"],
    highlightLine: (step) => (step.includes("Found triplet") ? 4 : 3),
  },
  kCliqueSearch: {
    id: "kCliqueSearch", tab: "polynomial", buttonLabel: "k-Clique Search", description: "Brute-force search for a clique of fixed size k.", setupName: "k-Clique Search (canonical fixed-k O(n^k))",
    pseudocode: ["for each subset S of size k", "  if every pair in S has an edge", "    return clique", "return not_found"],
    source: ["for (const subset of choose(vertices, k)) {", "  if (isClique(subset, adjacency)) {", "    emit(subset);", "  }", "}"],
    highlightLine: (step) => (step.includes("clique") ? 1 : 2),
  },
  kSumEnumeration: {
    id: "kSumEnumeration", tab: "polynomial", buttonLabel: "k-SUM Search", description: "Enumerate all length-k tuples and test each one against a deterministic target sum.", setupName: "k-SUM Search (canonical fixed-k O(n^k))",
    pseudocode: ["target <- sum of first k values", "for each k-tuple of distinct indices", "  total <- sum of tuple values", "  emit tuple and total", "  if total == target emit solution"],
    source: ["const target = scale.slice(0, k).reduce((sum, value) => sum + value, 0);", "for (const tuple of choose(indices, k)) {", "  const total = tuple.reduce((sum, i) => sum + scale[i], 0);", "  emit(tuple, total);", "  if (total === target) emitSolution(tuple);", "}"],
    highlightLine: (step) => (step.includes("solution") ? 4 : 2),
  },
  fibonacci: {
    id: "fibonacci", tab: "exponential", buttonLabel: "Fibonacci (recursive)", description: "Calculate Fibonacci numbers using naive recursion.", setupName: "Fibonacci Sequence (canonical O(2^n))",
    pseudocode: ["function fib(n)", "  if n <= 1 return n", "  return fib(n-1) + fib(n-2)"],
    source: ["function fibonacci(num) {", "  if (num <= 1) return num;", "  const result = fibonacci(num - 1) + fibonacci(num - 2);", "  return result;", "}"],
    highlightLine: (step) => (step.includes("Fibonacci(") && step.includes("=") ? 2 : 1),
  },
  subsetSum: {
    id: "subsetSum", tab: "exponential", buttonLabel: "Subset Sum Problem", description: "Find if subset of elements sum to a specific value.", setupName: "Subset Sum Problem (canonical O(2^n))",
    pseudocode: ["function subsetSum(i, sum)", "  if sum == 0 return true", "  if i == 0 return false", "  include <- subsetSum(i-1, sum-A[i])", "  exclude <- subsetSum(i-1, sum)", "  return include or exclude"],
    source: ["function subsetSum(arr, n, sum) {", "  if (sum === 0) return true;", "  if (n === 0 && sum !== 0) return false;", "  return subsetSum(arr, n - 1, sum - arr[n - 1]) || subsetSum(arr, n - 1, sum);", "}"],
    highlightLine: (step) => (step.includes("Found") ? 5 : 4),
  },
  graph3Coloring: {
    id: "graph3Coloring", tab: "exponentialBaseC", buttonLabel: "Graph 3-Coloring", description: "Brute-force graph 3-coloring by trying 3 colors per vertex.", setupName: "Graph 3-Coloring (canonical O(3^n))",
    pseudocode: ["function color(vertex)", "  if vertex == n return success", "  for color <- 0 to 2", "    if safe(vertex, color)", "      assign color and recurse", "  return failure"],
    source: ["function colorVertex(vertex) {", "  for (let color = 0; color < 3; color++) {", "    if (isSafeColor(vertex, color, assignment)) recurse;", "  }", "}"],
    highlightLine: (step) => (step.includes("Assigned") ? 4 : 2),
  },
  threeWayPartition: {
    id: "threeWayPartition", tab: "exponentialBaseC", buttonLabel: "Three-Way Partition Search", description: "Enumerate bucket assignments and test whether all three bucket sums are equal. Input bounded to 5 items for interactive visualization.", setupName: "Three-Way Partition Search (bounded demo, actual growth O(3^n))",
    pseudocode: ["function assign(i)", "  if i == n", "    emit assignment and sums", "    if sumA == sumB and sumB == sumC emit solution", "  place A[i] in bucket 0 and recurse", "  place A[i] in bucket 1 and recurse", "  place A[i] in bucket 2 and recurse"],
    source: ["const n = Math.min(scale.length, 5);", "function assign(index) {", "  if (index === n) {", "    emit(assignment, sums);", "    if (sumA === sumB && sumB === sumC) emitSolution();", "    return;", "  }", "  for (let bucket = 0; bucket < 3; bucket++) assign(index + 1);", "}"],
    highlightLine: (step) => (step.includes("solution") ? 3 : 2),
  },
  travelingSalesman: {
    id: "travelingSalesman", tab: "factorial", buttonLabel: "Traveling Salesman [bounded]", description: "Canonical factorial exemplar, bounded and streamed for interactivity.", setupName: "Traveling Salesman Problem (bounded canonical O(n!))",
    pseudocode: ["best <- infinity", "limit cities to <= 6", "function search(route, visited, dist)", "  if route complete update best", "  for each unvisited city", "    search(route + city, visited, dist + edge)"],
    source: ["const maxCities = 6;", "const workingScale = scale.slice(0, Math.min(scale.length, maxCities));", "function findRoutes(route, visited, currentLength) {", "  if (route.length === n) { update best route; return; }", "  for (let nextCity = 0; nextCity < n; nextCity++) {", "    if (!visited[nextCity]) findRoutes(...);", "  }", "}"],
    highlightLine: (step) => (step.includes("best route") ? 2 : 4),
  },
  derangement: {
    id: "derangement", tab: "subfactorial", buttonLabel: "Derangement Problem [bounded]", description: "Canonical subfactorial exemplar, bounded and streamed for interactivity. Demo caps n at 6 and enumeration at 300 permutations.", setupName: "Derangement Problem (bounded demo; n <= 6, max 300 permutations, actual growth O(n!/k^n))",
    pseudocode: ["n <- min(inputN, 6)  // interactive bound", "function generate(pos)", "  if pos == n emit derangement", "  for each unused value", "    if value != pos", "      place value and recurse", "stop after 300 emitted permutations"],
    source: ["const n = Math.min(scale.length, 6);", "if (permutationCount >= 300) return;", "function generate() {", "  if (current.length === n) emit derangement;", "  for (let i = 0; i < n; i++) {", "    if (!used[i] && i !== current.length) recurse;", "  }", "}"],
    highlightLine: (step) => (step.includes("Found derangement") ? 1 : 4),
  },
  ackermann: {
    id: "ackermann", tab: "ackermann", buttonLabel: "Ackermann Function", description: "A recursively defined function that grows extremely quickly. Demo inputs are fixed to m = 2, n = 2 for visualization.", setupName: "Ackermann Function (demo inputs fixed to m = 2, n = 2; actual growth O(A(n, n)))",
    pseudocode: ["m <- 2, n <- 2  // demo inputs", "function A(m, n)", "  if m == 0 return n + 1", "  if n == 0 return A(m - 1, 1)", "  return A(m - 1, A(m, n - 1))"],
    source: ["const m = 2;", "const n = 2;", "function ackermann(mValue, nValue) {", "  if (mValue === 0) return nValue + 1;", "  if (nValue === 0) return ackermann(mValue - 1, 1);", "  const innerResult = ackermann(mValue, nValue - 1);", "  return ackermann(mValue - 1, innerResult);", "}"],
    highlightLine: (step) => (step.includes("Ackermann(0") ? 1 : step.includes(", 0)") ? 2 : 3),
  },
  booleanFunctionEnumeration: {
    id: "booleanFunctionEnumeration", tab: "doubleExponential", buttonLabel: "Boolean Function Enumeration", description: "Enumerate all Boolean functions on n variables via truth tables of length 2^n. Input bounded to n <= 3 for interactive visualization.", setupName: "Boolean Function Enumeration (bounded demo, actual growth O(2^(2^n)))",
    pseudocode: ["n <- min(inputN, 3)  // interactive bound", "truthTableLength <- 2^n", "for each bit pattern of length truthTableLength", "  emit one boolean function", "return all functions"],
    source: ["const variableCount = Math.max(1, Math.min(n, 3));", "const truthTableLength = Math.pow(2, variableCount);", "function enumerate(position) {", "  if (position === truthTableLength) { emit(outputs); return; }", "  outputs[position] = 0; enumerate(position + 1);", "  outputs[position] = 1; enumerate(position + 1);", "}"],
    highlightLine: (step) => (step.includes("truth table") ? 2 : 1),
  },
};

export const ALGORITHMS_BY_TAB = COMPLEXITY_TABS.reduce((groups, tab) => {
  groups[tab.id] = Object.values(ALGORITHM_CATALOG).filter((algorithm) => algorithm.tab === tab.id);
  return groups;
}, {});

export function resolveAlgorithmLines(definition, context) {
  if (typeof definition === "function") {
    return definition(context);
  }
  return definition || [];
}
