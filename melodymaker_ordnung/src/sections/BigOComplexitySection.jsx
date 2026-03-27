import React from "react";
import { ALGORITHMS_BY_TAB, COMPLEXITY_TABS } from "../algorithms/catalog.js";

const TAB_LAYOUTS = {
  constant: [
    [
      { id: "accessElement", colClass: "col-md-6", control: "numNotes" },
      { id: "parityCheck", colClass: "col-md-6", control: "parity" },
    ],
    [{ id: "firstElement", colClass: "col-12" }],
  ],
  doublelogarithmic: [[{ id: "interpolationSearch", colClass: "col-md-6" }]],
  logarithmic: [
    [
      { id: "binarySearch", colClass: "col-md-6" },
      { id: "exponentiationBySquaring", colClass: "col-md-6" },
    ],
    [
      { id: "euclideanAlgorithm", colClass: "col-md-4" },
      { id: "binaryHeapInsert", colClass: "col-md-4" },
      { id: "heapRootPath", colClass: "col-md-4" },
    ],
  ],
  polylogarithmic: [[{ id: "fenwick2d", colClass: "col-md-6" }]],
  sublinear: [[{ id: "sqrtDecomposition", colClass: "col-md-6" }, { id: "jumpSearch", colClass: "col-md-6" }]],
  linear: [
    [{ id: "linearSearch", colClass: "col-md-6" }, { id: "sumOfElements", colClass: "col-md-6" }],
    [{ id: "findMaximum", colClass: "col-md-6" }, { id: "countOccurrences", colClass: "col-md-6" }],
  ],
  linearithmic: [[
    { id: "mergeSort", colClass: "col-md-4", resort: true },
    { id: "heapSort", colClass: "col-md-4", resort: true },
    { id: "quickSort", colClass: "col-md-4", resort: true },
  ]],
  quadratic: [[
    { id: "bubbleSort", colClass: "col-md-4", resort: true },
    { id: "selectionSort", colClass: "col-md-4", resort: true },
    { id: "insertionSort", colClass: "col-md-4", resort: true },
  ]],
  cubic: [[{ id: "matrixMultiplication", colClass: "col-md-6" }, { id: "threeSum", colClass: "col-md-6" }]],
  polynomial: [[{ id: "kCliqueSearch", colClass: "col-md-6" }, { id: "kSumEnumeration", colClass: "col-md-6" }]],
  exponential: [[{ id: "fibonacci", colClass: "col-md-6" }, { id: "subsetSum", colClass: "col-md-6" }]],
  exponentialBaseC: [[{ id: "graph3Coloring", colClass: "col-md-6" }, { id: "threeWayPartition", colClass: "col-md-6" }]],
  factorial: [[{ id: "travelingSalesman", colClass: "col-md-6" }]],
  subfactorial: [[{ id: "derangement", colClass: "col-md-6" }]],
  ackermann: [[{ id: "ackermann", colClass: "col-md-6" }]],
  doubleExponential: [[{ id: "booleanFunctionEnumeration", colClass: "col-md-6" }]],
};

function renderAlgorithmControl(control, props) {
  if (control === "numNotes") {
    return (
      <div className="form-group dos-form-group mt-2">
        <label htmlFor="numNotes">Number of Notes:</label>
        <input
          id="numNotes"
          type="number"
          className="form-control dos-control"
          value={props.numNotes}
          onChange={(e) => props.setNumNotes(Number(e.target.value))}
        />
      </div>
    );
  }

  if (control === "parity") {
    return (
      <div className="form-group dos-form-group mt-2">
        <div className="form-check">
          <input id="evenRadio" className="form-check-input dos-radio" type="radio" name="evenOdd" checked={props.selectEven === true} onChange={() => props.setSelectEven(true)} />
          <label className="form-check-label" htmlFor="evenRadio">Even</label>
        </div>
        <div className="form-check">
          <input id="oddRadio" className="form-check-input dos-radio" type="radio" name="evenOdd" checked={props.selectEven === false} onChange={() => props.setSelectEven(false)} />
          <label className="form-check-label" htmlFor="oddRadio">Odd</label>
        </div>
      </div>
    );
  }

  return null;
}

function formatClaimType(claimType) {
  switch (claimType) {
    case "bounded_demo":
      return "bounded demo";
    case "average_case":
      return "average-case";
    default:
      return claimType;
  }
}

function formatBounds(bounds) {
  if (!bounds) {
    return "none";
  }

  return Object.entries(bounds)
    .map(([key, value]) =>
      typeof value === "object" && value !== null
        ? `${key}=${JSON.stringify(value)}`
        : `${key}=${value}`
    )
    .join(", ");
}

export function BigOComplexitySection(props) {
  const {
    selectedTab,
    setSelectedTab,
    sortOrder,
    setSortOrder,
    stopPlayback,
    startAlgorithmById,
    audioCtx,
    numNotes,
    setNumNotes,
    selectEven,
    setSelectEven,
  } = props;

  const currentTab = COMPLEXITY_TABS.find((tab) => tab.id === selectedTab) || COMPLEXITY_TABS[0];
  const algorithmsById = Object.fromEntries(
    (ALGORITHMS_BY_TAB[selectedTab] || []).map((algorithm) => [algorithm.id, algorithm])
  );
  const rows = TAB_LAYOUTS[selectedTab] || [];

  return (
    <div className="row">
      <div className="col-12">
        <div className="dos-panel">
          <h3>Big-O Time Complexity <span className="blink">_</span></h3>
          <nav className="dos-nav">
            <div className="btn-group btn-group-sm dos-btn-group flex-wrap" role="group">
              {COMPLEXITY_TABS.map((tab) => (
                <button key={tab.id} className="btn dos-btn" onClick={() => setSelectedTab(tab.id)}>
                  {tab.navLabel}
                </button>
              ))}
            </div>
          </nav>
          <div className="form-group dos-form-group mt-3 mb-3">
            <label htmlFor="globalOrder">Order:</label>
            <select id="globalOrder" className="form-control dos-control" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>

          <div className="tab-content dos-tab-content mt-3">
            <div className="dos-tab-pane">
              <h4>{currentTab.title} <span className="blink">_</span></h4>
              <div className="dos-section-controls mb-3">
                <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                  STOP
                </button>
              </div>
              {rows.map((row, rowIndex) => (
                <div key={`${selectedTab}-row-${rowIndex}`} className={`row${rowIndex > 0 ? " mt-2" : ""}`}>
                  {row.map((item) => {
                    const algorithm = algorithmsById[item.id];
                    if (!algorithm) {
                      return null;
                    }

                    return (
                      <div key={item.id} className={item.colClass}>
                        {item.resort ? (
                          <div className="dos-btn-group">
                            <button className="btn dos-btn" onClick={() => startAlgorithmById(item.id)} disabled={!audioCtx}>
                              {algorithm.buttonLabel}
                            </button>
                            <button className="btn dos-btn" onClick={() => startAlgorithmById(item.id, { refreshInput: true })} disabled={!audioCtx}>
                              RESORT
                            </button>
                          </div>
                        ) : (
                          <button className="btn dos-btn" onClick={() => startAlgorithmById(item.id)} disabled={!audioCtx}>
                            {algorithm.buttonLabel}
                          </button>
                        )}
                        <p className="mt-2 dos-description">{algorithm.description}</p>
                        <div className="dos-description mt-2">
                          <div><strong>Claim:</strong> {algorithm.rigor.growthClass} ({formatClaimType(algorithm.rigor.claimType)})</div>
                          <div><strong>Bounds:</strong> {formatBounds(algorithm.rigor.bounds)}</div>
                          <div><strong>Representation:</strong> {algorithm.representation.noteStrategy} / {algorithm.representation.traceStrategy}</div>
                        </div>
                        {renderAlgorithmControl(item.control, {
                          numNotes,
                          setNumNotes,
                          selectEven,
                          setSelectEven,
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
