import React, { useState, useRef, useEffect } from "react";
import { SCALES } from "./scales.js";
import { createPatternFromNotes } from "./patternHelpers.js";
import {
  getAccessElementData,
  getCheckEvenOddData,
  getFirstElementData,
} from "./algorithms/constant.js";
import { 
  getRepeatedHalvingData, 
} from "./algorithms/doublelogarithmic.js";
import {
  getBinarySearchData,
  getExponentiationBySquaringData,  
  getLogDivData,
  getIterativeLogData,
  getExtraLogData,
} from "./algorithms/logorithmic.js";
import { 
  getRepeatedLogReductionData, 
} from "./algorithms/polylogarithmic.js";
import { 
  getRandomSamplingData, 
  getJumpSearchData, 
} from "./algorithms/sublinear.js";
import {
  getLinearSearchData,
  getSumOfElementsData,
  getFindMaxData,
  getCountOccurrencesData,
} from "./algorithms/linear.js";
import {
  getMergeSortData,
  getHeapSortData,
  getQuickSortData,
} from "./algorithms/linearithmic.js";
import {
  getBubbleSortData,
  getSelectionSortData,
  getInsertionSortData,
} from "./algorithms/qaudratic.js";
import {
  getMatrixMultiplicationData,
  getThreeSumData,
} from "./algorithms/cubic.js";
import {
  getPolynomialEvaluationData,
  getMatrixExponentiationData,
} from "./algorithms/polynomialGeneral.js";
import {
  getFibonacciData,
  getSubsetSumData,
} from "./algorithms/exponentialBase2.js";
import {
  getTowersOfHanoiData,
  getPermutationsData,
} from "./algorithms/exponentialBaseC.js";
import { 
  getTravelingSalesmanData, 
} from "./algorithms/factorial.js";
import { 
  getDerangementData, 
} from "./algorithms/subfactorial.js";
import { 
  getAckermannData, 
} from "./algorithms/ackermann.js";
import { 
  getDoubleExponentialData, 
} from "./algorithms/doubleExponential.js";

// 1) IMPORT from drums.js
import {
  playDrum,
  generateDrumPattern,
  DRUM_TYPES,
} from "./drums.js";

export default function MusicalBigO({ audioCtx, analyser }) {
  const [selectedTab, setSelectedTab] = useState("logarithmic");
  const [bpm, setBpm] = useState(60);
  const TICKS_PER_BEAT = 4;
  const clockIdRef = useRef(null);

  // Scale selection states
  const [selectedRootNote, setSelectedRootNote] = useState("A");
  const [selectedScaleType, setSelectedScaleType] = useState("minor");
  const [selectedScaleVariation, setSelectedScaleVariation] = useState("pentatonic");
  const [selectedOctave, setSelectedOctave] = useState(0);

  // Algorithm data states
  const [currentAlgo, setCurrentAlgo] = useState(null);
  const [activePattern, setActivePattern] = useState([]);   // melody pattern
  const [patternLength, setPatternLength] = useState(0);
  const [algoSteps, setAlgoSteps] = useState([]);
  const [algoStepsLength, setAlgoStepsLength] = useState(0);
  const stepRef = useRef(0);

  // Canvas refs (audio visualization, algorithm text, drum grid)
  const audioCanvasRef = useRef(null);
  const algorithmCanvasRef = useRef(null);
  const drumCanvasRef = useRef(null);

  // Show/hide logs
  const [showLogs, setShowLogs] = useState(false);

  // Show/hide drum gain
  const [showDrumGain, setShowDrumGain] = useState(false);

  // Additional synth states (waveform, ADSR, rate, depth, modulator)
  const [waveform, setWaveform] = useState("sine");
  const [attack, setAttack] = useState(0.1);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.2);
  const [rate, setRate] = useState(1);
  const [depth, setDepth] = useState(0.5);
  const [modulatorOn, setModulatorOn] = useState(false);

  // Drum pattern + variation selection
  const [rhythmPattern, setRhythmPattern] = useState([]);

  const [drumVariation, setDrumVariation] = useState("simple");

  // 1) We’ll keep track of a gain for each drum in an object:
  const [drumGains, setDrumGains] = useState({
    kick: 2.0,
    snare: 0.5,
    hihat: 0.05,
    tomLow: 1.0,
    tomMid: 1.0,
    tomHigh: 1.0,
    clap: 0.05,
    ride: 0.05,
    crash: 0.05,
  });

  // Helper to update the gain for one drum type
  const updateDrumGain = (drumType, newGain) => {
    setDrumGains((prev) => ({
      ...prev,
      [drumType]: parseFloat(newGain),
    }));
  };

    // State for number of notes
    const [numNotes, setNumNotes] = useState(1);

    // state for even or odd
const [selectEven, setSelectEven] = useState(true);

  // UseEffect to log scales
  useEffect(() => {
    const scaleGroups = Object.keys(SCALES);

    scaleGroups.forEach((group) => {
      if (group === "Atonal") {
        const atonalScales = SCALES.Atonal.atonal;
        if (atonalScales) {
          const atonalKeys = Object.keys(atonalScales);
          atonalKeys.forEach((scale) => {
            console.log(`Atonal Scale: ${scale}`, atonalScales[scale]);
          });
        }
      } else {
        const groupScales = SCALES[group];
        const scaleTypes = Object.keys(groupScales);
        scaleTypes.forEach((type) => {
          console.log(`Key: ${group}, Scale: ${type}`, groupScales[type]);
        });
      }
    });
  }, []);

  //====================================
  // PLAY NOTE (melody) with ADSR + mod
  //====================================
  const playNote = (freq, durationMs = 200) => {
    if (!audioCtx) return;
    const adjustedFreq = freq * Math.pow(2, selectedOctave);
    const oscillator = audioCtx.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = adjustedFreq;

    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    const attackTime = parseFloat(attack);
    const decayTime = parseFloat(decay);
    const sustainLevel = parseFloat(sustain);
    const releaseTime = parseFloat(release);

    // Attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(depth, now + attackTime);

    // Decay -> sustain
    gainNode.gain.linearRampToValueAtTime(
      sustainLevel * depth,
      now + attackTime + decayTime
    );

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    oscillator.start();

    // Optional amplitude modulation
    if (modulatorOn && rate !== 1) {
      const modOscillator = audioCtx.createOscillator();
      modOscillator.type = "sine";
      modOscillator.frequency.value = rate;
      const modGain = audioCtx.createGain();
      modGain.gain.value = depth; // modulation depth

      modOscillator.connect(modGain);
      modGain.connect(gainNode.gain);
      modOscillator.start();
      modOscillator.stop(now + durationMs / 1000 + releaseTime);
    }

    // Stop note after durationMs, then release ramp
    setTimeout(() => {
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + releaseTime);
      setTimeout(() => oscillator.stop(), releaseTime * 1000);
    }, durationMs);
  };

  //=============================
  //  DRAW AUDIO CANVAS (bars)
  //=============================
  function drawAudioCanvas(frequencies) {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (frequencies.length === 0) return;
    const maxFreq = 800; // for bar scaling
    const barWidth = 20;
    const gap = 10;
    let xPos = 10;
  
    frequencies.filter(freq => freq !== null).forEach((freq) => {
      const barHeight = (freq / maxFreq) * canvas.height;
      const yPos = canvas.height - barHeight;
      ctx.fillStyle = "blue";
      ctx.fillRect(xPos, yPos, barWidth, barHeight);
      ctx.fillStyle = "black";
      ctx.font = "12px sans-serif";
      ctx.fillText(freq.toFixed(2) + " Hz", xPos, yPos - 5);
      xPos += barWidth + gap;
    });
  }

  //============================
  //  DRAW ALGORITHM CANVAS
  //============================
  function drawAlgorithmCanvas(stepText) {
    const canvas = algorithmCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "14px sans-serif";
    if (stepText) {
      ctx.fillText(stepText, 10, 30);
    }
  }

  //============================
  //  DRUM GRID VISUALIZATION
  //============================
  function drawDrumGrid(rhythmPattern, currentStep) {
    const canvas = drumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Each column => one step
    // Each row => a drum type from DRUM_TYPES
    const patternLen = rhythmPattern.length;
    const drumTypes = DRUM_TYPES;
    const rowCount = drumTypes.length;

    // We'll define cell sizes so that everything fits
    const cellWidth = Math.max(12, Math.floor(width / patternLen) - 1);
    const cellHeight = Math.max(12, Math.floor(height / rowCount) - 1);

    for (let step = 0; step < patternLen; step++) {
      const drumType = rhythmPattern[step];
      const rowIndex = drumTypes.indexOf(drumType);

      for (let row = 0; row < rowCount; row++) {
        const x = step * cellWidth;
        const y = row * cellHeight;

        // Highlight current column
        if (step === currentStep) {
          ctx.fillStyle = "#ddd";
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }

        // If row == rowIndex => fill that cell
        if (row === rowIndex && rowIndex !== -1) {
          let fillColor = "gray";
          switch (drumType) {
            case "kick":    fillColor = "orange"; break;
            case "snare":   fillColor = "red";    break;
            case "hihat":   fillColor = "green";  break;
            case "tomLow":  fillColor = "blue";   break;
            case "tomMid":  fillColor = "teal";   break;
            case "tomHigh": fillColor = "purple"; break;
            case "clap":    fillColor = "pink";   break;
            case "ride":    fillColor = "gold";   break;
            case "crash":   fillColor = "yellow"; break;
            default:        fillColor = "gray";   break;
          }
          ctx.fillStyle = fillColor;
          ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
        } else {
          // Outline cells
          ctx.strokeStyle = "#aaa";
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      }
    }
  }

  //================================
  //  START / STOP CLOCK
  //================================
  const startClock = () => {
    stopClock();

    const msPerBeat = 60000 / bpm;
    const tickInterval = msPerBeat / TICKS_PER_BEAT;

    stepRef.current = 0;
    const intervalId = setInterval(() => {
      const step = stepRef.current;
      const wrappedStep = step % patternLength;

      // 1) Melody notes
      const notesToPlay = activePattern.filter((p) => p.step === wrappedStep);
      notesToPlay.forEach((noteItem) => {
        playNote(noteItem.freq, tickInterval * 0.9);
      });

      // 2) Draw audio bars
      drawAudioCanvas(notesToPlay.map((p) => p.freq));

      // 3) Algorithm text
      const algoStepIndex = step % algoStepsLength;
      const currentAlgoStepText = algoSteps[algoStepIndex] || "";
      drawAlgorithmCanvas(currentAlgoStepText);

      // 4) Drum if defined
      const drumStep = rhythmPattern[wrappedStep];
      if (drumStep) {
        // Pass drumGains[drumStep] as the gain argument
        playDrum(audioCtx, drumStep, 1, drumGains[drumStep]);
      }

      // 5) Update drum grid
      drawDrumGrid(rhythmPattern, wrappedStep);

      stepRef.current = step + 1;
    }, tickInterval);

    clockIdRef.current = intervalId;
  };

  const stopClock = () => {
    if (clockIdRef.current) {
      clearInterval(clockIdRef.current);
      clockIdRef.current = null;
    }
    // Clear visuals
    drawAudioCanvas([]);
    drawAlgorithmCanvas("");
    drawDrumGrid([], -1);
  };

  //=======================================
  //  SETUP ALGORITHM => MELODY + DRUMS
  //=======================================
  function setupAlgorithm(algoName, data) {
    setCurrentAlgo(algoName);
    setAlgoSteps(data.steps);
    setAlgoStepsLength(data.steps.length);

    // 1) Create melodic pattern
    const pattern = createPatternFromNotes(data.notes, 1);
    setActivePattern(pattern);
    setPatternLength(pattern.length);

    // 2) Create a drum pattern
    const newDrums = generateDrumPattern(pattern.length, drumVariation, data);
    setRhythmPattern(newDrums);

    startClock();
  }

  //=======================================
  //  ALGORITHM STARTS (O(log n), O(n))
  //=======================================
// O(1)
const startAccessElement = () => {
  const data = getAccessElementData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    numNotes // Use the state value for number of notes
  );
  setupAlgorithm("Access Element (O(1))", data);
};

const startCheckEvenOdd = () => {
  const data = getCheckEvenOddData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    numNotes, // Use the state value for number of notes
    selectEven // Use the state value for selecting even or odd
  );
  setupAlgorithm("Check Even/Odd (O(1))", data);
};

const startFirstElement = () => {
  const data = getFirstElementData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
  );
  setupAlgorithm("First Element (O(1))", data);
};

const startRepeatedHalving = () => {
  const data = getRepeatedHalvingData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
  );
  setupAlgorithm("Repeated Halving (O(log log n))", data);
};

  const startBinarySearch = () => {
    const data = getBinarySearchData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Binary Search (O(log n))", data);
  };

  const startExponentiationBySquaring = () => {
    const scale = SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation];
    const exponent = 10; // Example exponent
    const data = getExponentiationBySquaringData(scale, exponent);
    setupAlgorithm("Exponentiation by Squaring (O(log n))", data);
  };

  const startLogDivision = () => {
    const data = getLogDivData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Log Division (O(log n))", data);
  };

  const startIterativeLog = () => {
    const data = getIterativeLogData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Iterative Log (O(log n))", data);
  };

  const startExtraLog = () => {
    const data = getExtraLogData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Extra Pattern (O(log n))", data);
  };

    const startRepeatedLogReduction = () => {
    const data = getRepeatedLogReductionData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Repeated Log Reduction (O((log n)^2))", data);
  };

const startRandomSampling = () => {
  const data = getRandomSamplingData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
  );
  setupAlgorithm("Random Sampling (O(sqrt(n)))", data);
};

const startJumpSearch = () => {
  const target = SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation][0]; // Example target
  const data = getJumpSearchData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    target
  );
  setupAlgorithm("Jump Search (O(sqrt(n)))", data);
};


  // O(n)
  const startLinearSearch = () => {
    const data = getLinearSearchData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Linear Search (O(n))", data);
  };

  const startSumOfElements = () => {
    const data = getSumOfElementsData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Sum of Elements (O(n))", data);
  };

  const startFindMax = () => {
    const data = getFindMaxData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Find Maximum (O(n))", data);
  };

  const startCountOccurrences = () => {
    const data = getCountOccurrencesData(
      SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Count Occurrences (O(n))", data);
  };

    // O(n log n)
    const startMergeSort = () => {
      const data = getMergeSortData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
      );
      setupAlgorithm("Merge Sort (O(n log n))", data);
    };
  
    const startHeapSort = () => {
      const data = getHeapSortData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
      );
      setupAlgorithm("Heap Sort (O(n log n))", data);
    };
  
    const startQuickSort = () => {
      const data = getQuickSortData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
      );
      setupAlgorithm("Quick Sort (O(n log n))", data);
    };

        const startBubbleSort = () => {
      const data = getBubbleSortData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
      );
      setupAlgorithm("Bubble Sort (O(n^2))", data);
    };
    
    const startSelectionSort = () => {
      const data = getSelectionSortData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
      );
      setupAlgorithm("Selection Sort (O(n^2))", data);
    };
    
    const startInsertionSort = () => {
      const data = getInsertionSortData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
      );
      setupAlgorithm("Insertion Sort (O(n^2))", data);
    };

const startMatrixMultiplication = () => {
  const data = getMatrixMultiplicationData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
  );
  setupAlgorithm("Matrix Multiplication (O(n^3))", data);
};

const startThreeSum = () => {
  const target = 1000; // Example target sum
  const data = getThreeSumData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    target
  );
  setupAlgorithm("3-Sum Problem (O(n^3))", data);
};

const startPolynomialEvaluation = () => {
  const coefficients = [1, -2, 3]; // Example coefficients for polynomial 1 - 2x + 3x^2
  const x = 2; // Example value of x
  const data = getPolynomialEvaluationData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    coefficients,
    x
  );
  setupAlgorithm("Polynomial Evaluation (O(n^k))", data);
};

const startMatrixExponentiation = () => {
  const k = 3; // Example exponent
  const data = getMatrixExponentiationData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    k
  );
  setupAlgorithm("Matrix Exponentiation (O(n^k))", data);
};

const startFibonacci = () => {
  const n = 10; // Example Fibonacci number
  const data = getFibonacciData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    n
  );
  setupAlgorithm("Fibonacci Sequence (O(2^n))", data);
};

const startSubsetSum = () => {
  const targetSum = 1000; // Example target sum
  const data = getSubsetSumData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    targetSum
  );
  setupAlgorithm("Subset Sum Problem (O(2^n))", data);
};

const startTowersOfHanoi = () => {
  const n = 3; // Example number of disks
  const data = getTowersOfHanoiData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
    n
  );
  setupAlgorithm("Towers of Hanoi (O(3^n))", data);
};

const startPermutations = () => {
  const data = getPermutationsData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
  );
  setupAlgorithm("Permutations (O(n!))", data);
};

const startTravelingSalesman = () => {
  const data = getTravelingSalesmanData(
    SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
  );
  setupAlgorithm("Traveling Salesman Problem (O(n!))", data);
};

const startDerangement = () => {
    const data = getDerangementData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Derangement Problem (O(n!/k^n))", data);
};

const startAckermann = () => {
    const m = 2; // Example value for m
    const n = 2; // Example value for n
    const data = getAckermannData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation],
        m,
        n
    );
    setupAlgorithm("Ackermann Function (O(A(n, n)))", data);
};

const startDoubleExponential = () => {
    const data = getDoubleExponentialData(
        SCALES[selectedRootNote][selectedScaleType][selectedScaleVariation]
    );
    setupAlgorithm("Double Exponential (O(2^(2^n)))", data);
};

  //=======================================
  //  STOP PLAYBACK
  //=======================================
  const stopPlayback = () => {
    setCurrentAlgo(null);
    stopClock();
    setActivePattern([]);
    setPatternLength(0);
    setAlgoSteps([]);
    setAlgoStepsLength(0);
    setRhythmPattern([]);
  };

  //=======================================
  //  RENDER
  //=======================================
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Musical Big O Notation</h1>

      {/* BPM */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>BPM:</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ width: "60px", marginRight: "1rem" }}
        />
      </div>

      {/* Root note, scale type, variation, etc. */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>Root Note:</label>
        <select
          value={selectedRootNote}
          onChange={(e) => setSelectedRootNote(e.target.value)}
        >
          {Object.keys(SCALES).map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>Scale Type:</label>
        <select
          value={selectedScaleType}
          onChange={(e) => setSelectedScaleType(e.target.value)}
        >
          {Object.keys(SCALES[selectedRootNote]).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>Scale Variation:</label>
        <select
          value={selectedScaleVariation}
          onChange={(e) => setSelectedScaleVariation(e.target.value)}
        >
          {Object.keys(SCALES[selectedRootNote][selectedScaleType]).map(
            (variation) => (
              <option key={variation} value={variation}>
                {variation}
              </option>
            )
          )}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>Octave (relative):</label>
        <select
          value={selectedOctave}
          onChange={(e) => setSelectedOctave(Number(e.target.value))}
        >
          {[...Array(9).keys()].map((octave) => (
            <option key={octave} value={octave - 4}>
              {octave - 4}
            </option>
          ))}
        </select>
      </div>

      {/* Waveform + ADSR + modulator controls */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>Waveform:</label>
        <select value={waveform} onChange={(e) => setWaveform(e.target.value)}>
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="triangle">Triangle</option>
          <option value="sawtooth">Sawtooth</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Attack:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={attack}
          onChange={(e) => setAttack(e.target.value)}
        />
        <label>Decay:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={decay}
          onChange={(e) => setDecay(e.target.value)}
        />
        <label>Sustain:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sustain}
          onChange={(e) => setSustain(e.target.value)}
        />
        <label>Release:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={release}
          onChange={(e) => setRelease(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Amplitude Modulator On:</label>
        <input
          type="checkbox"
          checked={modulatorOn}
          onChange={(e) => setModulatorOn(e.target.checked)}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Rate:</label>
        <input
          type="number"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <label>Depth:</label>
        <input
          type="number"
          step="0.1"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </div>

      {/* Drum Variation */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: 8 }}>Drum Variation:</label>
        <select
          value={drumVariation}
          onChange={(e) => setDrumVariation(e.target.value)}
        >
          <option value="simple">simple</option>
          <option value="rock">rock</option>
          <option value="funky">funky</option>
          <option value="random">random</option>
          <option value="breakbeat">breakbeat</option>
          <option value="drumless">drumless</option>
        </select>
      </div>

      {/* Navigation for O(log n) vs. O(n) */}
      <nav>
        <p>Big O Times:</p>
        <button onClick={() => setSelectedTab("constant")}>O(1)</button>
        <button onClick={() => setSelectedTab("doublelogarithmic")}>O(log log n)</button>
        <button onClick={() => setSelectedTab("logarithmic")}>O(log n)</button>
        <button onClick={() => setSelectedTab("polylogarithmic")}>O((log n)^2)</button>
        <button onClick={() => setSelectedTab("sublinear")}>O(sqrt(n))</button>
        <button onClick={() => setSelectedTab("linear")}>O(n)</button>
        <button onClick={() => setSelectedTab("linearithmic")}>O(n log n)</button>
        <button onClick={() => setSelectedTab("quadratic")}>O(n^2)</button>
        <button onClick={() => setSelectedTab("cubic")}>O(n^3)</button>
        <button onClick={() => setSelectedTab("polynomial")}>O(n^k)</button>
        <button onClick={() => setSelectedTab("exponential")}>O(2^n)</button>
        <button onClick={() => setSelectedTab("exponentialBaseC")}>O(c^n), c&gt;2</button>
        <button onClick={() => setSelectedTab("factorial")}>O(n!)</button>
        <button onClick={() => setSelectedTab("subfactorial")}>O(n!/k^n)</button>
        <button onClick={() => setSelectedTab("ackermann")}>O(A(n, n))</button>
        <button onClick={() => setSelectedTab("doubleExponential")}>O(2^(2^n))</button>
      </nav>

            {selectedTab === "constant" && (
        <div>
          <p>01. O(1) Constant:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startAccessElement} disabled={!audioCtx}>
              Access Element
            </button>
                        <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: 8 }}>Number of Notes:</label>
              <input
                type="number"
                value={numNotes}
                onChange={(e) => setNumNotes(Number(e.target.value))}
                style={{ width: "60px", marginRight: "1rem" }}
              />
            </div>
            <button onClick={startCheckEvenOdd} disabled={!audioCtx}>
              Check Even/Odd
            </button>
            <div style={{ marginBottom: "1rem" }}>
  <label style={{ marginRight: 8 }}>Number of Notes:</label>
  <input
    type="number"
    value={numNotes}
    onChange={(e) => setNumNotes(Number(e.target.value))}
    style={{ width: "60px", marginRight: "1rem" }}
  />
  <label style={{ marginRight: 8 }}>Select:</label>
  <label style={{ marginRight: 8 }}>
    <input
      type="radio"
      value="even"
      checked={selectEven === true}
      onChange={() => setSelectEven(true)}
    />
    Even
  </label>
  <label>
    <input
      type="radio"
      value="odd"
      checked={selectEven === false}
      onChange={() => setSelectEven(false)}
    />
    Odd
  </label>
</div>
            <button onClick={startFirstElement} disabled={!audioCtx}>
              First Element
            </button>
          </div>
        </div>
      )}

            {selectedTab === "doublelogarithmic" && (
        <div>
          <p>02. O(log log n) Double Logarithmic:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startRepeatedHalving} disabled={!audioCtx}>
              Repeated Halving
            </button>
          </div>
        </div>
      )}

      {selectedTab === "logarithmic" && (
        <div>
          <p>03. O(log n) Logarithmic:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startBinarySearch} disabled={!audioCtx}>
              Binary Search
            </button>
            <button onClick={startExponentiationBySquaring} disabled={!audioCtx}>
              Exponentiation by Squaring
            </button>
            <button onClick={startLogDivision} disabled={!audioCtx}>
              Log Division
            </button>
            <button onClick={startIterativeLog} disabled={!audioCtx}>
              Iterative Log
            </button>
            <button onClick={startExtraLog} disabled={!audioCtx}>
              Extra Pattern
            </button>
          </div>
        </div>
      )}

            {selectedTab === "polylogarithmic" && (
        <div>
          <p>04. O((log n)^2) Polylogarithmic:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startRepeatedLogReduction} disabled={!audioCtx}>
              Repeated Log Reduction
            </button>
          </div>
        </div>
      )}

            {selectedTab === "sublinear" && (
        <div>
          <p>05. O(sqrt(n)) Sublinear:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startRandomSampling} disabled={!audioCtx}>
              Random Sampling
            </button>
            <button onClick={startJumpSearch} disabled={!audioCtx}>
              Jump Search
            </button>
          </div>
        </div>
      )}

      {selectedTab === "linear" && (
        <div>
          <p>06. O(n) Linear:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startLinearSearch} disabled={!audioCtx}>
              Linear Search
            </button>
            <button onClick={startSumOfElements} disabled={!audioCtx}>
              Sum of Elements
            </button>
            <button onClick={startFindMax} disabled={!audioCtx}>
              Find Maximum
            </button>
            <button onClick={startCountOccurrences} disabled={!audioCtx}>
              Count Occurrences
            </button>
          </div>
        </div>
      )}

      {selectedTab === "linearithmic" && (
        <div>
          <p>07. O(n log n) Linearithmic:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startMergeSort} disabled={!audioCtx}>
              Merge Sort
            </button>
            <button onClick={startHeapSort} disabled={!audioCtx}>
              Heap Sort
            </button>
            <button onClick={startQuickSort} disabled={!audioCtx}>
              Quick Sort
            </button>
          </div>
        </div>
      )}

            {selectedTab === "quadratic" && (
        <div>
          <p>08. O(n^2) Quadratic:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startBubbleSort} disabled={!audioCtx}>
              Bubble Sort
            </button>
            <button onClick={startSelectionSort} disabled={!audioCtx}>
              Selection Sort
            </button>
            <button onClick={startInsertionSort} disabled={!audioCtx}>
              Insertion Sort
            </button>
          </div>
        </div>
      )}

            {selectedTab === "cubic" && (
        <div>
          <p>09. O(n^3) Cubic:</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startMatrixMultiplication} disabled={!audioCtx}>
              Matrix Multiplication
            </button>
            <button onClick={startThreeSum} disabled={!audioCtx}>
              3-Sum Problem
            </button>
          </div>
        </div>
      )}

            {selectedTab === "polynomial" && (
        <div>
          <p>10. O(n^k) Polynomial (General):</p>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={startPolynomialEvaluation} disabled={!audioCtx}>
              Polynomial Evaluation
            </button>
            <button onClick={startMatrixExponentiation} disabled={!audioCtx}>
              Matrix Exponentiation
            </button>
          </div>
        </div>
      )}

{selectedTab === "exponential" && (
  <div>
    <p>11. O(2^n) Exponential (Base 2):</p>
    <div style={{ marginBottom: "1rem" }}>
      <button onClick={startFibonacci} disabled={!audioCtx}>
        Fibonacci Sequence
      </button>
      <button onClick={startSubsetSum} disabled={!audioCtx}>
        Subset Sum Problem
      </button>
    </div>
  </div>
)}

{selectedTab === "exponentialBaseC" && (
  <div>
    <p>12. O(c^n), c&gt;2 Exponential (Base c):</p>
    <div style={{ marginBottom: "1rem" }}>
      <button onClick={startTowersOfHanoi} disabled={!audioCtx}>
        Towers of Hanoi
      </button>
      <button onClick={startPermutations} disabled={!audioCtx}>
        Permutations
      </button>
    </div>
  </div>
)}

{selectedTab === "factorial" && (
  <div>
    <p>13. O(n!) Factorial:</p>
    <div style={{ marginBottom: "1rem" }}>
      <button onClick={startTravelingSalesman} disabled={!audioCtx}>
        Traveling Salesman Problem
      </button>
    </div>
  </div>
)}

{selectedTab === "subfactorial" && (
    <div>
        <p>14. O(n!/k^n) Subfactorial:</p>
        <div style={{ marginBottom: "1rem" }}>
            <button onClick={startDerangement} disabled={!audioCtx}>
                Derangement Problem
            </button>
        </div>
    </div>
)}

{selectedTab === "ackermann" && (
    <div>
        <p>15. O(A(n, n)) Ackermann:</p>
        <div style={{ marginBottom: "1rem" }}>
            <button onClick={startAckermann} disabled={!audioCtx}>
                Ackermann Function
            </button>
        </div>
    </div>
)}

{selectedTab === "doubleExponential" && (
    <div>
        <p>16. O(2^(2^n)) Double Exponential:</p>
        <div style={{ marginBottom: "1rem" }}>
            <button onClick={startDoubleExponential} disabled={!audioCtx}>
                Generate Subsets
            </button>
        </div>
    </div>
)}

      {/* Stop playback */}

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={stopPlayback} disabled={!audioCtx}>
          Stop
        </button>
      </div>

      <p>
        <strong>Current Algorithm:</strong> {currentAlgo || "None"}
      </p>

      <button onClick={() => setShowLogs(!showLogs)}>logs</button>
      {showLogs && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "400px",
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            zIndex: 9999,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <h3>Notes:</h3>
            <ul>
              {activePattern.map((p, i) => (
                <li key={i}>
                  Step {p.step}: {p.freq.toFixed(2)} Hz
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Steps:</h3>
            <ul>
              {algoSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Drum gains control */}
            <button onClick={() => setShowDrumGain(!showDrumGain)}>
              {showDrumGain ? "Hide" : "Show"} Drum Gains
            </button>
            {showDrumGain && (
              <div style={{ marginTop: "1rem" }}>
                {DRUM_TYPES.map((drumType) => (
                  <div key={drumType} style={{ marginBottom: "0.5rem" }}>
                    <label>{drumType}: </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.01"
                      value={drumGains[drumType]}
                      onChange={(e) => updateDrumGain(drumType, e.target.value)}
                    />
                    <span style={{ marginLeft: 8 }}>
                      {drumGains[drumType].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}


      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        {/* Audio frequencies */}
        <canvas
          ref={audioCanvasRef}
          width={400}
          height={200}
          style={{ border: "1px solid #ccc" }}
        />

        {/* Algorithm step text */}
        <canvas
          ref={algorithmCanvasRef}
          width={400}
          height={200}
          style={{ border: "1px solid #ccc" }}
        />

        {/* Drum grid */}
        <canvas
          ref={drumCanvasRef}
          width={400}
          height={200}
          style={{ border: "1px solid #ccc" }}
        />
      </div>
    </div>
  );
}
