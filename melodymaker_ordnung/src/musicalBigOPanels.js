import { resolveAlgorithmLines } from "./algorithms/catalog.js";

export function formatStepAsPseudocode(rawStep) {
  if (!rawStep) return "";

  const step = rawStep.trim();

  const directPatterns = [
    [/^BinarySearch: left=(\d+), right=(\d+), mid=(\d+)$/, "mid <- floor((left + right) / 2)  // left=$1 right=$2 mid=$3"],
    [/^LinearSearch: i=(\d+), freq=([\d.]+)$/, "visit A[$1]  // freq=$2"],
    [/^Summation: i=(\d+), freq=([\d.]+), runningSum=([\d.]+)$/, "sum <- sum + A[$1]  // freq=$2 total=$3"],
    [/^Initialize maxVal=([\d.]+)$/, "max <- A[0]  // $1"],
    [/^Compare maxVal=([\d.]+) with scale\[(\d+)\]=([\d.]+)$/, "if A[$2] > max  // max=$1 value=$3"],
    [/^New max => ([\d.]+)$/, "max <- current  // $1"],
    [/^CountOccurrences: i=(\d+), freq=([\d.]+)$/, "if A[$1] == target  // freq=$2"],
    [/^Match found => count=(\d+)$/, "count <- count + 1  // count=$1"],
    [/^JumpSearch: Jumping from index (\d+) to (\d+)$/, "block <- block + sqrt(n)  // $1 -> $2"],
    [/^JumpSearch: Linear search at index (\d+)$/, "scan block at i=$1"],
    [/^JumpSearch: Found target ([\d.]+) Hz at index (\d+)$/, "return i  // target=$1 index=$2"],
    [/^HeapInsert: append value=([\d.]+) at index=(\d+)$/, "heap[i] <- x  // value=$1 index=$2"],
    [/^HeapInsert: compare parent=(\d+) \(([\d.]+)\) with child=(\d+) \(([\d.]+)\)$/, "if heap[parent($3)] < heap[$3]  // p=$1:$2 c=$3:$4"],
    [/^HeapInsert: swap parent=(\d+) \(([\d.]+)\) with child=(\d+) \(([\d.]+)\)$/, "swap(heap[$1], heap[$3])"],
    [/^HeapInsert: settled at index=(\d+)$/, "heap invariant restored at i=$1"],
    [/^HeapInsert: settled at root$/, "heap invariant restored at root"],
    [/^HeapPath: visit index=(\d+), value=([\d.]+)$/, "visit heap[$1]  // $2"],
    [/^KSum: tuple=\[(.*)\], sum=([\d.]+)$/, "emit tuple($1)  // total=$2"],
    [/^KSum: solution #(\d+) tuple=\[(.*)\], sum=([\d.]+)$/, "emitSolution(tuple=$2)  // #$1 total=$3"],
    [/^ThreeWayPartition: assignment=\[(.*)\], sums=\[(.*)\]$/, "emit assignment($1)  // sums=$2"],
    [/^ThreeWayPartition: solution #(\d+) assignment=\[(.*)\]$/, "emitSolution(assignment=$2)  // #$1"],
    [/^Log Div: duration=(\d+), nextNoteIndex=(\d+)$/, "duration <- floor(duration / 2)  // duration=$1 idx=$2"],
    [/^IterativeLog: index=(\d+) => freq ([\d.]+)$/, "i <- i * 2  // i=$1 freq=$2"],
    [/^ReverseLogWalk: index=(\d+) => freq ([\d.]+)$/, "i <- floor(i / 2)  // i=$1 freq=$2"],
    [/^RepeatedLogReduction: outer=(\d+), inner=(\d+), element=([\d.]+) Hz$/, "for log_i in 0..log n; for log_j in 0..log n  // o=$1 i=$2 val=$3"],
    [/^RepeatedHalving: size=(\d+), element=([\d.]+) Hz$/, "size <- floor(sqrt(size))  // size=$1 val=$2"],
    [/^Swap: ([\d.]+) with ([\d.]+)$/, "swap(x, y)  // $1 <-> $2"],
    [/^Compare: ([\d.]+) and ([\d.]+)$/, "if left > right  // $1 vs $2"],
    [/^Insert: ([\d.]+)$/, "key <- A[i]  // $1"],
    [/^Move: ([\d.]+) to position (\d+)$/, "A[$2] <- A[$2 - 1]  // $1"],
    [/^Split: left=\[(.*)\], right=\[(.*)\]$/, "split(A) -> left, right"],
    [/^Merge: \[(.*)\] \+ \[(.*)\] => \[(.*)\]$/, "merge(left, right)"],
    [/^Consider: \[([\d.]+)\] from (left|right)$/, "take next from $2  // $1"],
    [/^Multiplying A\[(\d+)\]\[(\d+)\] \* B\[(\d+)\]\[(\d+)\] and adding to result\[(\d+)\]\[(\d+)\]$/, "C[$5][$6] <- C[$5][$6] + A[$1][$2] * B[$3][$4]"],
    [/^Checking triplet: ([\d.]+), ([\d.]+), ([\d.]+) \(sum: ([\d.]+)\)$/, "if A[i] + A[j] + A[k] == target  // sum=$4"],
    [/^KNestedLoops: tuple=\[(.*)\] => \[(.*)\]$/, "visit tuple($1)"],
    [/^KTuples: indices=\[(.*)\] => \[(.*)\]$/, "emit tuple($1)"],
    [/^TernaryRecursion: expand level=(\d+)$/, "recurse3(level=$1)"],
    [/^TernaryRecursion: base case$/, "return"],
    [/^Base3Strings: digits=\[(.*)\] => \[(.*)\]$/, "emit base3_string($1)"],
    [/^Found derangement #(\d+): \[(.*)\]$/, "emit derangement  // #$1"],
    [/^Ackermann\((\d+), (\d+)\) = Ackermann\((\d+), Ackermann\((\d+), (\d+)\)\)$/, "return A($3, A($4, $5))"],
    [/^Ackermann\((\d+), (\d+)\) = Ackermann\((\d+), 1\)$/, "return A($3, 1)"],
    [/^Ackermann\((\d+), (\d+)\) = (\d+)$/, "return $3"],
    [/^DoubleExponential: Enumerating all binary strings of length 2\^(\d+) = (\d+)$/, "length <- 2^$1  // $2"],
    [/^DoubleExponential: bits=\[(.*)\]$/, "emit binary_string($1)"],
  ];

  for (const [pattern, replacement] of directPatterns) {
    if (pattern.test(step)) {
      return step.replace(pattern, replacement);
    }
  }

  if (step.startsWith("Base case:")) {
    return step.replace("Base case:", "return").replace(" = ", "  // ");
  }
  if (step.startsWith("Even exponent:")) {
    return step.replace("Even exponent:", "").trim();
  }
  if (step.startsWith("Odd exponent:")) {
    return step.replace("Odd exponent:", "").trim();
  }
  if (step.startsWith("Intermediate result:")) {
    return step.replace("Intermediate result:", "value <-").trim();
  }
  if (step.startsWith("Result:")) {
    return step.replace("Result:", "return").trim();
  }
  if (step.startsWith("Found target")) {
    return `return target  // ${step}`;
  }
  if (step.startsWith("Final sum")) {
    return step.replace("Final sum", "return sum");
  }
  if (step.startsWith("Maximum is")) {
    return step.replace("Maximum is", "return max");
  }
  if (step.startsWith("No ") || step.includes("not found") || step.includes("empty")) {
    return `// ${step}`;
  }

  return `// ${step}`;
}

export function getAlgorithmPseudocode(algorithmMeta, sortOrder) {
  if (!algorithmMeta) {
    return ["function algorithm(...)", "  // pseudocode unavailable", "  // trace shown at right"];
  }
  return resolveAlgorithmLines(algorithmMeta.pseudocode, { sortOrder });
}

export function getAlgorithmSource(algorithmMeta, sortOrder) {
  if (!algorithmMeta) {
    return ["// implementation source unavailable"];
  }
  return resolveAlgorithmLines(algorithmMeta.source, { sortOrder });
}

export function getHighlightedPseudocodeLine(algorithmMeta, rawStep, sortOrder) {
  if (!algorithmMeta?.highlightLine) return -1;
  return algorithmMeta.highlightLine(rawStep || "", { sortOrder });
}

export function renderPseudocodePanel({
  panel,
  activeAlgo,
  currentRawStep,
  sortOrder,
  escapeHtml,
}) {
  if (!panel) return;
  const pseudocode = getAlgorithmPseudocode(activeAlgo, sortOrder);
  const highlightedLine = getHighlightedPseudocodeLine(activeAlgo, currentRawStep, sortOrder);
  panel.innerHTML = pseudocode
    .map((line, index) => {
      const className =
        index === highlightedLine
          ? "visualizer-line visualizer-line-active"
          : "visualizer-line";
      return `<div class="${className}">${escapeHtml(line)}</div>`;
    })
    .join("");
}

export function renderSourcePanel({
  panel,
  activeAlgo,
  sortOrder,
  escapeHtml,
}) {
  if (!panel) return;
  panel.innerHTML = getAlgorithmSource(activeAlgo, sortOrder)
    .map(
      (line) =>
        `<div class="visualizer-line visualizer-line-source">${escapeHtml(line)}</div>`
    )
    .join("");
}

export function renderAlgorithmTracePanel({
  panel,
  visibleSteps,
  escapeHtml,
}) {
  if (!panel) return;
  panel.innerHTML = visibleSteps
    .map((step, index) => {
      const isLast = index === visibleSteps.length - 1;
      const className =
        isLast
          ? "visualizer-line visualizer-line-current"
          : "visualizer-line";

      if (step.includes("[")) {
        const stepNum = step.substring(1, step.indexOf("]"));
        const formatted = formatStepAsPseudocode(
          step.substring(step.indexOf("]") + 1).trim()
        );
        return `<div class="${className}"><span class="visualizer-line-label">[${escapeHtml(
          stepNum
        )}]</span> <span>${escapeHtml(formatted)}</span></div>`;
      }

      return `<div class="${className}">${escapeHtml(
        formatStepAsPseudocode(step)
      )}</div>`;
    })
    .join("");
}
