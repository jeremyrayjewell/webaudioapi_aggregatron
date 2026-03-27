import {
  ALGORITHM_CATALOG,
} from "./catalog.js";
import {
  validateAlgorithmDataShape,
  validateAlgorithmEntryShape,
} from "./contracts.js";
import {
  getAccessElementData,
  getCheckEvenOddData,
  getFirstElementData,
} from "./constant.js";
import { getInterpolationSearchData } from "./doublelogarithmic.js";
import {
  getBinarySearchData,
  getExponentiationBySquaringData,
  getEuclideanAlgorithmData,
  getBinaryHeapInsertData,
  getHeapRootPathData,
} from "./logorithmic.js";
import { getFenwick2DQueryData } from "./polylogarithmic.js";
import {
  getSqrtDecompositionData,
  getJumpSearchData,
} from "./sublinear.js";
import {
  getLinearSearchData,
  getSumOfElementsData,
  getFindMaxData,
  getCountOccurrencesData,
} from "./linear.js";
import {
  getMergeSortData,
  getHeapSortData,
  getQuickSortData,
} from "./linearithmic.js";
import {
  getBubbleSortData,
  getSelectionSortData,
  getInsertionSortData,
} from "./qaudratic.js";
import {
  getMatrixMultiplicationData,
  getThreeSumData,
} from "./cubic.js";
import {
  getKCliqueSearchData,
  getKSumEnumerationData,
} from "./polynomialGeneral.js";
import {
  getFibonacciData,
  getSubsetSumData,
} from "./exponentialBase2.js";
import {
  getGraph3ColoringData,
  getThreeWayPartitionData,
} from "./exponentialBaseC.js";
import { getTravelingSalesmanData } from "./factorial.js";
import { getDerangementData } from "./subfactorial.js";
import { getAckermannData } from "./ackermann.js";
import { getDoubleExponentialData } from "./doubleExponential.js";

const VERIFIED = "aligned";
const defineAlgorithm = ({
  meta,
  implementationName,
  implementationFile,
  verificationStatus,
  verificationNote,
  run,
}) => {
  const entry = {
    id: meta.id,
    meta,
    implementationName,
    implementationFile,
    verificationStatus,
    verificationNote,
    run: (context, options) => {
      const result = run(context, options);
      validateAlgorithmDataShape(result, meta.id);
      return result;
    },
  };

  validateAlgorithmEntryShape(entry);
  return entry;
};

export const ALGORITHM_REGISTRY = {
  accessElement: defineAlgorithm({
    meta: ALGORITHM_CATALOG.accessElement,
    implementationName: "getAccessElementData",
    implementationFile: "src/algorithms/constant.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale, numNotes }) =>
      getAccessElementData(getSafeSelectedScale(), numNotes),
  }),
  parityCheck: defineAlgorithm({
    meta: ALGORITHM_CATALOG.parityCheck,
    implementationName: "getCheckEvenOddData",
    implementationFile: "src/algorithms/constant.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale, numNotes, selectEven }) =>
      getCheckEvenOddData(getSafeSelectedScale(), numNotes, selectEven),
  }),
  firstElement: defineAlgorithm({
    meta: ALGORITHM_CATALOG.firstElement,
    implementationName: "getFirstElementData",
    implementationFile: "src/algorithms/constant.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getFirstElementData(getSafeSelectedScale()),
  }),
  interpolationSearch: defineAlgorithm({
    meta: ALGORITHM_CATALOG.interpolationSearch,
    implementationName: "getInterpolationSearchData",
    implementationFile: "src/algorithms/doublelogarithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getInterpolationSearchData(getSafeSelectedScale()),
  }),
  binarySearch: defineAlgorithm({
    meta: ALGORITHM_CATALOG.binarySearch,
    implementationName: "getBinarySearchData",
    implementationFile: "src/algorithms/logorithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale, sortOrder }) =>
      getBinarySearchData(getSafeSelectedScale(), undefined, sortOrder),
  }),
  exponentiationBySquaring: defineAlgorithm({
    meta: ALGORITHM_CATALOG.exponentiationBySquaring,
    implementationName: "getExponentiationBySquaringData",
    implementationFile: "src/algorithms/logorithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getExponentiationBySquaringData(getSafeSelectedScale(), 10),
  }),
  euclideanAlgorithm: defineAlgorithm({
    meta: ALGORITHM_CATALOG.euclideanAlgorithm,
    implementationName: "getEuclideanAlgorithmData",
    implementationFile: "src/algorithms/logorithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getEuclideanAlgorithmData(getSafeSelectedScale()),
  }),
  binaryHeapInsert: defineAlgorithm({
    meta: ALGORITHM_CATALOG.binaryHeapInsert,
    implementationName: "getBinaryHeapInsertData",
    implementationFile: "src/algorithms/logorithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getBinaryHeapInsertData(getSafeSelectedScale()),
  }),
  heapRootPath: defineAlgorithm({
    meta: ALGORITHM_CATALOG.heapRootPath,
    implementationName: "getHeapRootPathData",
    implementationFile: "src/algorithms/logorithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getHeapRootPathData(getSafeSelectedScale()),
  }),
  fenwick2d: defineAlgorithm({
    meta: ALGORITHM_CATALOG.fenwick2d,
    implementationName: "getFenwick2DQueryData",
    implementationFile: "src/algorithms/polylogarithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getFenwick2DQueryData(getSafeSelectedScale()),
  }),
  sqrtDecomposition: defineAlgorithm({
    meta: ALGORITHM_CATALOG.sqrtDecomposition,
    implementationName: "getSqrtDecompositionData",
    implementationFile: "src/algorithms/sublinear.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getSqrtDecompositionData(getSafeSelectedScale()),
  }),
  jumpSearch: defineAlgorithm({
    meta: ALGORITHM_CATALOG.jumpSearch,
    implementationName: "getJumpSearchData",
    implementationFile: "src/algorithms/sublinear.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale, getOrderedScale, sortOrder }) => {
      const scale = getSafeSelectedScale();
      const orderedScale = getOrderedScale(scale);
      const target = orderedScale[Math.floor(orderedScale.length / 2)];
      return getJumpSearchData(scale, target, sortOrder);
    },
  }),
  linearSearch: defineAlgorithm({
    meta: ALGORITHM_CATALOG.linearSearch,
    implementationName: "getLinearSearchData",
    implementationFile: "src/algorithms/linear.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getLinearSearchData(getSafeSelectedScale()),
  }),
  sumOfElements: defineAlgorithm({
    meta: ALGORITHM_CATALOG.sumOfElements,
    implementationName: "getSumOfElementsData",
    implementationFile: "src/algorithms/linear.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getSumOfElementsData(getSafeSelectedScale()),
  }),
  findMaximum: defineAlgorithm({
    meta: ALGORITHM_CATALOG.findMaximum,
    implementationName: "getFindMaxData",
    implementationFile: "src/algorithms/linear.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getFindMaxData(getSafeSelectedScale()),
  }),
  countOccurrences: defineAlgorithm({
    meta: ALGORITHM_CATALOG.countOccurrences,
    implementationName: "getCountOccurrencesData",
    implementationFile: "src/algorithms/linear.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getCountOccurrencesData(getSafeSelectedScale()),
  }),
  mergeSort: defineAlgorithm({
    meta: ALGORITHM_CATALOG.mergeSort,
    implementationName: "getMergeSortData",
    implementationFile: "src/algorithms/linearithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getShuffledSortInput, sortOrder }, options = {}) =>
      getMergeSortData(getShuffledSortInput("mergeSort", options.refreshInput), sortOrder),
  }),
  heapSort: defineAlgorithm({
    meta: ALGORITHM_CATALOG.heapSort,
    implementationName: "getHeapSortData",
    implementationFile: "src/algorithms/linearithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getShuffledSortInput, sortOrder }, options = {}) =>
      getHeapSortData(getShuffledSortInput("heapSort", options.refreshInput), sortOrder),
  }),
  quickSort: defineAlgorithm({
    meta: ALGORITHM_CATALOG.quickSort,
    implementationName: "getQuickSortData",
    implementationFile: "src/algorithms/linearithmic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getShuffledSortInput, sortOrder }, options = {}) =>
      getQuickSortData(getShuffledSortInput("quickSort", options.refreshInput), sortOrder),
  }),
  bubbleSort: defineAlgorithm({
    meta: ALGORITHM_CATALOG.bubbleSort,
    implementationName: "getBubbleSortData",
    implementationFile: "src/algorithms/qaudratic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getShuffledSortInput, sortOrder }, options = {}) =>
      getBubbleSortData(getShuffledSortInput("bubbleSort", options.refreshInput), sortOrder),
  }),
  selectionSort: defineAlgorithm({
    meta: ALGORITHM_CATALOG.selectionSort,
    implementationName: "getSelectionSortData",
    implementationFile: "src/algorithms/qaudratic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getShuffledSortInput, sortOrder }, options = {}) =>
      getSelectionSortData(getShuffledSortInput("selectionSort", options.refreshInput), sortOrder),
  }),
  insertionSort: defineAlgorithm({
    meta: ALGORITHM_CATALOG.insertionSort,
    implementationName: "getInsertionSortData",
    implementationFile: "src/algorithms/qaudratic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getShuffledSortInput, sortOrder }, options = {}) =>
      getInsertionSortData(getShuffledSortInput("insertionSort", options.refreshInput), sortOrder),
  }),
  matrixMultiplication: defineAlgorithm({
    meta: ALGORITHM_CATALOG.matrixMultiplication,
    implementationName: "getMatrixMultiplicationData",
    implementationFile: "src/algorithms/cubic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getMatrixMultiplicationData(getSafeSelectedScale()),
  }),
  threeSum: defineAlgorithm({
    meta: ALGORITHM_CATALOG.threeSum,
    implementationName: "getThreeSumData",
    implementationFile: "src/algorithms/cubic.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getThreeSumData(getSafeSelectedScale(), 1000),
  }),
  kCliqueSearch: defineAlgorithm({
    meta: ALGORITHM_CATALOG.kCliqueSearch,
    implementationName: "getKCliqueSearchData",
    implementationFile: "src/algorithms/polynomialGeneral.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getKCliqueSearchData(getSafeSelectedScale(), [1, -2, 3], 2),
  }),
  kSumEnumeration: defineAlgorithm({
    meta: ALGORITHM_CATALOG.kSumEnumeration,
    implementationName: "getKSumEnumerationData",
    implementationFile: "src/algorithms/polynomialGeneral.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getKSumEnumerationData(getSafeSelectedScale(), 3),
  }),
  fibonacci: defineAlgorithm({
    meta: ALGORITHM_CATALOG.fibonacci,
    implementationName: "getFibonacciData",
    implementationFile: "src/algorithms/exponentialBase2.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getFibonacciData(getSafeSelectedScale(), 10),
  }),
  subsetSum: defineAlgorithm({
    meta: ALGORITHM_CATALOG.subsetSum,
    implementationName: "getSubsetSumData",
    implementationFile: "src/algorithms/exponentialBase2.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getSubsetSumData(getSafeSelectedScale(), 1000),
  }),
  graph3Coloring: defineAlgorithm({
    meta: ALGORITHM_CATALOG.graph3Coloring,
    implementationName: "getGraph3ColoringData",
    implementationFile: "src/algorithms/exponentialBaseC.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getGraph3ColoringData(getSafeSelectedScale(), 4),
  }),
  threeWayPartition: defineAlgorithm({
    meta: ALGORITHM_CATALOG.threeWayPartition,
    implementationName: "getThreeWayPartitionData",
    implementationFile: "src/algorithms/exponentialBaseC.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getThreeWayPartitionData(getSafeSelectedScale()),
  }),
  travelingSalesman: defineAlgorithm({
    meta: ALGORITHM_CATALOG.travelingSalesman,
    implementationName: "getTravelingSalesmanData",
    implementationFile: "src/algorithms/factorial.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) =>
      getTravelingSalesmanData(getSafeSelectedScale()),
  }),
  derangement: defineAlgorithm({
    meta: ALGORITHM_CATALOG.derangement,
    implementationName: "getDerangementData",
    implementationFile: "src/algorithms/subfactorial.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getDerangementData(getSafeSelectedScale()),
  }),
  ackermann: defineAlgorithm({
    meta: ALGORITHM_CATALOG.ackermann,
    implementationName: "getAckermannData",
    implementationFile: "src/algorithms/ackermann.js",
    verificationStatus: VERIFIED,
    verificationNote: "UI label and implementation function are directly aligned.",
    run: ({ getSafeSelectedScale }) => getAckermannData(getSafeSelectedScale(), 2, 2),
  }),
  booleanFunctionEnumeration: defineAlgorithm({
    meta: ALGORITHM_CATALOG.booleanFunctionEnumeration,
    implementationName: "getDoubleExponentialData",
    implementationFile: "src/algorithms/doubleExponential.js",
    verificationStatus: VERIFIED,
    verificationNote: "Bounded authentic implementation. Input is capped at n <= 3 for interactive visualization.",
    run: ({ getSafeSelectedScale }) =>
      getDoubleExponentialData(getSafeSelectedScale()),
  }),
};

export function getAlgorithmEntry(algorithmId) {
  return ALGORITHM_REGISTRY[algorithmId] || null;
}

export function describeAlgorithmEntry(entry) {
  if (!entry) {
    return [
      "Algorithm Registry",
      "status: no active algorithm",
    ];
  }

  const boundsDescription = entry.meta.rigor.bounds
    ? JSON.stringify(entry.meta.rigor.bounds)
    : "none";

  return [
    `algorithmId: ${entry.id}`,
    `label: ${entry.meta.buttonLabel}`,
    `setup: ${entry.meta.setupName}`,
    `growthClass: ${entry.meta.rigor.growthClass}`,
    `claimType: ${entry.meta.rigor.claimType}`,
    `boundedDemo: ${entry.meta.rigor.bounded ? "yes" : "no"}`,
    `bounds: ${boundsDescription}`,
    `noteStrategy: ${entry.meta.representation.noteStrategy}`,
    `traceStrategy: ${entry.meta.representation.traceStrategy}`,
    `implementation: ${entry.implementationName}`,
    `implementationFile: ${entry.implementationFile}`,
    `verificationStatus: ${entry.verificationStatus}`,
    `note: ${entry.verificationNote}`,
  ];
}
