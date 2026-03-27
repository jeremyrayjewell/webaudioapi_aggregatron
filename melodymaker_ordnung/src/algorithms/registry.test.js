import {
  ALGORITHM_REGISTRY,
  getAlgorithmEntry,
} from "./registry.js";
import {
  ALGORITHM_CATALOG,
  ALGORITHMS_BY_TAB,
  COMPLEXITY_TABS,
  resolveAlgorithmLines,
} from "./catalog.js";
import {
  validateAlgorithmChunkShape,
  validateAlgorithmDataShape,
  validateAlgorithmEntryShape,
  validateAlgorithmMetaShape,
} from "./contracts.js";
import { getTravelingSalesmanData } from "./factorial.js";
import { getDerangementData } from "./subfactorial.js";
import { getAckermannData } from "./ackermann.js";
import { getDoubleExponentialData } from "./doubleExponential.js";

function createExecutionContext(overrides = {}) {
  const baseScale = [110, 165, 220, 275, 330, 385, 440, 495];

  return {
    getSafeSelectedScale: () => [...baseScale],
    getOrderedScale: (scale = baseScale) => [...scale].sort((a, b) => a - b),
    getShuffledSortInput: () => [330, 110, 495, 220, 440, 165, 385, 275],
    numNotes: 3,
    selectEven: true,
    sortOrder: "ascending",
    ...overrides,
  };
}

describe("algorithm registry contract", () => {
  test("every catalog entry has the expected metadata shape", () => {
    Object.values(ALGORITHM_CATALOG).forEach((meta) => {
      validateAlgorithmMetaShape(meta);

      expect(COMPLEXITY_TABS.some((tab) => tab.id === meta.tab)).toBe(true);
      expect(resolveAlgorithmLines(meta.pseudocode, { sortOrder: "ascending" })).toEqual(
        expect.any(Array)
      );
      expect(resolveAlgorithmLines(meta.source, { sortOrder: "ascending" })).toEqual(
        expect.any(Array)
      );
    });
  });

  test("every registry entry maps back to the catalog and tab grouping", () => {
    Object.entries(ALGORITHM_REGISTRY).forEach(([algorithmId, entry]) => {
      validateAlgorithmEntryShape(entry);
      expect(getAlgorithmEntry(algorithmId)).toBe(entry);
      expect(entry.meta).toBe(ALGORITHM_CATALOG[algorithmId]);
      expect(
        (ALGORITHMS_BY_TAB[entry.meta.tab] || []).some((item) => item.id === algorithmId)
      ).toBe(true);
    });
  });

  test("every registry entry returns data matching the shared contract", () => {
    Object.entries(ALGORITHM_REGISTRY).forEach(([algorithmId, entry]) => {
      const result = entry.run(createExecutionContext());
      validateAlgorithmDataShape(result, algorithmId);

      if (result.stream) {
        let chunkCount = 0;
        while (chunkCount < 200) {
          const nextChunk = result.stream.next();
          if (nextChunk.done) {
            break;
          }
          validateAlgorithmChunkShape(nextChunk.value, algorithmId);
          chunkCount += 1;
        }

        expect(chunkCount).toBeGreaterThan(0);
      }
    });
  });

  test("rigor metadata distinguishes canonical, average-case, and bounded demos", () => {
    expect(ALGORITHM_CATALOG.binarySearch.rigor).toMatchObject({
      claimType: "canonical",
      growthClass: "O(log n)",
      bounded: false,
    });
    expect(ALGORITHM_CATALOG.interpolationSearch.rigor).toMatchObject({
      claimType: "average_case",
      growthClass: "O(log log n)",
      bounded: false,
    });
    expect(ALGORITHM_CATALOG.travelingSalesman.rigor).toMatchObject({
      claimType: "bounded_demo",
      growthClass: "O(n!)",
      bounded: true,
      bounds: { maxInputLength: 6 },
    });
  });

  test("bounded demos publish the bounds they actually use", () => {
    expect(ALGORITHM_CATALOG.derangement.rigor.bounds).toEqual({
      maxInputLength: 6,
      maxEnumeratedOutputs: 300,
    });
    expect(ALGORITHM_CATALOG.ackermann.rigor.bounds).toEqual({
      fixedParameters: { m: 2, n: 2 },
    });
    expect(ALGORITHM_CATALOG.booleanFunctionEnumeration.rigor.bounds).toEqual({
      maxVariables: 3,
    });
  });

  test("bounded demo implementations honor representative published bounds", () => {
    const longScale = [110, 165, 220, 275, 330, 385, 440, 495, 550, 605];

    const travelingSalesman = getTravelingSalesmanData(longScale);
    const travelingSalesmanDistinctNotes = new Set();
    for (let i = 0; i < 12; i++) {
      const nextChunk = travelingSalesman.stream.next();
      if (nextChunk.done) {
        break;
      }
      validateAlgorithmChunkShape(nextChunk.value, "travelingSalesman");
      (nextChunk.value.notes || []).forEach((note) => {
        if (note !== null) {
          travelingSalesmanDistinctNotes.add(note);
        }
      });
    }
    expect(travelingSalesmanDistinctNotes.size).toBeGreaterThan(0);
    expect(travelingSalesmanDistinctNotes.size).toBeLessThanOrEqual(
      ALGORITHM_CATALOG.travelingSalesman.rigor.bounds.maxInputLength
    );

    const derangement = getDerangementData(longScale);
    let derangementFoundCount = 0;
    let sawDerangementTotal = false;
    for (let i = 0; i < 400; i++) {
      const nextChunk = derangement.stream.next();
      if (nextChunk.done) {
        break;
      }
      validateAlgorithmChunkShape(nextChunk.value, "derangement");
      const steps = nextChunk.value.steps || [];
      derangementFoundCount += steps.filter((step) =>
        step.startsWith("Found derangement #")
      ).length;
      sawDerangementTotal =
        sawDerangementTotal ||
        steps.some((step) => step.startsWith("Total derangements found:"));
    }
    expect(derangementFoundCount).toBeLessThanOrEqual(
      ALGORITHM_CATALOG.derangement.rigor.bounds.maxEnumeratedOutputs
    );
    expect(sawDerangementTotal).toBe(true);

    const ackermannData = getAckermannData(longScale, 2, 2);
    validateAlgorithmDataShape(ackermannData, "ackermann");
    expect(ackermannData.steps.join("\n")).toContain("Ackermann(2, 2)");

    const booleanFunctions = getDoubleExponentialData(longScale, 7);
    validateAlgorithmDataShape(booleanFunctions, "booleanFunctionEnumeration");
    expect(booleanFunctions.steps.join("\n")).toContain("3 variables");
  });
});
