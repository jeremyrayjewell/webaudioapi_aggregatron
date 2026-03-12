import React, { useState, useRef, useEffect, useMemo } from "react";
import { SCALES } from "./scales.js";
import { createPatternFromNotes } from "./patternHelpers.js";
import "./collapsible.css";
import {
  COMPLEXITY_TABS,
  resolveAlgorithmLines,
} from "./algorithms/catalog.js";
import {
  describeAlgorithmEntry,
  getAlgorithmEntry,
} from "./algorithms/registry.js";

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
  const visualClockIdRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const scheduledStepRef = useRef(0);
  const transportStartTimeRef = useRef(0);
  const tickDurationRef = useRef(0);
  const lastVisualStepRef = useRef(-1);
  const patternByStepRef = useRef([]);
  const rhythmPatternRef = useRef([]);
  const algoStepsRef = useRef([]);
  const algorithmNotesRef = useRef([]);
  const algorithmStreamRef = useRef(null);
  const algorithmStreamDoneRef = useRef(true);
  const sortDemoInputRef = useRef(new Map());
  const currentRawStepRef = useRef("");

  
  const [selectedRootNote, setSelectedRootNote] = useState("A");
  const [selectedScaleType, setSelectedScaleType] = useState("minor");
  const [selectedScaleVariation, setSelectedScaleVariation] = useState("pentatonic");
  const [selectedOctave, setSelectedOctave] = useState(0);
  
  const currentAlgoRef = useRef(null);
  const currentAlgorithmEntryRef = useRef(null);
  const MAX_DISPLAYED_STEPS = 10; 
  
  const stepRef = useRef(0);
  const displayedAlgoStepsRef = useRef([]);

  
  const audioCanvasRef = useRef(null);
  const pseudocodePanelRef = useRef(null);
  const algorithmPanelRef = useRef(null);
  const sourcePanelRef = useRef(null);
  const drumCanvasRef = useRef(null);
  
  const [showDrumGain, setShowDrumGain] = useState(false);
  
  const [showEnvelopeSection, setShowEnvelopeSection] = useState(true);
  const [showModulationSection, setShowModulationSection] = useState(false);
  const [showFilterSection, setShowFilterSection] = useState(false);
  const [showVibratoSection, setShowVibratoSection] = useState(false);
  
  const [waveform, setWaveform] = useState("sine");
  const [attack, setAttack] = useState(0.1);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.2);
  const [rate, setRate] = useState(1);
  const [depth, setDepth] = useState(0.5);
  const [modulatorOn, setModulatorOn] = useState(false);
  const [modulatorWaveform, setModulatorWaveform] = useState("sine");
  const [filterOn, setFilterOn] = useState(false);
  const [filterType, setFilterType] = useState("lowpass");
  const [filterFrequency, setFilterFrequency] = useState(1000);
  const [filterQ, setFilterQ] = useState(1);
  const [vibratoOn, setVibratoOn] = useState(false);
  const [vibratoRate, setVibratoRate] = useState(6);
  const [vibratoDepth, setVibratoDepth] = useState(5);  

  const [drumVariation, setDrumVariation] = useState("simple1");
  const [sortOrder, setSortOrder] = useState("ascending");
  const [activeVerificationLines, setActiveVerificationLines] = useState([
    "Algorithm Registry",
    "status: no active algorithm",
  ]);
  const resizeTimeoutRef = useRef(null);

  const setCanvasDisplaySize = (canvas, width, height) => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.dataset.logicalWidth = String(width);
    canvas.dataset.logicalHeight = String(height);
    canvas.dataset.dpr = String(dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.display = "block";
  };

  const getCanvasMetrics = (canvas, ctx) => {
    const logicalWidth = Number(canvas.dataset.logicalWidth || canvas.clientWidth || canvas.width);
    const logicalHeight = Number(canvas.dataset.logicalHeight || canvas.clientHeight || canvas.height);
    const dpr = Number(canvas.dataset.dpr || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: logicalWidth, height: logicalHeight };
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const rebuildPlaybackBuffers = () => {
    const pattern = createPatternFromNotes(algorithmNotesRef.current, 1);
    patternByStepRef.current = Array.from({ length: pattern.length }, () => []);
    pattern.forEach((noteItem) => {
      if (noteItem && noteItem.freq != null) {
        patternByStepRef.current[noteItem.step].push(noteItem);
      }
    });
    rhythmPatternRef.current = generateDrumPattern(
      pattern.length,
      drumVariation,
      { notes: algorithmNotesRef.current, steps: algoStepsRef.current }
    );
  };

  const consumeAlgorithmStream = (minimumNotes = 1, maxChunks = 8) => {
    if (!algorithmStreamRef.current || algorithmStreamDoneRef.current) return false;

    let chunksConsumed = 0;
    let notesAdded = 0;
    let changed = false;

    while (chunksConsumed < maxChunks && notesAdded < minimumNotes) {
      const nextChunk = algorithmStreamRef.current.next();
      if (nextChunk.done) {
        algorithmStreamDoneRef.current = true;
        break;
      }

      const chunk = nextChunk.value || {};
      if (Array.isArray(chunk.notes) && chunk.notes.length > 0) {
        algorithmNotesRef.current.push(...chunk.notes);
        notesAdded += chunk.notes.length;
        changed = true;
      }
      if (Array.isArray(chunk.steps) && chunk.steps.length > 0) {
        algoStepsRef.current.push(...chunk.steps);
        changed = true;
      }
      chunksConsumed++;
    }

    if (changed) {
      rebuildPlaybackBuffers();
    }

    return changed;
  };

  const formatFrequencyAsNote = (frequency) => {
    if (!Number.isFinite(frequency) || frequency <= 0) return "";
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const noteName = noteNames[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteName}${octave}`;
  };

  
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

  
  const updateDrumGain = (drumType, newGain) => {
    setDrumGains((prev) => ({
      ...prev,
      [drumType]: parseFloat(newGain),
    }));
  };

    
    const [numNotes, setNumNotes] = useState(1);

    
const [selectEven, setSelectEven] = useState(true);


  const getSafeSelectedScale = () => {
    const selectedScale = SCALES[selectedRootNote]?.[selectedScaleType]?.[selectedScaleVariation];
    
    if (!selectedScale) {
      console.error(`Scale variation ${selectedScaleVariation} not found for ${selectedRootNote} ${selectedScaleType}`);
      
      const currentScaleObj = SCALES[selectedRootNote]?.[selectedScaleType];
      if (currentScaleObj) {
          const availableVariations = Object.keys(currentScaleObj);
          if (availableVariations.length > 0) {
            const defaultVariation = availableVariations[0];
            console.log(`Using ${defaultVariation} scale variation instead.`);
          return [...currentScaleObj[defaultVariation]];
        }
      }
      
      return [110, 220, 330, 440];
    }
    
    return [...selectedScale];
  };

  const getOrderedScale = (scaleValues = getSafeSelectedScale()) =>
    [...scaleValues].sort((a, b) =>
      sortOrder === "descending" ? b - a : a - b
    );

  const getShuffledSortInput = (algorithmKey, refresh = false) => {
    const naturalScale = getSafeSelectedScale();
    const cacheKey = `${algorithmKey}|${naturalScale.join(",")}`;

    if (!refresh && sortDemoInputRef.current.has(cacheKey)) {
      return [...sortDemoInputRef.current.get(cacheKey)];
    }

    const shuffled = [...naturalScale];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (
      shuffled.length > 2 &&
      (shuffled.every((value, index, arr) => index === 0 || arr[index - 1] <= value) ||
        shuffled.every((value, index, arr) => index === 0 || arr[index - 1] >= value))
    ) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    sortDemoInputRef.current.set(cacheKey, shuffled);
    return [...shuffled];
  };

  const getAlgorithmExecutionContext = () => ({
    getSafeSelectedScale,
    getOrderedScale,
    getShuffledSortInput,
    numNotes,
    selectEven,
    sortOrder,
  });


  useEffect(() => {
    if (selectedRootNote === "Atonal") {
      
      
      setSelectedScaleType("minor");
      
      
      const atonalVariations = ["chromatic", "twelveToneRow", "microtonal24TET", "microtonal48TET", "randomSeries", "spectral"];
      if (!atonalVariations.includes(selectedScaleVariation)) {
        
        setSelectedScaleVariation("chromatic");
      }
    } else {
      
      const currentScaleObj = SCALES[selectedRootNote]?.[selectedScaleType];
      
      
      if (currentScaleObj && !currentScaleObj[selectedScaleVariation]) {
        
        const fallbacks = ["pentatonic", "blues", "chromatic", "major", "minor", "dorian", "mixolydian"];
        
        let foundFallback = false;
        for (const fallback of fallbacks) {
          if (currentScaleObj[fallback]) {
            console.log(`Scale variation ${selectedScaleVariation} not available for ${selectedRootNote} ${selectedScaleType}. Using ${fallback} instead.`);
            setSelectedScaleVariation(fallback);
            foundFallback = true;
            break;
          }
        }
        
        
        if (!foundFallback) {
          const availableVariations = Object.keys(currentScaleObj);
          if (availableVariations.length > 0) {
            console.log(`No preferred scale variations available. Using ${availableVariations[0]} instead.`);
            setSelectedScaleVariation(availableVariations[0]);
          }
        }
      }
    }
  }, [selectedRootNote, selectedScaleType]);
  
  const availableScaleVariations = useMemo(() => {
    if (selectedRootNote === "Atonal") {
      return [
        { value: "chromatic", label: "Chromatic" },
        { value: "twelveToneRow", label: "Twelve-Tone Row" },
        { value: "microtonal24TET", label: "Microtonal 24-TET" },
        { value: "microtonal48TET", label: "Microtonal 48-TET" },
        { value: "randomSeries", label: "Random Series" },
        { value: "spectral", label: "Spectral" }
      ];
    }

    const currentScaleObj = SCALES[selectedRootNote]?.[selectedScaleType] || {};
    const variationLabels = {
      pentatonic: "Pentatonic",
      blues: "Blues",
      harmonic: "Harmonic",
      melodic: "Melodic",
      chromatic: "Chromatic",
      wholeTone: "Whole Tone",
      dorian: "Dorian",
      phrygian: "Phrygian",
      lydian: "Lydian",
      mixolydian: "Mixolydian",
      doubleHarmonic: "Double Harmonic",
      octatonic: "Octatonic",
      microtonal: "Microtonal"
    };

    const variations = Object.keys(currentScaleObj)
      .filter((variation) => variationLabels[variation])
      .map((variation) => ({
        value: variation,
        label: variationLabels[variation]
      }));

    if (variations.length === 0) {
      console.warn(`No scale variations found for ${selectedRootNote} ${selectedScaleType}`);
      return [{ value: "pentatonic", label: "Pentatonic" }];
    }

    return variations;
  }, [selectedRootNote, selectedScaleType]);

  
  const createCustomWaveform = (type, frequency) => {
    if (!audioCtx) return null;
    
    
    const oscillator = audioCtx.createOscillator();
    
    
    if (['sine', 'square', 'sawtooth', 'triangle'].includes(type)) {
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      return oscillator;
    }
    
    
    switch (type) {
      case 'pulse': 
        
        const pulseWidth = 0.3; 
        const real = [0, pulseWidth, pulseWidth, pulseWidth, pulseWidth]; 
        const imag = [0, 0, 0, 0, 0]; 
        const wave = audioCtx.createPeriodicWave(
          new Float32Array(real), 
          new Float32Array(imag), 
          { disableNormalization: false }
        );
        oscillator.setPeriodicWave(wave);
        break;
          case 'fatsaw':
        
        const detuneFactor = 5; 
        const sawNode = audioCtx.createGain();
        
        
        const oscillators = [];
        for (let i = 0; i < 3; i++) {
          const detune = (i - 1) * detuneFactor;
          const detunedOsc = audioCtx.createOscillator();
          detunedOsc.type = 'sawtooth';
          detunedOsc.frequency.value = frequency + detune;
          detunedOsc.connect(sawNode);
          oscillators.push(detunedOsc);
          
          
          if (i === 0) {
            Object.defineProperty(sawNode, 'frequency', { 
              value: detunedOsc.frequency 
            });
          }
        }
        
        
        Object.defineProperty(sawNode, '_oscillators', { 
          value: oscillators 
        });
        
        
        Object.defineProperty(sawNode, 'start', { 
          value: (time) => {
            sawNode._oscillators.forEach(osc => osc.start(time));
          }
        });
        
        
        Object.defineProperty(sawNode, 'stop', { 
          value: (time) => {
            sawNode._oscillators.forEach(osc => osc.stop(time));
          }
        });
        
        sawNode.gain.value = 0.33; 
        return sawNode;
          case 'organ':
        
        const organNode = audioCtx.createGain();
        const harmonics = [1, 2, 3, 4, 6, 8];
        const volumes = [1, 0.6, 0.4, 0.25, 0.15, 0.08];
        const organOscs = [];
        
        harmonics.forEach((harmonic, i) => {
          const organOsc = audioCtx.createOscillator();
          organOsc.type = 'sine';
          organOsc.frequency.value = frequency * harmonic;
          
          const harmonicGain = audioCtx.createGain();
          harmonicGain.gain.value = volumes[i] || 0.1;
          
          organOsc.connect(harmonicGain);
          harmonicGain.connect(organNode);
          organOscs.push(organOsc);
        });
        
        
        Object.defineProperty(organNode, 'frequency', { 
          value: { value: frequency }
        });
        Object.defineProperty(organNode, '_oscillators', { 
          value: organOscs 
        });
        
        
        Object.defineProperty(organNode, 'start', { 
          value: (time) => {
            organNode._oscillators.forEach(osc => osc.start(time));
          }
        });
        
        
        Object.defineProperty(organNode, 'stop', { 
          value: (time) => {
            organNode._oscillators.forEach(osc => osc.stop(time));
          }
        });
        return organNode;
          case 'fm':
        
        const carrier = audioCtx.createOscillator();
        const modulator = audioCtx.createOscillator();
        const modulationIndex = audioCtx.createGain();
        
        
        carrier.frequency.value = frequency;
        modulator.frequency.value = frequency * 2; 
        modulationIndex.gain.value = 100; 
        
        
        modulator.connect(modulationIndex);
        modulationIndex.connect(carrier.frequency);
        
        
        Object.defineProperty(carrier, '_modulator', { 
          value: modulator 
        });
        
        
        const originalStart = carrier.start;
        Object.defineProperty(carrier, 'start', { 
          value: (time) => {
            originalStart.call(carrier, time);
            modulator.start(time);
          } 
        });
        
        
        Object.defineProperty(carrier, 'stop', { 
          value: (time) => {
            carrier.__proto__.stop.call(carrier, time);
            modulator.stop(time);
          }
        });
        return carrier;
        case 'vintage':
        
        const vintageOsc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const outputNode = audioCtx.createGain();
        
        vintageOsc.type = 'sawtooth';
        vintageOsc.frequency.value = frequency * (1 + (Math.random() * 0.01 - 0.005)); 
        
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 8;
        
        vintageOsc.connect(filter);
        filter.connect(outputNode);
        
        
        Object.defineProperty(outputNode, 'frequency', { 
          value: vintageOsc.frequency 
        });
        Object.defineProperty(outputNode, '_oscillator', { 
          value: vintageOsc 
        });
        
        
        Object.defineProperty(outputNode, 'start', { 
          value: (time) => {
            vintageOsc.start(time);
          }
        });
        
        
        Object.defineProperty(outputNode, 'stop', { 
          value: (time) => {
            vintageOsc.stop(time);
          }
        });
        return outputNode;
      
      default:
        
        oscillator.type = 'sine';
    }
    
    oscillator.frequency.value = frequency;
    return oscillator;
  };

  
  
  
  const playNote = (freq, startTime, durationSeconds = 0.2) => {
    if (!audioCtx) return;
    const adjustedFreq = freq * Math.pow(2, selectedOctave);
    
    
    const oscillator = createCustomWaveform(waveform, adjustedFreq);
    if (!oscillator) return;

    const gainNode = audioCtx.createGain();
    const now = startTime ?? audioCtx.currentTime;
    const attackTime = parseFloat(attack);
    const decayTime = parseFloat(decay);
    const sustainLevel = parseFloat(sustain);
    const releaseTime = parseFloat(release);

    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(depth, now + attackTime);

    
    gainNode.gain.linearRampToValueAtTime(
      sustainLevel * depth,
      now + attackTime + decayTime
    );
    
    
    let audioOutput = gainNode;
    
    if (filterOn) {
      const filter = audioCtx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = parseFloat(filterFrequency);
      filter.Q.value = parseFloat(filterQ);
      
      audioOutput.connect(filter);
      audioOutput = filter;
    }
    
    
    oscillator.connect(audioOutput);
    audioOutput.connect(analyser);
    oscillator.start(now);
    
    
    if (modulatorOn && rate !== 1) {
      const modOscillator = audioCtx.createOscillator();
      modOscillator.type = modulatorWaveform; 
      modOscillator.frequency.value = parseFloat(rate);
      const modGain = audioCtx.createGain();
      modGain.gain.value = parseFloat(depth); 

      modOscillator.connect(modGain);
      modGain.connect(gainNode.gain);
      modOscillator.start(now);
      modOscillator.stop(now + durationSeconds + releaseTime);
    }
    
    
    if (vibratoOn) {
      const vibratoOsc = audioCtx.createOscillator();
      vibratoOsc.type = 'sine';
      vibratoOsc.frequency.value = parseFloat(vibratoRate);
      
      const vibratoGain = audioCtx.createGain();
      vibratoGain.gain.value = parseFloat(vibratoDepth);
      
      vibratoOsc.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibratoOsc.start(now);
      vibratoOsc.stop(now + durationSeconds + releaseTime);
    }

    const noteOffTime = now + durationSeconds;
    gainNode.gain.setValueAtTime(
      Math.max(0.0001, sustainLevel * depth),
      noteOffTime
    );
    gainNode.gain.linearRampToValueAtTime(0.0001, noteOffTime + releaseTime);

    if (typeof oscillator.stop === 'function') {
      oscillator.stop(noteOffTime + releaseTime);
    }
  };  
  
  
  
  function drawAudioCanvas(frequencies) {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = getCanvasMetrics(canvas, ctx);
    ctx.clearRect(0, 0, width, height);
  
    if (frequencies.length === 0) return;
    const maxFreq = 800; 
    const horizontalPadding = 6;
    const availableWidth = Math.max(1, width - horizontalPadding * 2);
    const gap = Math.max(2, Math.floor(availableWidth * 0.04));
    const totalGapWidth = gap * Math.max(0, frequencies.length - 1);
    const barWidth = Math.max(
      6,
      Math.floor((availableWidth - totalGapWidth) / Math.max(1, frequencies.length))
    );
    const contentWidth = barWidth * frequencies.length + totalGapWidth;
    let xPos = Math.max(horizontalPadding, Math.floor((width - contentWidth) / 2));

    const bgColor = '#000000';           
    const highlightColor = '#ffffff';    
    const textColor = '#00ff00';         
    const borderColor = '#00aaaa';       
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    ctx.fillStyle = highlightColor;
    frequencies.forEach((freq) => {
      const barHeight = Math.min(150, (freq / maxFreq) * height * 0.8);
      const yPos = height - barHeight - 10;
      
      const gradient = ctx.createLinearGradient(xPos, yPos, xPos, yPos + barHeight);
      gradient.addColorStop(0, '#00aaaa');  
      gradient.addColorStop(0.7, '#0000aa'); 
      gradient.addColorStop(1, '#000044');   
      
      ctx.fillStyle = gradient;
      ctx.fillRect(xPos, yPos, barWidth, barHeight);
      
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(xPos, yPos, barWidth, barHeight);
      
      ctx.fillStyle = textColor;
      ctx.font = "12px 'Px437_IBM_EGA8', 'DOS', monospace";
      ctx.fillText(
        `${freq.toFixed(0)}Hz ${formatFrequencyAsNote(freq)}`,
        xPos,
        yPos - 5
      );
      
      xPos += barWidth + gap;
    });
  }
    
  
  
  
  function drawPseudocodeCanvas() {
    const panel = pseudocodePanelRef.current;
    if (!panel) return;
    const activeAlgo = currentAlgoRef.current;
    const pseudocode = getAlgorithmPseudocode(activeAlgo);
    const highlightedLine = getHighlightedPseudocodeLine(activeAlgo, currentRawStepRef.current);
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

  function drawSourcePanel() {
    const panel = sourcePanelRef.current;
    if (!panel) return;
    const activeAlgo = currentAlgoRef.current;

    panel.innerHTML = getAlgorithmSource(activeAlgo)
      .map(
        (line) =>
          `<div class="visualizer-line visualizer-line-source">${escapeHtml(line)}</div>`
      )
      .join("");
  }

  function drawAlgorithmCanvas(stepText, stepsToDisplay = null) {
    const panel = algorithmPanelRef.current;
    if (!panel) return;
    const activeAlgo = currentAlgoRef.current;
    const visibleSteps = stepsToDisplay || displayedAlgoStepsRef.current;
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
            activeAlgo,
            step.substring(step.indexOf("]") + 1).trim()
          );
          return `<div class="${className}"><span class="visualizer-line-label">[${escapeHtml(
            stepNum
          )}]</span> <span>${escapeHtml(formatted)}</span></div>`;
        }

        return `<div class="${className}">${escapeHtml(
          formatStepAsPseudocode(activeAlgo, step)
        )}</div>`;
      })
      .join("");
  }

  function formatStepAsPseudocode(algoName, rawStep) {
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

  function getAlgorithmPseudocode(algorithmMeta) {
  if (!algorithmMeta) {
    return ["function algorithm(...)", "  // pseudocode unavailable", "  // trace shown at right"];
  }
  return resolveAlgorithmLines(algorithmMeta.pseudocode, { sortOrder });
}

function getAlgorithmSource(algorithmMeta) {
  if (!algorithmMeta) {
    return ["// implementation source unavailable"];
  }
  return resolveAlgorithmLines(algorithmMeta.source, { sortOrder });
}

function getHighlightedPseudocodeLine(algorithmMeta, rawStep) {
  if (!algorithmMeta?.highlightLine) return -1;
  return algorithmMeta.highlightLine(rawStep || "", { sortOrder });
}

  function drawDrumGrid(rhythmPattern, currentStep) {
    const canvas = drumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = getCanvasMetrics(canvas, ctx);
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    
    
    const patternLen = rhythmPattern.length;
    const drumTypes = DRUM_TYPES;
    const rowCount = drumTypes.length;

    
    const cellWidth = Math.max(12, Math.floor(width / patternLen) - 1);
    const cellHeight = Math.max(12, Math.floor(height / rowCount) - 1);

    for (let step = 0; step < patternLen; step++) {
      const drumType = rhythmPattern[step];
      const rowIndex = drumTypes.indexOf(drumType);

      for (let row = 0; row < rowCount; row++) {
        const x = step * cellWidth;
        const y = row * cellHeight;

        
        if (step === currentStep) {
          ctx.fillStyle = "#ddd";
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }

        
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
          
          ctx.strokeStyle = "#aaa";
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      }
    }
  }

  
  
  
  const updateVisualsForStep = (step) => {
    const currentPatternLength = patternByStepRef.current.length;
    if (!audioCtx || currentPatternLength === 0) return;

    const wrappedStep = step % currentPatternLength;
    const notesToPlay = patternByStepRef.current[wrappedStep] || [];
    drawAudioCanvas(notesToPlay.map((noteItem) => noteItem.freq));

    const currentAlgoStepText =
      algoStepsRef.current.length > 0
        ? algoStepsRef.current[step % algoStepsRef.current.length] || ""
        : "";
    currentRawStepRef.current = currentAlgoStepText;

    if (currentAlgoStepText && currentAlgoStepText.trim() !== "") {
      const formattedStepText = `[${step}] ${currentAlgoStepText}`;
      const currentDisplayedSteps = displayedAlgoStepsRef.current;

      if (!currentDisplayedSteps.includes(formattedStepText)) {
        const newSteps = [...currentDisplayedSteps, formattedStepText];
        const panel = algorithmPanelRef.current;
        const lineHeight = 20;
        const availableHeight = panel ? (panel.clientHeight - 24) : 240;
        const maxVisibleSteps = Math.floor(availableHeight / lineHeight);
        const effectiveMaxSteps = Math.max(maxVisibleSteps, MAX_DISPLAYED_STEPS);

        displayedAlgoStepsRef.current =
          newSteps.length > effectiveMaxSteps
            ? newSteps.slice(-effectiveMaxSteps)
            : newSteps;
      }
      }

      drawPseudocodeCanvas();
      drawSourcePanel();
      drawAlgorithmCanvas("", displayedAlgoStepsRef.current);
      drawDrumGrid(rhythmPatternRef.current, wrappedStep);
  };

  const startClock = () => {
    stopClock();

    if (!audioCtx || patternByStepRef.current.length === 0) return;

    const secondsPerBeat = 60 / bpm;
    const tickDuration = secondsPerBeat / TICKS_PER_BEAT;
    const lookAheadMs = 50;
    const scheduleAheadTime = 0.35;

    scheduledStepRef.current = 0;
    transportStartTimeRef.current = audioCtx.currentTime + 0.1;
    nextNoteTimeRef.current = transportStartTimeRef.current;
    tickDurationRef.current = tickDuration;
    lastVisualStepRef.current = -1;

    const scheduleStep = (step, scheduledTime) => {
      const currentPatternLength = patternByStepRef.current.length;
      if (currentPatternLength === 0) return;
      const wrappedStep = step % currentPatternLength;
      const notesToPlay = patternByStepRef.current[wrappedStep] || [];

      notesToPlay.forEach((noteItem) => {
        playNote(noteItem.freq, scheduledTime, tickDuration * 0.9);
      });

      const drumStep = rhythmPatternRef.current[wrappedStep];
      if (drumStep) {
        playDrum(audioCtx, drumStep, 1, drumGains[drumStep], scheduledTime);
      }
    };

    const scheduler = () => {
      const currentPatternLength = patternByStepRef.current.length;
      if (algorithmStreamRef.current && !algorithmStreamDoneRef.current) {
        const remainingSteps = currentPatternLength - scheduledStepRef.current;
        if (remainingSteps < 16) {
          consumeAlgorithmStream(16, 12);
        }
      }

      if (patternByStepRef.current.length === 0) return;

      while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
        const currentStep = scheduledStepRef.current;
        scheduleStep(currentStep, nextNoteTimeRef.current);
        nextNoteTimeRef.current += tickDuration;
        scheduledStepRef.current = currentStep + 1;
      }
    };

    scheduler();
    clockIdRef.current = setInterval(scheduler, lookAheadMs);
    visualClockIdRef.current = setInterval(() => {
      if (!audioCtx || tickDurationRef.current <= 0) return;
      const elapsed = audioCtx.currentTime - transportStartTimeRef.current;
      if (elapsed < 0) return;

      const visualStep = Math.floor(elapsed / tickDurationRef.current);
      if (visualStep === lastVisualStepRef.current) return;

      lastVisualStepRef.current = visualStep;
      updateVisualsForStep(visualStep);
    }, 50);
  };
  
  const stopClock = () => {
    if (clockIdRef.current) {
      clearInterval(clockIdRef.current);
      clockIdRef.current = null;
    }
    if (visualClockIdRef.current) {
      clearInterval(visualClockIdRef.current);
      visualClockIdRef.current = null;
    }

    drawAlgorithmCanvas("", displayedAlgoStepsRef.current); 
    drawPseudocodeCanvas();
    drawSourcePanel();
    drawDrumGrid([], -1);
  };
   
  
  
  const setupAlgorithm = (algorithmEntry, algorithmData) => {
    
    stopClock();
    
    
    displayedAlgoStepsRef.current = [];
    
    
    drawPseudocodeCanvas();
    drawSourcePanel();
    drawAlgorithmCanvas("", []);
      
    
    setTimeout(() => {
      currentAlgorithmEntryRef.current = algorithmEntry;
      currentAlgoRef.current = algorithmEntry.meta;
      algoStepsRef.current = [...(algorithmData.steps || [])];
      algorithmNotesRef.current = [...(algorithmData.notes || [])];
      algorithmStreamRef.current = algorithmData.stream || null;
      algorithmStreamDoneRef.current = !algorithmData.stream;
      setActiveVerificationLines(describeAlgorithmEntry(algorithmEntry));
      stepRef.current = 0; 

      if (algorithmStreamRef.current) {
        consumeAlgorithmStream(24, 24);
      } else {
        rebuildPlaybackBuffers();
      }
      
      
      drawPseudocodeCanvas();
      drawSourcePanel();
      drawAlgorithmCanvas("", []); 
      drawDrumGrid(rhythmPatternRef.current, -1);
      drawAudioCanvas([]);
      
      
      
      requestAnimationFrame(() => {
        startClock();
      });
    }, 100);
  }; 

  const startAlgorithmById = (algorithmId, options = {}) => {
    const algorithmEntry = getAlgorithmEntry(algorithmId);
    if (!algorithmEntry) {
      console.error(`Algorithm registry entry not found for ${algorithmId}`);
      return;
    }

    const algorithmData = algorithmEntry.run(
      getAlgorithmExecutionContext(),
      options
    );
    setupAlgorithm(algorithmEntry, algorithmData);
  };
  
  
  
  const stopPlayback = () => {
    currentAlgorithmEntryRef.current = null;
    currentAlgoRef.current = null;
    stopClock();
    algorithmNotesRef.current = [];
    algorithmStreamRef.current = null;
    algorithmStreamDoneRef.current = true;
    patternByStepRef.current = [];
    rhythmPatternRef.current = [];
    algoStepsRef.current = [];
    displayedAlgoStepsRef.current = [];
    setActiveVerificationLines(describeAlgorithmEntry(null));
    drawAudioCanvas([]);
    drawPseudocodeCanvas();
    drawSourcePanel();
    drawAlgorithmCanvas("", []);
    drawDrumGrid([], -1);
  };
  
  
  
  useEffect(() => {
    const handleResize = () => {
      if (audioCanvasRef.current) {
        const container = audioCanvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = Math.max(160, container.clientHeight || Math.round(width * 2.2));
          setCanvasDisplaySize(audioCanvasRef.current, width, height);
        }
      }
      
      if (drumCanvasRef.current) {
        const container = drumCanvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = Math.min(240, container.clientHeight || width / 3);
          setCanvasDisplaySize(drumCanvasRef.current, width, height);
        }
      }
    };

    handleResize();
    drawPseudocodeCanvas();
    drawAlgorithmCanvas("", displayedAlgoStepsRef.current);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (resizeTimeoutRef.current) {
              clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(handleResize, 50);
          })
        : null;

    [
      audioCanvasRef.current?.parentElement,
      pseudocodePanelRef.current?.parentElement,
      algorithmPanelRef.current?.parentElement,
      drumCanvasRef.current?.parentElement,
    ]
      .filter(Boolean)
      .forEach((element) => resizeObserver?.observe(element));

    const debouncedResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(handleResize, 120);
    };

    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      resizeObserver?.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    drawPseudocodeCanvas();
    drawSourcePanel();
  }, [sortOrder]);

  const verificationPanelText = activeVerificationLines.join("\n");
  
  
  
  return (
    <div className="container-fluid dos-content">
      <div className="row mt-3 mb-3">
        <div className="col-12">
          <div className="dos-panel">
            <h3>Synthesis & Scale <span className="blink">_</span></h3>
            <div className="row">
              <div className="col-md-6">                <div className="form-group dos-form-group">
                  <label htmlFor="waveform">Waveform:</label>
                  <select
                    id="waveform"
                    className="form-control dos-control"
                    value={waveform}
                    onChange={(e) => setWaveform(e.target.value)}
                    title="Choose a waveform type for the synthesizer. Standard waveforms (sine, square, sawtooth, triangle) are built-in. Custom waveforms provide richer sound textures."
                  ><option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                    <option value="pulse">Pulse</option>
                    <option value="fatsaw">Fat Sawtooth</option>
                    <option value="organ">Organ</option>
                    <option value="fm">FM Synth</option>
                    <option value="vintage">Vintage Synth</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group dos-form-group">
                  <label htmlFor="bpm">BPM:</label>
                  <input
                    id="bpm"
                    type="number"
                    className="form-control dos-control"
                    min="20"
                    max="300"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-4">
                <div className="form-group dos-form-group">
                  <label htmlFor="rootNote">Root Note:</label>
                  <select
                    id="rootNote"
                    className="form-control dos-control"
                    value={selectedRootNote}
                    onChange={(e) => setSelectedRootNote(e.target.value)}
                  >                    {["A", "B", "C", "D", "E", "F", "G", "Atonal"].map(
                      (note) => (
                        <option key={note} value={note}>
                          {note}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>              <div className="col-md-4">
                <div className="form-group dos-form-group">
                  <label htmlFor="scaleType">Scale Type:</label>
                  <select
                    id="scaleType"
                    className="form-control dos-control"
                    value={selectedScaleType}
                    onChange={(e) => setSelectedScaleType(e.target.value)}
                  >
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                  </select>
                </div>
              </div><div className="col-md-4">
                <div className="form-group dos-form-group">
                  <label htmlFor="scaleVariation">Scale Variation:</label>
                  <select
                    id="scaleVariation"
                    className="form-control dos-control"
                    value={selectedScaleVariation}
                    onChange={(e) => setSelectedScaleVariation(e.target.value)}
                  >
                    {availableScaleVariations.map((variation) => (
                      <option key={variation.value} value={variation.value}>
                        {variation.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12">
                <div className="form-group dos-form-group">
                  <label htmlFor="octave">Octave: {selectedOctave}</label>
                  <input
                    id="octave"
                    type="range"
                    className="form-control-range dos-range"
                    min="-2"
                    max="2"
                    step="1"
                    value={selectedOctave}
                    onChange={(e) => setSelectedOctave(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div className="row">
        <div className="col-12">
          <div className="dos-panel">
            <h3>Envelope & Modulation <span className="blink">_</span></h3>
            
            {}            <div className="row mt-3">
              <div className="col-12">
                <div className="dos-subtitle-container">                  <h4 className="dos-subtitle">
                    ADSR Envelope
                    <span 
                      className="collapse-indicator" 
                      onClick={() => setShowEnvelopeSection(!showEnvelopeSection)}
                      title={showEnvelopeSection ? "Collapse section" : "Expand section"}
                    >
                      {showEnvelopeSection ? '[-]' : '[+]'}
                    </span>
                  </h4>
                </div>
              </div>
            </div>
            
            <div className={`collapsible-section ${showEnvelopeSection ? 'collapsible-section-expanded' : 'collapsible-section-collapsed'}`}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group dos-form-group">
                    <label>Attack: {attack}</label>
                    <input
                      type="range"
                      className="form-control-range dos-range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={attack}
                      onChange={(e) => setAttack(e.target.value)}
                    />
                  </div>
                  <div className="form-group dos-form-group">
                    <label>Decay: {decay}</label>
                    <input
                      type="range"
                      className="form-control-range dos-range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={decay}
                      onChange={(e) => setDecay(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group dos-form-group">
                    <label>Sustain: {sustain}</label>
                    <input
                      type="range"
                      className="form-control-range dos-range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={sustain}
                      onChange={(e) => setSustain(e.target.value)}
                    />
                  </div>
                  <div className="form-group dos-form-group">
                    <label>Release: {release}</label>
                    <input
                      type="range"
                      className="form-control-range dos-range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={release}
                      onChange={(e) => setRelease(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {}            <div className="row mt-3">
              <div className="col-12">
                <div className="dos-subtitle-container">                  <h4 className="dos-subtitle">
                    Amplitude Modulation
                    <span 
                      className="collapse-indicator"
                      onClick={() => setShowModulationSection(!showModulationSection)}
                      title={showModulationSection ? "Collapse section" : "Expand section"}
                    >
                      {showModulationSection ? '[-]' : '[+]'}
                    </span>
                    {modulatorOn && <span className="status-indicator">[ON]</span>}
                  </h4>
                </div>
              </div>
            </div>
            
            <div className={`collapsible-section ${showModulationSection ? 'collapsible-section-expanded' : 'collapsible-section-collapsed'}`}>
              <div className="row">
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      id="modulatorCheckbox"
                      className="form-check-input dos-checkbox"
                      type="checkbox"
                      checked={modulatorOn}
                      onChange={(e) => setModulatorOn(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="modulatorCheckbox">
                      Amplitude Modulator On
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group dos-form-group">
                    <label htmlFor="modulatorWaveform">Waveform:</label>
                    <select
                      id="modulatorWaveform"
                      className="form-control dos-control"
                      value={modulatorWaveform}
                      onChange={(e) => setModulatorWaveform(e.target.value)}
                      disabled={!modulatorOn}
                    >
                      <option value="sine">Sine</option>
                      <option value="square">Square</option>
                      <option value="sawtooth">Sawtooth</option>
                      <option value="triangle">Triangle</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group dos-form-group">
                    <label htmlFor="rate">Rate:</label>
                    <input
                      id="rate"
                      type="number"
                      className="form-control dos-control"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      disabled={!modulatorOn}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group dos-form-group">
                    <label htmlFor="depth">Depth:</label>
                    <input
                      id="depth"
                      type="number"
                      className="form-control dos-control"
                      step="0.1"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      disabled={!modulatorOn}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {}            <div className="row mt-3">
              <div className="col-12">
                <div className="dos-subtitle-container">                  <h4 className="dos-subtitle">
                    Filter
                    <span 
                      className="collapse-indicator" 
                      onClick={() => setShowFilterSection(!showFilterSection)}
                      title={showFilterSection ? "Collapse section" : "Expand section"}
                    >
                      {showFilterSection ? '[-]' : '[+]'}
                    </span>
                    {filterOn && <span className="status-indicator">[ON]</span>}
                  </h4>
                </div>
              </div>
            </div>
            
            <div className={`collapsible-section ${showFilterSection ? 'collapsible-section-expanded' : 'collapsible-section-collapsed'}`}>
              <div className="row">
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      id="filterCheckbox"
                      className="form-check-input dos-checkbox"
                      type="checkbox"
                      checked={filterOn}
                      onChange={(e) => setFilterOn(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="filterCheckbox">
                      Filter On
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group dos-form-group">
                    <label htmlFor="filterType">Type:</label>
                    <select
                      id="filterType"
                      className="form-control dos-control"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      disabled={!filterOn}
                    >
                      <option value="lowpass">Low Pass</option>
                      <option value="highpass">High Pass</option>
                      <option value="bandpass">Band Pass</option>
                      <option value="notch">Notch</option>
                      <option value="allpass">All Pass</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group dos-form-group">
                    <label htmlFor="filterFrequency">Frequency:</label>
                    <input
                      id="filterFrequency"
                      type="range"
                      className="form-control-range dos-range"
                      min="20"
                      max="20000"
                      step="1"
                      value={filterFrequency}
                      onChange={(e) => setFilterFrequency(e.target.value)}
                      disabled={!filterOn}
                    />
                    <span className="dos-value-display">{filterFrequency} Hz</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group dos-form-group">
                    <label htmlFor="filterQ">Resonance (Q):</label>
                    <input
                      id="filterQ"
                      type="range"
                      className="form-control-range dos-range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={filterQ}
                      onChange={(e) => setFilterQ(e.target.value)}
                      disabled={!filterOn}
                    />
                    <span className="dos-value-display">{filterQ}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {}            <div className="row mt-3">
              <div className="col-12">
                <div className="dos-subtitle-container">                  <h4 className="dos-subtitle">
                    Vibrato
                    <span 
                      className="collapse-indicator" 
                      onClick={() => setShowVibratoSection(!showVibratoSection)}
                      title={showVibratoSection ? "Collapse section" : "Expand section"}
                    >
                      {showVibratoSection ? '[-]' : '[+]'}
                    </span>
                    {vibratoOn && <span className="status-indicator">[ON]</span>}
                  </h4>
                </div>
              </div>
            </div>
            
            <div className={`collapsible-section ${showVibratoSection ? 'collapsible-section-expanded' : 'collapsible-section-collapsed'}`}>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      id="vibratoCheckbox"
                      className="form-check-input dos-checkbox"
                      type="checkbox"
                      checked={vibratoOn}
                      onChange={(e) => setVibratoOn(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="vibratoCheckbox">
                      Vibrato On
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group dos-form-group">
                    <label htmlFor="vibratoRate">Rate:</label>
                    <input
                      id="vibratoRate"
                      type="range"
                      className="form-control-range dos-range"
                      min="0.5"
                      max="20"
                      step="0.1"
                      value={vibratoRate}
                      onChange={(e) => setVibratoRate(e.target.value)}
                      disabled={!vibratoOn}
                    />
                    <span className="dos-value-display">{vibratoRate} Hz</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group dos-form-group">
                    <label htmlFor="vibratoDepth">Depth:</label>
                    <input
                      id="vibratoDepth"
                      type="range"
                      className="form-control-range dos-range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={vibratoDepth}
                      onChange={(e) => setVibratoDepth(e.target.value)}
                      disabled={!vibratoOn}
                    />
                    <span className="dos-value-display">{vibratoDepth}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <div className="dos-panel">            <h3>Big-O Time Complexity <span className="blink">_</span></h3>
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
              <select
                id="globalOrder"
                className="form-control dos-control"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </div>
            
            <div className="tab-content dos-tab-content mt-3">              {}              {selectedTab === "constant" && (
                <div className="dos-tab-pane">
                  <h4>01. O(1) Constant <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">                      <button className="btn dos-btn" onClick={() => startAlgorithmById("accessElement")} disabled={!audioCtx}>
                        Access Element
                      </button>
                      <p className="mt-2 dos-description">
                        Direct array indexing with constant time complexity.
                      </p>
                      <div className="form-group dos-form-group mt-2">
                        <label htmlFor="numNotes">Number of Notes:</label>
                        <input
                          id="numNotes"
                          type="number"
                          className="form-control dos-control"
                          value={numNotes}
                          onChange={(e) => setNumNotes(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">                      <button className="btn dos-btn" onClick={() => startAlgorithmById("parityCheck")} disabled={!audioCtx}>
                        Parity Check
                      </button>
                      <p className="mt-2 dos-description">
                        Constant-time parity test on an integer index.
                      </p>
                      <div className="form-group dos-form-group mt-2">
                        <div className="form-check">
                          <input
                            id="evenRadio"
                            className="form-check-input dos-radio"
                            type="radio"
                            name="evenOdd"
                            checked={selectEven === true}
                            onChange={() => setSelectEven(true)}
                          />
                          <label className="form-check-label" htmlFor="evenRadio">
                            Even
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            id="oddRadio"
                            className="form-check-input dos-radio"
                            type="radio"
                            name="evenOdd"
                            checked={selectEven === false}
                            onChange={() => setSelectEven(false)}
                          />
                          <label className="form-check-label" htmlFor="oddRadio">
                            Odd
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">                    <div className="col-12">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("firstElement")} disabled={!audioCtx}>
                        First Element
                      </button>
                      <p className="mt-2 dos-description">
                        Immediately access the first element of an array.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "doublelogarithmic" && (
                <div className="dos-tab-pane">
                  <h4>02. O(log log n) Double Logarithmic <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("interpolationSearch")} disabled={!audioCtx}>
                        Interpolation Search
                      </button>
                      <p className="mt-2 dos-description">
                        Canonical average-case O(log log n) search on sorted, near-uniform data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "logarithmic" && (
                <div className="dos-tab-pane">
                  <h4>03. O(log n) Logarithmic <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("binarySearch")} disabled={!audioCtx}>
                        Binary Search
                      </button>
                      <p className="mt-2 dos-description">
                        Divide a sorted array in half repeatedly to find a target value.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("exponentiationBySquaring")} disabled={!audioCtx}>
                        Exponentiation by Squaring
                      </button>
                      <p className="mt-2 dos-description">
                        Efficiently compute large powers by squaring.
                      </p>
                    </div>
                  </div>
                  <div className="row mt-2">                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("euclideanAlgorithm")} disabled={!audioCtx}>
                        Euclidean Algorithm
                      </button>
                      <p className="mt-2 dos-description">
                        Compute the greatest common divisor by repeated remainder reduction.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("binaryHeapInsert")} disabled={!audioCtx}>
                        Binary Heap Insert
                      </button>
                      <p className="mt-2 dos-description">
                        Insert into a max-heap and bubble upward until the heap invariant is restored.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("heapRootPath")} disabled={!audioCtx}>
                        Heap Root Path
                      </button>
                      <p className="mt-2 dos-description">
                        Follow parent indices from a node in an implicit binary heap array back to the root.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "polylogarithmic" && (
                <div className="dos-tab-pane">
                  <h4>04. O((log n)^2) Polylogarithmic <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("fenwick2d")} disabled={!audioCtx}>
                        2D Fenwick Tree Query
                      </button>
                      <p className="mt-2 dos-description">
                        Query a 2D Binary Indexed Tree in O(log^2 n).
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "sublinear" && (
                <div className="dos-tab-pane">
                  <h4>05. O(sqrt(n)) Sublinear <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("sqrtDecomposition")} disabled={!audioCtx}>
                        Sqrt Decomposition Query
                      </button>
                      <p className="mt-2 dos-description">
                        Answer a range query using sqrt decomposition blocks.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("jumpSearch")} disabled={!audioCtx}>
                        Jump Search
                      </button>
                      <p className="mt-2 dos-description">
                        Canonical sublinear search by jumping ahead in sqrt(n)-sized blocks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "linear" && (
                <div className="dos-tab-pane">
                  <h4>06. O(n) Linear <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("linearSearch")} disabled={!audioCtx}>
                        Linear Search
                      </button>
                      <p className="mt-2 dos-description">
                        Sequentially check each element in a collection.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("sumOfElements")} disabled={!audioCtx}>
                        Sum of Elements
                      </button>
                      <p className="mt-2 dos-description">
                        Add up all elements in an array.
                      </p>
                    </div>
                  </div>
                  <div className="row mt-2">                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("findMaximum")} disabled={!audioCtx}>
                        Find Maximum
                      </button>
                      <p className="mt-2 dos-description">
                        Scan through array once to find highest value.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("countOccurrences")} disabled={!audioCtx}>
                        Count Occurrences
                      </button>
                      <p className="mt-2 dos-description">
                        Count how many times a value appears in array.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "linearithmic" && (
                <div className="dos-tab-pane">
                  <h4>07. O(n log n) Linearithmic <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="dos-btn-group">
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("mergeSort")} disabled={!audioCtx}>
                          Merge Sort
                        </button>
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("mergeSort", { refreshInput: true })} disabled={!audioCtx}>
                          RESORT
                        </button>
                      </div>
                      <p className="mt-2 dos-description">
                        Divide, sort, and merge approach.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <div className="dos-btn-group">
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("heapSort")} disabled={!audioCtx}>
                          Heap Sort
                        </button>
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("heapSort", { refreshInput: true })} disabled={!audioCtx}>
                          RESORT
                        </button>
                      </div>
                      <p className="mt-2 dos-description">
                        Sort using a binary heap data structure.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <div className="dos-btn-group">
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("quickSort")} disabled={!audioCtx}>
                          Quick Sort
                        </button>
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("quickSort", { refreshInput: true })} disabled={!audioCtx}>
                          RESORT
                        </button>
                      </div>
                      <p className="mt-2 dos-description">
                        Partition and conquer sorting algorithm.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "quadratic" && (
                <div className="dos-tab-pane">
                  <h4>08. O(n^2) Quadratic <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="dos-btn-group">
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("bubbleSort")} disabled={!audioCtx}>
                          Bubble Sort
                        </button>
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("bubbleSort", { refreshInput: true })} disabled={!audioCtx}>
                          RESORT
                        </button>
                      </div>
                      <p className="mt-2 dos-description">
                        Repeatedly swap adjacent elements if they are in wrong order.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <div className="dos-btn-group">
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("selectionSort")} disabled={!audioCtx}>
                          Selection Sort
                        </button>
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("selectionSort", { refreshInput: true })} disabled={!audioCtx}>
                          RESORT
                        </button>
                      </div>
                      <p className="mt-2 dos-description">
                        Find smallest element and place at the beginning.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <div className="dos-btn-group">
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("insertionSort")} disabled={!audioCtx}>
                          Insertion Sort
                        </button>
                        <button className="btn dos-btn" onClick={() => startAlgorithmById("insertionSort", { refreshInput: true })} disabled={!audioCtx}>
                          RESORT
                        </button>
                      </div>
                      <p className="mt-2 dos-description">
                        Build sorted array one element at a time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "cubic" && (
                <div className="dos-tab-pane">
                  <h4>09. O(n^3) Cubic <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("matrixMultiplication")} disabled={!audioCtx}>
                        Matrix Multiplication
                      </button>
                      <p className="mt-2 dos-description">
                        Multiply two n×n matrices using standard algorithm.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("threeSum")} disabled={!audioCtx}>
                        3-Sum Problem
                      </button>
                      <p className="mt-2 dos-description">
                        Find all triplets in an array that sum to a given value.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "polynomial" && (
                <div className="dos-tab-pane">
                  <h4>10. O(n^k) Polynomial <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("kCliqueSearch")} disabled={!audioCtx}>
                        k-Clique Search
                      </button>
                      <p className="mt-2 dos-description">
                        Brute-force search for a clique of fixed size k.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("kSumEnumeration")} disabled={!audioCtx}>
                        k-SUM Search
                      </button>
                      <p className="mt-2 dos-description">
                        Enumerate all length-k tuples and test each one against a deterministic target sum.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "exponential" && (
                <div className="dos-tab-pane">
                  <h4>11. O(2^n) Exponential <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("fibonacci")} disabled={!audioCtx}>
                        Fibonacci (recursive)
                      </button>
                      <p className="mt-2 dos-description">
                        Calculate Fibonacci numbers using naive recursion.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("subsetSum")} disabled={!audioCtx}>
                        Subset Sum Problem
                      </button>
                      <p className="mt-2 dos-description">
                        Find if subset of elements sum to a specific value.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "exponentialBaseC" && (
                <div className="dos-tab-pane">
                  <h4>12. O(c^n) Exponential Base C <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("graph3Coloring")} disabled={!audioCtx}>
                        Graph 3-Coloring
                      </button>
                      <p className="mt-2 dos-description">
                        Brute-force graph 3-coloring by trying 3 colors per vertex.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("threeWayPartition")} disabled={!audioCtx}>
                        Three-Way Partition Search
                      </button>
                      <p className="mt-2 dos-description">
                        Enumerate bucket assignments and test whether all three bucket sums are equal. Input bounded to 5 items for interactive visualization.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "factorial" && (
                <div className="dos-tab-pane">
                  <h4>13. O(n!) Factorial <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("travelingSalesman")} disabled={!audioCtx}>
                        Traveling Salesman [bounded]
                      </button>
                      <p className="mt-2 dos-description">
                        Canonical factorial exemplar, bounded and streamed for interactivity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "subfactorial" && (
                <div className="dos-tab-pane">
                  <h4>14. O(n!/k^n) Subfactorial <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("derangement")} disabled={!audioCtx}>
                        Derangement Problem [bounded]
                      </button>
                      <p className="mt-2 dos-description">
                        Canonical subfactorial exemplar, bounded and streamed for interactivity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "ackermann" && (
                <div className="dos-tab-pane">
                  <h4>15. O(A(n,n)) Ackermann <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("ackermann")} disabled={!audioCtx}>
                        Ackermann Function
                      </button>
                      <p className="mt-2 dos-description">
                        A recursively defined function that grows extremely quickly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                {}
              {selectedTab === "doubleExponential" && (
                <div className="dos-tab-pane">
                  <h4>16. O(2^(2^n)) Double Exponential <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={() => startAlgorithmById("booleanFunctionEnumeration")} disabled={!audioCtx}>
                        Boolean Function Enumeration
                      </button>
                      <p className="mt-2 dos-description">
                        Enumerate all Boolean functions on n variables via truth tables of length 2^n. Input bounded to n {"<="} 3 for interactive visualization.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <div className="dos-panel">
            <h3>Drum Settings <span className="blink">_</span></h3>
            <div className="row">
              <div className="col-md-6">
                <button 
                  className="btn dos-btn mb-2"
                  onClick={() => setShowDrumGain(!showDrumGain)}
                >
                  {showDrumGain ? "Hide Drum Gains" : "Show Drum Gains"}
                </button>
                
                <div className="form-group dos-form-group">
                  <label htmlFor="drumVariation">Drum Pattern:</label>                  <select
                    id="drumVariation"
                    className="form-control dos-control"
                    value={drumVariation}
                    onChange={(e) => setDrumVariation(e.target.value)}
                  >
                    <optgroup label="Simple">
                      <option value="simple1">Simple 1</option>
                      <option value="simple2">Simple 2</option>
                      <option value="simple3">Simple 3</option>
                      <option value="simple4">Simple 4</option>
                    </optgroup>
                    <optgroup label="Rock">
                      <option value="rock1">Rock 1</option>
                      <option value="rock2">Rock 2</option>
                      <option value="rock3">Rock 3</option>
                      <option value="rock4">Rock 4</option>
                    </optgroup>
                    <optgroup label="Funk">
                      <option value="funk1">Funk 1</option>
                      <option value="funk2">Funk 2</option>
                      <option value="funk3">Funk 3</option>
                      <option value="funk4">Funk 4</option>
                    </optgroup>
                    <optgroup label="Jazz">
                      <option value="jazz1">Jazz 1</option>
                      <option value="jazz2">Jazz 2</option>
                      <option value="jazz3">Jazz 3</option>
                      <option value="jazz4">Jazz 4</option>
                    </optgroup>
                    <optgroup label="Electronic">
                      <option value="electronic1">Electronic 1</option>
                      <option value="electronic2">Electronic 2</option>
                      <option value="electronic3">Electronic 3</option>
                      <option value="electronic4">Electronic 4</option>
                    </optgroup>
                    <optgroup label="Latin">
                      <option value="latin1">Latin 1</option>
                      <option value="latin2">Latin 2</option>
                      <option value="latin3">Latin 3</option>
                      <option value="latin4">Latin 4</option>
                    </optgroup>
                    <optgroup label="Hip Hop">
                      <option value="hiphop1">Hip Hop 1</option>
                      <option value="hiphop2">Hip Hop 2</option>
                      <option value="hiphop3">Hip Hop 3</option>
                      <option value="hiphop4">Hip Hop 4</option>
                    </optgroup>
                    <optgroup label="Minimal">
                      <option value="minimal1">Minimal 1</option>
                      <option value="minimal2">Minimal 2</option>
                      <option value="minimal3">Minimal 3</option>
                      <option value="minimal4">Minimal 4</option>
                    </optgroup>
                    <optgroup label="Techno">
                      <option value="techno1">Techno 1</option>
                      <option value="techno2">Techno 2</option>
                      <option value="techno3">Techno 3</option>
                      <option value="techno4">Techno 4</option>
                    </optgroup>
                    <optgroup label="Dubstep">
                      <option value="dubstep1">Dubstep 1</option>
                      <option value="dubstep2">Dubstep 2</option>
                      <option value="dubstep3">Dubstep 3</option>
                      <option value="dubstep4">Dubstep 4</option>
                    </optgroup>
                    <optgroup label="Trap">
                      <option value="trap1">Trap 1</option>
                      <option value="trap2">Trap 2</option>
                      <option value="trap3">Trap 3</option>
                      <option value="trap4">Trap 4</option>
                    </optgroup>
                    <optgroup label="Reggae">
                      <option value="reggae1">Reggae 1</option>
                      <option value="reggae2">Reggae 2</option>
                      <option value="reggae3">Reggae 3</option>
                      <option value="reggae4">Reggae 4</option>
                    </optgroup>
                    <optgroup label="House">
                      <option value="house1">House 1</option>
                      <option value="house2">House 2</option>
                      <option value="house3">House 3</option>
                      <option value="house4">House 4</option>
                    </optgroup>
                    <optgroup label="Ambient">
                      <option value="ambient1">Ambient 1</option>
                      <option value="ambient2">Ambient 2</option>
                      <option value="ambient3">Ambient 3</option>
                      <option value="ambient4">Ambient 4</option>
                    </optgroup>
                    <optgroup label="Waltz">
                      <option value="waltz1">Waltz 1 (3/4)</option>
                      <option value="waltz2">Waltz 2 (3/4)</option>
                      <option value="waltz3">Waltz 3 (3/4)</option>
                      <option value="waltz4">Waltz 4 (3/4)</option>
                    </optgroup>
                    <optgroup label="Breakbeat">
                      <option value="breakbeat1">Breakbeat 1</option>
                      <option value="breakbeat2">Breakbeat 2</option>
                      <option value="breakbeat3">Breakbeat 3</option>
                      <option value="breakbeat4">Breakbeat 4</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="drumless">No Drums</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                {showDrumGain && (
                  <div className="dos-drum-gain">
                    <h4>Drum Gains <span className="blink">_</span></h4>
                    {DRUM_TYPES.map((drumType) => (
                      <div key={drumType} className="form-group dos-form-group mb-1">
                        <label>{drumType}: {drumGains[drumType].toFixed(2)}</label>
                        <input
                          type="range"
                          className="form-control-range dos-range"
                          min="0"
                          max="10"
                          step="0.01"
                          value={drumGains[drumType]}
                          onChange={(e) => updateDrumGain(drumType, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
        <div className="row mt-3">
        <div className="col-12">
          <div className="dos-panel">
            <h3>Visualizers <span className="blink">_</span></h3>
            <div className="visualizer-grid">
              <div className="visualizer-cell visualizer-cell-frequency visualizer-cell-top">
                <div className="dos-canvas-container visualizer-panel audio-container visualizer-panel-frequency">
                  <h4>Hz</h4>
                  <div className="visualizer-canvas-shell">
                    <canvas
                      ref={audioCanvasRef}
                      className="dos-canvas visualizer-canvas audio-canvas"
                      id="audioVisualization"
                      data-always-visible="true"
                      style={{ maxWidth: "100%" }}
                    />
                  </div>
                </div>
              </div>
              <div className="visualizer-cell visualizer-cell-top">
                <div className="dos-canvas-container visualizer-panel">
                  <h4>Algorithm Pseudocode</h4>
                  <div
                    ref={pseudocodePanelRef}
                    className="visualizer-text-panel visualizer-text-panel-large terminal-like-display"
                  />
                </div>
              </div>
              <div className="visualizer-cell visualizer-cell-top">
                <div className="dos-canvas-container visualizer-panel">
                  <h4>Implementation Source</h4>
                  <pre className="visualizer-text-panel terminal-like-display mb-2">
                    {verificationPanelText}
                  </pre>
                  <div
                    ref={sourcePanelRef}
                    className="visualizer-text-panel visualizer-text-panel-large terminal-like-display"
                  />
                </div>
              </div>
              <div className="visualizer-cell visualizer-cell-trace visualizer-cell-top">
                <div className="dos-canvas-container visualizer-panel">
                  <h4>Execution Trace</h4>
                  <div
                    ref={algorithmPanelRef}
                    className="visualizer-text-panel visualizer-text-panel-large terminal-like-display"
                  />
                </div>
              </div>
              <div className="visualizer-cell visualizer-cell-full">
                <div className="dos-canvas-container visualizer-panel">
                  <h4>Drum Pattern</h4>
                  <canvas
                    ref={drumCanvasRef}
                    className="dos-canvas visualizer-canvas drum-canvas"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






