import {
  getCheckEvenOddData,
} from "./constant.js";
import { getBinarySearchData } from "./logorithmic.js";
import { getBubbleSortData } from "./qaudratic.js";
import { getTravelingSalesmanData } from "./factorial.js";
import { getHeapSortData, getQuickSortData } from "./linearithmic.js";

function extractFrequency(step) {
  const match = step.match(/([0-9]+(?:\.[0-9]+)?) Hz/);
  return match ? Number(match[1]) : null;
}

describe("algorithm representation rigor", () => {
  test("parity check maps accepted indices to notes and rejected indices to rests", () => {
    const randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.8);

    try {
      const scale = [110, 220, 330, 440];
      const result = getCheckEvenOddData(scale, 3, true);

      expect(result.steps).toEqual([
        "CheckEvenOdd: Index 0 is even; playing 110.00 Hz",
        "CheckEvenOdd: Index 1 is odd; rest added",
        "CheckEvenOdd: Index 3 is odd; rest added",
      ]);
      expect(result.notes).toEqual([110, null, null]);
    } finally {
      randomSpy.mockRestore();
    }
  });

  test("binary search trace midpoints match the emitted notes", () => {
    const scale = [440, 110, 330, 220];
    const target = 330;
    const result = getBinarySearchData(scale, target, "ascending");
    const sortedScale = [...scale].sort((a, b) => a - b);

    expect(result.foundIndex).toBe(2);
    expect(result.steps.length).toBe(result.notes.length);

    result.steps.forEach((step, index) => {
      const match = step.match(/mid=(\d+)/);
      expect(match).not.toBeNull();
      const mid = Number(match[1]);
      expect(result.notes[index]).toBe(sortedScale[mid]);
    });
  });

  test("bubble sort comparison notes correspond to the compared values in the trace", () => {
    const scale = [330, 110, 220];
    const result = getBubbleSortData(scale, "ascending");
    const compareSteps = result.steps.filter((step) => step.startsWith("Compare: "));

    expect(result.notes.length).toBe(compareSteps.length * 2);

    compareSteps.forEach((step, index) => {
      const match = step.match(/Compare: ([0-9]+\.[0-9]+) and ([0-9]+\.[0-9]+)/);
      expect(match).not.toBeNull();
      const left = Number(match[1]);
      const right = Number(match[2]);
      expect(result.notes[index * 2]).toBe(left);
      expect(result.notes[index * 2 + 1]).toBe(right);
    });
  });

  test("traveling salesman visiting-city trace emits the matching city frequency", () => {
    const scale = [110, 220, 330, 440];
    const result = getTravelingSalesmanData(scale);
    const seenEvents = [];

    for (let i = 0; i < 40; i++) {
      const nextChunk = result.stream.next();
      if (nextChunk.done) {
        break;
      }

      const { events = [] } = nextChunk.value || {};
      for (const event of events) {
        if (!event?.step?.startsWith("Visiting city ")) {
          continue;
        }

        seenEvents.push(event);
      }

      if (seenEvents.length >= 3) {
        break;
      }
    }

    expect(seenEvents.length).toBeGreaterThan(0);
    seenEvents.forEach((event) => {
      expect(extractFrequency(event.step)).toBe(event.note);
    });
  });

  test("heap sort trace exposes heap comparisons and matching note emissions", () => {
    const result = getHeapSortData([330, 110, 220], "ascending");
    let noteCursor = 0;

    result.steps.forEach((step) => {
      if (step.startsWith("Compare: ")) {
        const match = step.match(/Compare: ([0-9]+\.[0-9]+) with ([0-9]+\.[0-9]+)/);
        expect(result.notes[noteCursor]).toBe(Number(match[1]));
        expect(result.notes[noteCursor + 1]).toBe(Number(match[2]));
        noteCursor += 2;
      } else if (step.startsWith("ExtractRoot: ")) {
        const match = step.match(/ExtractRoot: ([0-9]+\.[0-9]+)/);
        expect(result.notes[noteCursor]).toBe(Number(match[1]));
        noteCursor += 1;
      } else if (step.startsWith("Swap: ")) {
        const match = step.match(/Swap: ([0-9]+\.[0-9]+) with ([0-9]+\.[0-9]+)/);
        expect(result.notes[noteCursor]).toBe(Number(match[1]));
        expect(result.notes[noteCursor + 1]).toBe(Number(match[2]));
        noteCursor += 2;
      }
    });

    expect(result.steps.some((step) => step.startsWith("BuildHeap:"))).toBe(true);
    expect(noteCursor).toBe(result.notes.length);
  });

  test("quick sort trace exposes pivots, comparisons, and matching note emissions", () => {
    const result = getQuickSortData([330, 110, 220], "ascending");
    let noteCursor = 0;

    result.steps.forEach((step) => {
      if (step.startsWith("Pivot: ")) {
        const match = step.match(/Pivot: ([0-9]+\.[0-9]+)/);
        expect(result.notes[noteCursor]).toBe(Number(match[1]));
        noteCursor += 1;
      } else if (step.startsWith("Compare: ")) {
        const match = step.match(/Compare: ([0-9]+\.[0-9]+) with pivot ([0-9]+\.[0-9]+)/);
        expect(result.notes[noteCursor]).toBe(Number(match[1]));
        expect(result.notes[noteCursor + 1]).toBe(Number(match[2]));
        noteCursor += 2;
      } else if (step.startsWith("Swap: ")) {
        const match = step.match(/Swap: ([0-9]+\.[0-9]+) with ([0-9]+\.[0-9]+)/);
        expect(result.notes[noteCursor]).toBe(Number(match[1]));
        expect(result.notes[noteCursor + 1]).toBe(Number(match[2]));
        noteCursor += 2;
      }
    });

    expect(result.steps.some((step) => step.startsWith("Pivot: "))).toBe(true);
    expect(result.steps.some((step) => step.startsWith("Partitioned:"))).toBe(true);
    expect(noteCursor).toBe(result.notes.length);
  });
});
