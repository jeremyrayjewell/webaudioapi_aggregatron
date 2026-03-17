import React, { useState, useRef, useEffect, useMemo } from "react";
import { SCALES } from "./scales.js";
import "./collapsible.css";
import {
  describeAlgorithmEntry,
  getAlgorithmEntry,
} from "./algorithms/registry.js";

import {
  playDrum,
  generateDrumPattern,
  DRUM_TYPES,
} from "./drums.js";
import {
  escapeHtml,
  formatFrequencyAsNote,
  getCanvasMetrics,
  setCanvasDisplaySize,
} from "./musicalBigOUtils.js";
import {
  startTransportClock,
  stopTransportClock,
} from "./musicalBigOTransport.js";
import {
  renderAlgorithmTracePanel,
  renderPseudocodePanel,
  renderSourcePanel,
} from "./musicalBigOPanels.js";
import { playSynthNote } from "./musicalBigOSynth.js";
import {
  consumeAlgorithmStream as consumeAlgorithmStreamChunks,
  rebuildPlaybackBuffers as rebuildAlgorithmPlaybackBuffers,
  setupAlgorithmSession,
  stopPlaybackSession,
} from "./musicalBigOOrchestration.js";
import {
  drawDrumPatternGrid,
  drawFrequencyBars,
} from "./musicalBigOVisualizers.js";
import {
  BigOComplexitySection,
  DrumSettingsSection,
  EnvelopeModulationSection,
  SynthesisScaleSection,
  VisualizersSection,
} from "./sections/index.js";

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

  const rebuildPlaybackBuffers = () =>
    rebuildAlgorithmPlaybackBuffers({
      algorithmNotesRef,
      patternByStepRef,
      rhythmPatternRef,
      algoStepsRef,
      drumVariation,
      generateDrumPattern,
    });

  const consumeAlgorithmStream = (minimumNotes = 1, maxChunks = 8) =>
    consumeAlgorithmStreamChunks({
      algorithmStreamRef,
      algorithmStreamDoneRef,
      algorithmNotesRef,
      algoStepsRef,
      rebuildPlaybackBuffers,
      minimumNotes,
      maxChunks,
    });

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

  
  const playNote = (freq, startTime, durationSeconds = 0.2) => {
    playSynthNote({
      audioCtx,
      analyser,
      frequency: freq,
      startTime,
      durationSeconds,
      settings: {
        waveform,
        selectedOctave,
        attack,
        decay,
        sustain,
        release,
        rate,
        depth,
        modulatorOn,
        modulatorWaveform,
        filterOn,
        filterType,
        filterFrequency,
        filterQ,
        vibratoOn,
        vibratoRate,
        vibratoDepth,
      },
    });
  };
  
  
  
  function drawAudioCanvas(frequencies) {
    drawFrequencyBars({
      canvas: audioCanvasRef.current,
      frequencies,
      getCanvasMetrics,
      formatFrequencyAsNote,
    });
  }
    
  
  
  
  function drawPseudocodeCanvas() {
    renderPseudocodePanel({
      panel: pseudocodePanelRef.current,
      activeAlgo: currentAlgoRef.current,
      currentRawStep: currentRawStepRef.current,
      sortOrder,
      escapeHtml,
    });
  }

  function drawSourcePanel() {
    renderSourcePanel({
      panel: sourcePanelRef.current,
      activeAlgo: currentAlgoRef.current,
      sortOrder,
      escapeHtml,
    });
  }

  function drawAlgorithmCanvas(stepText, stepsToDisplay = null) {
    const visibleSteps = stepsToDisplay || displayedAlgoStepsRef.current;
    renderAlgorithmTracePanel({
      panel: algorithmPanelRef.current,
      activeAlgo: currentAlgoRef.current,
      visibleSteps,
      escapeHtml,
    });
  }

  function drawDrumGrid(rhythmPattern, currentStep) {
    drawDrumPatternGrid({
      canvas: drumCanvasRef.current,
      rhythmPattern,
      currentStep,
      getCanvasMetrics,
      drumTypes: DRUM_TYPES,
    });
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
    startTransportClock({
      audioCtx,
      bpm,
      ticksPerBeat: TICKS_PER_BEAT,
      patternByStepRef,
      rhythmPatternRef,
      algorithmStreamRef,
      algorithmStreamDoneRef,
      clockIdRef,
      visualClockIdRef,
      nextNoteTimeRef,
      scheduledStepRef,
      transportStartTimeRef,
      tickDurationRef,
      lastVisualStepRef,
      drumGains,
      playNote,
      playDrum,
      consumeAlgorithmStream,
      updateVisualsForStep,
      stopClock,
    });
  };
  
  const stopClock = () => {
    stopTransportClock({
      clockIdRef,
      visualClockIdRef,
      displayedAlgoStepsRef,
      drawAlgorithmCanvas,
      drawPseudocodeCanvas,
      drawSourcePanel,
      drawDrumGrid,
    });
  };
   
  
  
  const setupAlgorithm = (algorithmEntry, algorithmData) => {
    setupAlgorithmSession({
      algorithmEntry,
      algorithmData,
      stopClock,
      displayedAlgoStepsRef,
      currentAlgorithmEntryRef,
      currentAlgoRef,
      algoStepsRef,
      algorithmNotesRef,
      algorithmStreamRef,
      algorithmStreamDoneRef,
      setActiveVerificationLines,
      describeAlgorithmEntry,
      stepRef,
      consumeAlgorithmStream,
      rebuildPlaybackBuffers,
      drawPseudocodeCanvas,
      drawSourcePanel,
      drawAlgorithmCanvas,
      drawDrumGrid,
      drawAudioCanvas,
      rhythmPatternRef,
      startClock,
    });
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
    stopPlaybackSession({
      currentAlgorithmEntryRef,
      currentAlgoRef,
      stopClock,
      algorithmNotesRef,
      algorithmStreamRef,
      algorithmStreamDoneRef,
      patternByStepRef,
      rhythmPatternRef,
      algoStepsRef,
      displayedAlgoStepsRef,
      setActiveVerificationLines,
      describeAlgorithmEntry,
      drawAudioCanvas,
      drawPseudocodeCanvas,
      drawSourcePanel,
      drawAlgorithmCanvas,
      drawDrumGrid,
    });
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
      <SynthesisScaleSection
        waveform={waveform}
        setWaveform={setWaveform}
        bpm={bpm}
        setBpm={setBpm}
        selectedRootNote={selectedRootNote}
        setSelectedRootNote={setSelectedRootNote}
        selectedScaleType={selectedScaleType}
        setSelectedScaleType={setSelectedScaleType}
        selectedScaleVariation={selectedScaleVariation}
        setSelectedScaleVariation={setSelectedScaleVariation}
        availableScaleVariations={availableScaleVariations}
        selectedOctave={selectedOctave}
        setSelectedOctave={setSelectedOctave}
      />
      <EnvelopeModulationSection
        showEnvelopeSection={showEnvelopeSection}
        setShowEnvelopeSection={setShowEnvelopeSection}
        attack={attack}
        setAttack={setAttack}
        decay={decay}
        setDecay={setDecay}
        sustain={sustain}
        setSustain={setSustain}
        release={release}
        setRelease={setRelease}
        showModulationSection={showModulationSection}
        setShowModulationSection={setShowModulationSection}
        modulatorOn={modulatorOn}
        setModulatorOn={setModulatorOn}
        modulatorWaveform={modulatorWaveform}
        setModulatorWaveform={setModulatorWaveform}
        rate={rate}
        setRate={setRate}
        depth={depth}
        setDepth={setDepth}
        showFilterSection={showFilterSection}
        setShowFilterSection={setShowFilterSection}
        filterOn={filterOn}
        setFilterOn={setFilterOn}
        filterType={filterType}
        setFilterType={setFilterType}
        filterFrequency={filterFrequency}
        setFilterFrequency={setFilterFrequency}
        filterQ={filterQ}
        setFilterQ={setFilterQ}
        showVibratoSection={showVibratoSection}
        setShowVibratoSection={setShowVibratoSection}
        vibratoOn={vibratoOn}
        setVibratoOn={setVibratoOn}
        vibratoRate={vibratoRate}
        setVibratoRate={setVibratoRate}
        vibratoDepth={vibratoDepth}
        setVibratoDepth={setVibratoDepth}
      />
      <BigOComplexitySection
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        stopPlayback={stopPlayback}
        startAlgorithmById={startAlgorithmById}
        audioCtx={audioCtx}
        numNotes={numNotes}
        setNumNotes={setNumNotes}
        selectEven={selectEven}
        setSelectEven={setSelectEven}
      />

      <DrumSettingsSection
        showDrumGain={showDrumGain}
        setShowDrumGain={setShowDrumGain}
        drumVariation={drumVariation}
        setDrumVariation={setDrumVariation}
        drumGains={drumGains}
        updateDrumGain={updateDrumGain}
      />
      <VisualizersSection
        audioCanvasRef={audioCanvasRef}
        pseudocodePanelRef={pseudocodePanelRef}
        verificationPanelText={verificationPanelText}
        sourcePanelRef={sourcePanelRef}
        algorithmPanelRef={algorithmPanelRef}
        drumCanvasRef={drumCanvasRef}
      />
    </div>
  );
}







