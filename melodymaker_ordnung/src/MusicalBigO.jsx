import React, { useState, useRef, useEffect } from "react";
import { SCALES } from "./scales.js";
import { createPatternFromNotes } from "./patternHelpers.js";
import "./collapsible.css";
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

  
  const [selectedRootNote, setSelectedRootNote] = useState("A");
  const [selectedScaleType, setSelectedScaleType] = useState("minor");
  const [selectedScaleVariation, setSelectedScaleVariation] = useState("pentatonic");
  const [selectedOctave, setSelectedOctave] = useState(0);
  
  const [currentAlgo, setCurrentAlgo] = useState(null);
  const [activePattern, setActivePattern] = useState([]); 
  const [patternLength, setPatternLength] = useState(0);
  const [algoSteps, setAlgoSteps] = useState([]);
  const [algoStepsLength, setAlgoStepsLength] = useState(0);
  const [displayedAlgoSteps, setDisplayedAlgoSteps] = useState([]); 
  const [stepOffset, setStepOffset] = useState(0); 
  const MAX_DISPLAYED_STEPS = 10; 
  
  const stepRef = useRef(0);

  
  const audioCanvasRef = useRef(null);
  const algorithmCanvasRef = useRef(null);  const drumCanvasRef = useRef(null);
  
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
  const [rhythmPattern, setRhythmPattern] = useState([]);

  const [drumVariation, setDrumVariation] = useState("simple1");

  
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
          return currentScaleObj[defaultVariation];
        }
      }
      
      return [110, 220, 330, 440];
    }
    
    return selectedScale;
  };


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
  
  const getAvailableScaleVariations = () => {
    
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
    
    
    const availableVariations = [];
    
    
    Object.keys(currentScaleObj).forEach(variation => {
      if (variationLabels[variation]) {
        availableVariations.push({
          value: variation,
          label: variationLabels[variation]
        });
      }
    });
    
    
    if (availableVariations.length === 0) {
      console.warn(`No scale variations found for ${selectedRootNote} ${selectedScaleType}`);
      return [{ value: "pentatonic", label: "Pentatonic" }];
    }
    
    return availableVariations;
  };

  
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

  
  
  
  const playNote = (freq, durationMs = 200) => {
    if (!audioCtx) return;
    const adjustedFreq = freq * Math.pow(2, selectedOctave);
    
    
    const oscillator = createCustomWaveform(waveform, adjustedFreq);
    if (!oscillator) return;

    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
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
    analyser.connect(audioCtx.destination);
    oscillator.start();
    
    
    if (modulatorOn && rate !== 1) {
      const modOscillator = audioCtx.createOscillator();
      modOscillator.type = modulatorWaveform; 
      modOscillator.frequency.value = parseFloat(rate);
      const modGain = audioCtx.createGain();
      modGain.gain.value = parseFloat(depth); 

      modOscillator.connect(modGain);
      modGain.connect(gainNode.gain);
      modOscillator.start();
      modOscillator.stop(now + durationMs / 1000 + releaseTime);
    }
    
    
    if (vibratoOn) {
      const vibratoOsc = audioCtx.createOscillator();
      vibratoOsc.type = 'sine';
      vibratoOsc.frequency.value = parseFloat(vibratoRate);
      
      const vibratoGain = audioCtx.createGain();
      vibratoGain.gain.value = parseFloat(vibratoDepth);
      
      vibratoOsc.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibratoOsc.start();
      vibratoOsc.stop(now + durationMs / 1000 + releaseTime);
    }
    setTimeout(() => {
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + releaseTime);
      
      
      setTimeout(() => {
        if (typeof oscillator.stop === 'function') {
          oscillator.stop();
        }
      }, releaseTime * 1000);
    }, durationMs);
  };  
  
  
  
  function drawAudioCanvas(frequencies) {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (frequencies.length === 0) return;
    const maxFreq = 800; 
    const barWidth = 20;
    const gap = 10;
    let xPos = 10;

    const bgColor = '#000000';           
    const barColor = '#aaaaaa';          
    const highlightColor = '#ffffff';    
    const textColor = '#00ff00';         
    const borderColor = '#00aaaa';       
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0000aa'; 
    ctx.fillRect(0, 0, canvas.width, 20);
    ctx.fillStyle = highlightColor;
    ctx.font = "14px 'Px437_IBM_EGA8', 'DOS', monospace";
    ctx.fillText("AUDIO ANALYZER", 10, 15);
    
    frequencies.forEach((freq) => {
      const barHeight = Math.min(150, (freq / maxFreq) * canvas.height * 0.8);
      const yPos = canvas.height - barHeight - 10;
      
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
      ctx.fillText(freq.toFixed(0) + "Hz", xPos, yPos - 5);
      
      xPos += barWidth + gap;
    });
  }
    
  
  
  
  function drawAlgorithmCanvas(stepText, stepsToDisplay = null) {
    const canvas = algorithmCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
      const textColor = '#ffffff';      
    const bgColor = '#000000';       
    const dimTextColor = '#aaaaaa';   
    const highlightColor = '#ffff00'; 
    const borderColor = '#aaaaaa';    
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0000aa'; 
    ctx.fillRect(10, 10, canvas.width - 20, 20);
    ctx.fillStyle = textColor;
    ctx.font = "16px 'Px437_IBM_EGA8', 'DOS', monospace";
    ctx.fillText("ALGORITHM VISUALIZATION", 20, 25);
    
    
    const lineHeight = 18;
    
    
    const visibleSteps = stepsToDisplay || displayedAlgoSteps;
      
    if (visibleSteps.length > 0) {
      
      const fadeHeight = 20;
      const topGradient = ctx.createLinearGradient(0, 25, 0, 25 + fadeHeight);
      topGradient.addColorStop(0, bgColor);
      topGradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      const bottomGradient = ctx.createLinearGradient(0, canvas.height - fadeHeight, 0, canvas.height);
      bottomGradient.addColorStop(0, 'rgba(0,0,0,0)');
      bottomGradient.addColorStop(1, bgColor);
      
      
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 25, canvas.width, fadeHeight);
      
      
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, canvas.height - fadeHeight, canvas.width, fadeHeight);
      
      
      const lineHeight = 18;
      const availableHeight = canvas.height - 60; 
      const maxVisibleSteps = Math.floor(availableHeight / lineHeight);
      
      if (visibleSteps.length >= maxVisibleSteps) {
        ctx.fillStyle = dimTextColor;
        ctx.fillRect(canvas.width - 8, 30, 3, canvas.height - 60);
        
        
        const thumbSize = Math.max(15, (maxVisibleSteps / visibleSteps.length) * (canvas.height - 60));
        const scrollPosition = visibleSteps.length > maxVisibleSteps ? 
          (canvas.height - 60 - thumbSize) : 0;
        
        ctx.fillStyle = textColor;
        ctx.fillRect(canvas.width - 8, 30 + scrollPosition, 3, thumbSize);
      }
    }
      
    visibleSteps.forEach((step, index) => {
      
      const y = 45 + (index * lineHeight);
      
      
      if (y < 25 || y > canvas.height) return;
      
      
      if (index === visibleSteps.length - 1 && visibleSteps.length > 0) {
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(5, y - lineHeight + 2, canvas.width - 10, lineHeight);
        
        
        if (y > canvas.height - 30) {
          
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(canvas.width - 15, 5, 10, canvas.height - 10);
        }
      }
      
      
      if (step.includes('[')) {
        
        const stepNum = step.substring(1, step.indexOf(']'));
        const stepText = step.substring(step.indexOf(']') + 1);
        
        
        ctx.fillStyle = dimTextColor;
        ctx.fillText(`[${stepNum}]`, 10, y);
        
        
        ctx.fillStyle = textColor;
        ctx.fillText(stepText, 45, y);
      } else {
        
        ctx.fillStyle = textColor;
        ctx.fillText(step, 10, y);
      }
    });
    
    
    if (currentAlgo) {
      const cursorY = 45 + (visibleSteps.length * lineHeight);
      
      
      const cursorBlinkRate = 800; 
      const shouldShowCursor = Math.floor(Date.now() / cursorBlinkRate) % 2 === 0;
      
      
      if (shouldShowCursor) {
        ctx.fillStyle = textColor;
        ctx.shadowBlur = 4;
        ctx.fillText('_', 10, cursorY);
      }
    }
    
    
    ctx.shadowBlur = 0;
  }

  
  
  
    function drawDrumGrid(rhythmPattern, currentStep) {
    const canvas = drumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
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

  
  
  
  const startClock = () => {
    
    stopClock();

    const msPerBeat = 60000 / bpm;
    const tickInterval = msPerBeat / TICKS_PER_BEAT;

    stepRef.current = 0;
    const intervalId = setInterval(() => {
      const step = stepRef.current;
      const wrappedStep = step % patternLength;

      
      const notesToPlay = activePattern.filter((p) => p.step === wrappedStep);
      notesToPlay.forEach((noteItem) => {
        playNote(noteItem.freq, tickInterval * 0.9);
      });
      
      
      drawAudioCanvas(notesToPlay.map((p) => p.freq));
      
      
      const algoStepIndex = step % algoStepsLength;
      const currentAlgoStepText = algoSteps[algoStepIndex] || "";
        
      
      if (currentAlgoStepText && currentAlgoStepText.trim() !== "") {
        
        const formattedStepText = `[${step}] ${currentAlgoStepText}`;
        
        
        const isDuplicate = displayedAlgoSteps.includes(formattedStepText);
        
        if (!isDuplicate) {
          
          const newSteps = [...displayedAlgoSteps, formattedStepText];
          
          
          const canvas = algorithmCanvasRef.current;
          const lineHeight = 18;  
          const availableHeight = canvas ? (canvas.height - 60) : 180; 
          const maxVisibleSteps = Math.floor(availableHeight / lineHeight);
          
          
          const effectiveMaxSteps = Math.max(maxVisibleSteps, MAX_DISPLAYED_STEPS);
          
          
          const updatedSteps = newSteps.length > effectiveMaxSteps 
            ? newSteps.slice(-effectiveMaxSteps) 
            : newSteps;
          
          
          setDisplayedAlgoSteps(updatedSteps);
          
          
          
          const tempSteps = [...updatedSteps];
          drawAlgorithmCanvas("", tempSteps);
        } else {
          
          drawAlgorithmCanvas("", displayedAlgoSteps);
        }
      } else {
        
        drawAlgorithmCanvas("", displayedAlgoSteps);
      }

      
      const drumStep = rhythmPattern[wrappedStep];
      if (drumStep) {
        
        playDrum(audioCtx, drumStep, 1, drumGains[drumStep]);
      }

      
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
    
    
    
    
    setStepOffset(0); 
    drawAlgorithmCanvas("", displayedAlgoSteps); 
    drawDrumGrid([], -1);
  };
   
  
  
  const setupAlgorithm = (algoName, algorithmData) => {
    
    stopClock();
    
    
    setDisplayedAlgoSteps([]);
    
    
    drawAlgorithmCanvas("", []);
      
    
    setTimeout(() => {
      
      setCurrentAlgo(algoName);
      setAlgoSteps(algorithmData.steps);
      setAlgoStepsLength(algorithmData.steps.length);
      setStepOffset(0); 
      stepRef.current = 0; 
  
      
      const pattern = createPatternFromNotes(algorithmData.notes, 1);
      setActivePattern(pattern);
      setPatternLength(pattern.length);
  
      
      const newDrums = generateDrumPattern(pattern.length, drumVariation, algorithmData);
      setRhythmPattern(newDrums);
      
      
      drawAlgorithmCanvas("", []); 
      drawDrumGrid(newDrums, -1);
      drawAudioCanvas([]);
      
      
      
      requestAnimationFrame(() => {
        startClock();
      });
    }, 100);
  }; 

  
  
  

const startAccessElement = () => {
  const data = getAccessElementData(
    getSafeSelectedScale(),
    numNotes 
  );
  setupAlgorithm("Access Element (O(1))", data);
};

const startCheckEvenOdd = () => {
  const data = getCheckEvenOddData(
    getSafeSelectedScale(),
    numNotes, 
    selectEven 
  );
  setupAlgorithm("Check Even/Odd (O(1))", data);
};

const startFirstElement = () => {
  const data = getFirstElementData(
    getSafeSelectedScale()
  );
  setupAlgorithm("First Element (O(1))", data);
};

const startRepeatedHalving = () => {
  const data = getRepeatedHalvingData(
    getSafeSelectedScale()
  );
  setupAlgorithm("Repeated Halving (O(log log n))", data);
};

  const startBinarySearch = () => {
    const data = getBinarySearchData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Binary Search (O(log n))", data);
  };

  const startExponentiationBySquaring = () => {
    const scale = getSafeSelectedScale();
    const exponent = 10; 
    const data = getExponentiationBySquaringData(scale, exponent);
    setupAlgorithm("Exponentiation by Squaring (O(log n))", data);
  };
  const startLogDivision = () => {
    const data = getLogDivData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Log Division (O(log n))", data);
  };

  const startIterativeLog = () => {
    const data = getIterativeLogData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Iterative Log (O(log n))", data);
  };

  const startExtraLog = () => {
    const data = getExtraLogData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Extra Pattern (O(log n))", data);
  };
  
  const startRepeatedLogReduction = () => {
    const data = getRepeatedLogReductionData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Repeated Log Reduction (O((log n)^2))", data);
  };

const startRandomSampling = () => {
  const data = getRandomSamplingData(
    getSafeSelectedScale()
  );
  setupAlgorithm("Random Sampling (O(sqrt(n)))", data);
};

const startJumpSearch = () => {
  const scale = getSafeSelectedScale();
  const target = scale[0]; 
  const data = getJumpSearchData(
    scale,
    target
  );
  setupAlgorithm("Jump Search (O(sqrt(n)))", data);
};

  
  const startLinearSearch = () => {
    const data = getLinearSearchData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Linear Search (O(n))", data);
  };

  const startSumOfElements = () => {
    const data = getSumOfElementsData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Sum of Elements (O(n))", data);
  };

  const startFindMax = () => {
    const data = getFindMaxData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Find Maximum (O(n))", data);
  };
  const startCountOccurrences = () => {
    const data = getCountOccurrencesData(
      getSafeSelectedScale()
    );
    setupAlgorithm("Count Occurrences (O(n))", data);
  };

    
    const startMergeSort = () => {
      const data = getMergeSortData(
        getSafeSelectedScale()
      );
      setupAlgorithm("Merge Sort (O(n log n))", data);
    };
  
    const startHeapSort = () => {
      const data = getHeapSortData(
        getSafeSelectedScale()
      );
      setupAlgorithm("Heap Sort (O(n log n))", data);
    };
    const startQuickSort = () => {
      const data = getQuickSortData(
        getSafeSelectedScale()
      );
      setupAlgorithm("Quick Sort (O(n log n))", data);
    };

        const startBubbleSort = () => {
      const data = getBubbleSortData(
        getSafeSelectedScale()
      );
      setupAlgorithm("Bubble Sort (O(n^2))", data);
    };
    
    const startSelectionSort = () => {
      const data = getSelectionSortData(
        getSafeSelectedScale()
      );
      setupAlgorithm("Selection Sort (O(n^2))", data);
    };
      const startInsertionSort = () => {
      const data = getInsertionSortData(
        getSafeSelectedScale()
      );
      setupAlgorithm("Insertion Sort (O(n^2))", data);
    };

const startMatrixMultiplication = () => {
  const data = getMatrixMultiplicationData(
    getSafeSelectedScale()
  );
  setupAlgorithm("Matrix Multiplication (O(n^3))", data);
};

const startThreeSum = () => {
  const target = 1000; 
  const data = getThreeSumData(
    getSafeSelectedScale(),
    target
  );
  setupAlgorithm("3-Sum Problem (O(n^3))", data);
};

const startPolynomialEvaluation = () => {
  const coefficients = [1, -2, 3]; 
  const x = 2; 
  const data = getPolynomialEvaluationData(
    getSafeSelectedScale(),
    coefficients,
    x
  );
  setupAlgorithm("Polynomial Evaluation (O(n^k))", data);
};

const startMatrixExponentiation = () => {
  const k = 3; 
  const data = getMatrixExponentiationData(
    getSafeSelectedScale(),
    k
  );
  setupAlgorithm("Matrix Exponentiation (O(n^k))", data);
};

const startFibonacci = () => {
  const n = 10; 
  const data = getFibonacciData(
    getSafeSelectedScale(),
    n
  );
  setupAlgorithm("Fibonacci Sequence (O(2^n))", data);
};

const startSubsetSum = () => {
  const targetSum = 1000; 
  const data = getSubsetSumData(
    getSafeSelectedScale(),
    targetSum
  );
  setupAlgorithm("Subset Sum Problem (O(2^n))", data);
};

const startTowersOfHanoi = () => {
  const n = 3; 
  const data = getTowersOfHanoiData(
    getSafeSelectedScale(),
    n
  );
  setupAlgorithm("Towers of Hanoi (O(3^n))", data);
};

const startPermutations = () => {
  const data = getPermutationsData(
    getSafeSelectedScale()
  );
  setupAlgorithm("Permutations (O(n!))", data);
};

const startTravelingSalesman = () => {
  const data = getTravelingSalesmanData(
    getSafeSelectedScale()
  );
  setupAlgorithm("Traveling Salesman Problem (O(n!))", data);
};

const startDerangement = () => {
    const data = getDerangementData(
        getSafeSelectedScale()
    );
    setupAlgorithm("Derangement Problem (O(n!/k^n))", data);
};

const startAckermann = () => {
    const m = 2; 
    const n = 2; 
    const data = getAckermannData(
        getSafeSelectedScale(),
        m,
        n
    );
    setupAlgorithm("Ackermann Function (O(A(n, n)))", data);
};

  const startDoubleExponential = () => {
    const scale = getSafeSelectedScale();
    const data = getDoubleExponentialData(scale);
    setupAlgorithm("Double Exponential (O(2^(2^n)))", data);
  };
  
  
  
  const stopPlayback = () => {
    setCurrentAlgo(null);
    stopClock();
    setActivePattern([]);
    setPatternLength(0);
    setAlgoSteps([]);
    setAlgoStepsLength(0);
    setRhythmPattern([]);
  };
  
  
  
  useEffect(() => {
    const handleResize = () => {
      if (audioCanvasRef.current) {
        const container = audioCanvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = Math.min(200, container.clientHeight || width / 2);
          audioCanvasRef.current.width = width;
          audioCanvasRef.current.height = height;
        }
      }
      
      if (algorithmCanvasRef.current) {
        const container = algorithmCanvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = Math.min(200, container.clientHeight || width / 2);
          algorithmCanvasRef.current.width = width;
          algorithmCanvasRef.current.height = height;
        }
      }
      
      if (drumCanvasRef.current) {
        const container = drumCanvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = Math.min(200, container.clientHeight || width / 2);
          drumCanvasRef.current.width = width;
          drumCanvasRef.current.height = height;
        }
      }
    };

    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  
  
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
                    {getAvailableScaleVariations().map((variation) => (
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
                <button className="btn dos-btn" onClick={() => setSelectedTab("constant")}>O(1)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("doublelogarithmic")}>O(log log n)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("logarithmic")}>O(log n)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("polylogarithmic")}>O((log n)^2)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("sublinear")}>O(sqrt(n))</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("linear")}>O(n)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("linearithmic")}>O(n log n)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("quadratic")}>O(n^2)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("cubic")}>O(n^3)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("polynomial")}>O(n^k)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("exponential")}>O(2^n)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("exponentialBaseC")}>O(c^n), c&gt;2</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("factorial")}>O(n!)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("subfactorial")}>O(n!/k^n)</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("ackermann")}>O(A(n, n))</button>
                <button className="btn dos-btn" onClick={() => setSelectedTab("doubleExponential")}>O(2^(2^n))</button>
              </div>
            </nav>
            
            <div className="tab-content dos-tab-content mt-3">              {}              {selectedTab === "constant" && (
                <div className="dos-tab-pane">
                  <h4>01. O(1) Constant <span className="blink">_</span></h4>
                  <div className="dos-section-controls mb-3">
                    <button className="btn dos-btn dos-btn-danger" onClick={stopPlayback}>
                      ■ Stop
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">                      <button className="btn dos-btn" onClick={startAccessElement} disabled={!audioCtx}>
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
                    <div className="col-md-6">                      <button className="btn dos-btn" onClick={startCheckEvenOdd} disabled={!audioCtx}>
                        Check Even/Odd
                      </button>
                      <p className="mt-2 dos-description">
                        Simple modulo check for parity takes constant time.
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
                      <button className="btn dos-btn" onClick={startFirstElement} disabled={!audioCtx}>
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
                      <button className="btn dos-btn" onClick={startRepeatedHalving} disabled={!audioCtx}>
                        Repeated Halving
                      </button>
                      <p className="mt-2 dos-description">
                        A technique where the problem size is repeatedly halved, but only the log of the halved value matters.
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
                      <button className="btn dos-btn" onClick={startBinarySearch} disabled={!audioCtx}>
                        Binary Search
                      </button>
                      <p className="mt-2 dos-description">
                        Divide a sorted array in half repeatedly to find a target value.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startExponentiationBySquaring} disabled={!audioCtx}>
                        Exponentiation by Squaring
                      </button>
                      <p className="mt-2 dos-description">
                        Efficiently compute large powers by squaring.
                      </p>
                    </div>
                  </div>
                  <div className="row mt-2">                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startLogDivision} disabled={!audioCtx}>
                        Log Division
                      </button>
                      <p className="mt-2 dos-description">
                        Divide a number repeatedly until reaching 1.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startIterativeLog} disabled={!audioCtx}>
                        Iterative Log
                      </button>
                      <p className="mt-2 dos-description">
                        Iteratively compute logarithmic values.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startExtraLog} disabled={!audioCtx}>
                        Extra Pattern
                      </button>
                      <p className="mt-2 dos-description">
                        Alternative logarithmic pattern generation.
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
                      <button className="btn dos-btn" onClick={startRepeatedLogReduction} disabled={!audioCtx}>
                        Repeated Log Reduction
                      </button>
                      <p className="mt-2 dos-description">
                        Algorithms with nested logarithmic operations.
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
                      <button className="btn dos-btn" onClick={startRandomSampling} disabled={!audioCtx}>
                        Random Sampling
                      </button>
                      <p className="mt-2 dos-description">
                        Select √n elements randomly from a population.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startJumpSearch} disabled={!audioCtx}>
                        Jump Search
                      </button>
                      <p className="mt-2 dos-description">
                        Search by jumping ahead by fixed steps of size √n.
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
                      <button className="btn dos-btn" onClick={startLinearSearch} disabled={!audioCtx}>
                        Linear Search
                      </button>
                      <p className="mt-2 dos-description">
                        Sequentially check each element in a collection.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startSumOfElements} disabled={!audioCtx}>
                        Sum of Elements
                      </button>
                      <p className="mt-2 dos-description">
                        Add up all elements in an array.
                      </p>
                    </div>
                  </div>
                  <div className="row mt-2">                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startFindMax} disabled={!audioCtx}>
                        Find Maximum
                      </button>
                      <p className="mt-2 dos-description">
                        Scan through array once to find highest value.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startCountOccurrences} disabled={!audioCtx}>
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
                      <button className="btn dos-btn" onClick={startMergeSort} disabled={!audioCtx}>
                        Merge Sort
                      </button>
                      <p className="mt-2 dos-description">
                        Divide, sort, and merge approach.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startHeapSort} disabled={!audioCtx}>
                        Heap Sort
                      </button>
                      <p className="mt-2 dos-description">
                        Sort using a binary heap data structure.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startQuickSort} disabled={!audioCtx}>
                        Quick Sort
                      </button>
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
                      <button className="btn dos-btn" onClick={startBubbleSort} disabled={!audioCtx}>
                        Bubble Sort
                      </button>
                      <p className="mt-2 dos-description">
                        Repeatedly swap adjacent elements if they are in wrong order.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startSelectionSort} disabled={!audioCtx}>
                        Selection Sort
                      </button>
                      <p className="mt-2 dos-description">
                        Find smallest element and place at the beginning.
                      </p>
                    </div>
                    <div className="col-md-4">
                      <button className="btn dos-btn" onClick={startInsertionSort} disabled={!audioCtx}>
                        Insertion Sort
                      </button>
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
                      <button className="btn dos-btn" onClick={startMatrixMultiplication} disabled={!audioCtx}>
                        Matrix Multiplication
                      </button>
                      <p className="mt-2 dos-description">
                        Multiply two n×n matrices using standard algorithm.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startThreeSum} disabled={!audioCtx}>
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
                      <button className="btn dos-btn" onClick={startPolynomialEvaluation} disabled={!audioCtx}>
                        Polynomial Evaluation
                      </button>
                      <p className="mt-2 dos-description">
                        Standard evaluation of a polynomial with naive approach.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startMatrixExponentiation} disabled={!audioCtx}>
                        Matrix Exponentiation
                      </button>
                      <p className="mt-2 dos-description">
                        Raise a matrix to a power with naive approach.
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
                      <button className="btn dos-btn" onClick={startFibonacci} disabled={!audioCtx}>
                        Fibonacci (recursive)
                      </button>
                      <p className="mt-2 dos-description">
                        Calculate Fibonacci numbers using naive recursion.
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startSubsetSum} disabled={!audioCtx}>
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
                      <button className="btn dos-btn" onClick={startTowersOfHanoi} disabled={!audioCtx}>
                        Towers of Hanoi
                      </button>
                      <p className="mt-2 dos-description">
                        Solve the classic Tower of Hanoi puzzle (3^n operations).
                      </p>
                    </div>
                    <div className="col-md-6">
                      <button className="btn dos-btn" onClick={startPermutations} disabled={!audioCtx}>
                        Generate Permutations
                      </button>
                      <p className="mt-2 dos-description">
                        Generate all possible arrangements of elements.
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
                      <button className="btn dos-btn" onClick={startTravelingSalesman} disabled={!audioCtx}>
                        Traveling Salesman
                      </button>
                      <p className="mt-2 dos-description">
                        Find the shortest possible route visiting all cities exactly once.
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
                      <button className="btn dos-btn" onClick={startDerangement} disabled={!audioCtx}>
                        Derangement Problem
                      </button>
                      <p className="mt-2 dos-description">
                        Count permutations where no element appears in its original position.
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
                      <button className="btn dos-btn" onClick={startAckermann} disabled={!audioCtx}>
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
                      <button className="btn dos-btn" onClick={startDoubleExponential} disabled={!audioCtx}>
                        Double Exponential Growth
                      </button>
                      <p className="mt-2 dos-description">
                        Problems with extremely rapid growth rate.
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
            <div className="d-flex flex-wrap justify-content-around position-relative">
              {}              <div className="dos-canvas-container audio-container">
                <h4>Audio Frequencies</h4>
                <canvas
                  ref={audioCanvasRef}
                  width="100%"
                  height="100%"
                  className="dos-canvas audio-canvas"
                  id="audioVisualization"
                  data-always-visible="true"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>              {}
              <div className="dos-canvas-container">
                <h4>Algorithm Steps</h4>
                <canvas
                  ref={algorithmCanvasRef}
                  width="100%"
                  height="100%"
                  className="dos-canvas algorithm-canvas terminal-like-display"
                  style={{
                    fontFamily: "'VT323', 'DOS', monospace",
                    border: "2px solid #888",
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                    maxWidth: "100%",
                    height: "auto"
                  }}
                />
              </div>

              {}              <div className="dos-canvas-container">
                <h4>Drum Pattern</h4>
                <canvas
                  ref={drumCanvasRef}
                  width="100%"
                  height="100%"
                  className="dos-canvas drum-canvas"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
