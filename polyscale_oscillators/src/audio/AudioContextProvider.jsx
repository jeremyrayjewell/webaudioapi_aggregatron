import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getInterval, getSecondsPerBeat } from "./tempo";
import {
  KEYS,
  SCALES,
  degreeToMidi,
  getDegreeOctaveShift,
  getSequencedDegree,
  midiToFreq,
  quantizeToScale,
} from "./scale";

const AudioEngineContext = createContext(null);

const DEFAULT_STEP_COUNT = 16;
const DEFAULT_LFO = {
  enabled: false,
  division: "1/4",
  depth: 25,
  target: "detune",
};

function createDefaultSteps() {
  return Array.from({ length: DEFAULT_STEP_COUNT }, (_, index) => ({
    id: `step-${index}`,
    degree: ((index % 7) + 1).toString(),
    active: index % 2 === 0,
  }));
}

function createOscillatorState(index = 0) {
  return {
    id: `osc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    waveform: "sawtooth",
    gain: 0.18,
    degree: ((index % 3) + 1).toString(),
    octaveOffset: index === 0 ? 0 : index - 1,
    detune: 0,
    enabled: true,
    filterEnabled: false,
    filterFrequency: 1800,
    filterQ: 0.7,
    lfo: { ...DEFAULT_LFO },
  };
}

function createOscillatorNodes(audioContext, masterGain) {
  const oscillatorNode = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();
  const lfoNode = audioContext.createOscillator();
  const lfoDepthNode = audioContext.createGain();

  oscillatorNode.type = "sawtooth";
  oscillatorNode.frequency.value = 220;
  gainNode.gain.value = 0;

  filterNode.type = "lowpass";
  filterNode.frequency.value = 1800;
  filterNode.Q.value = 0.7;

  lfoNode.type = "sine";
  lfoNode.frequency.value = 1;
  lfoDepthNode.gain.value = 0;

  oscillatorNode.connect(gainNode);
  gainNode.connect(filterNode);
  filterNode.connect(masterGain);

  lfoNode.connect(lfoDepthNode);
  oscillatorNode.start();
  lfoNode.start();

  return {
    oscillatorNode,
    gainNode,
    filterNode,
    lfoNode,
    lfoDepthNode,
    lfoConnection: null,
  };
}

export function AudioContextProvider({ children }) {
  const [audioReady, setAudioReady] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [masterGainLevel, setMasterGainLevel] = useState(0.8);
  const [key, setKey] = useState(KEYS[0]);
  const [scale, setScale] = useState("major");
  const [oscillators, setOscillators] = useState([
    createOscillatorState(0),
    createOscillatorState(1),
    createOscillatorState(2),
  ]);
  const [steps, setSteps] = useState(createDefaultSteps);
  const [isSequencerRunning, setIsSequencerRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const globalFilterRef = useRef(null);
  const analyserRef = useRef(null);
  const oscillatorNodesRef = useRef(new Map());
  const nextStepTimeRef = useRef(0);
  const transportStepRef = useRef(0);
  const schedulerFrameRef = useRef(null);

  const ensureAudioGraph = useCallback(async () => {
    let context = audioContextRef.current;

    if (!context) {
      context = new window.AudioContext();

      const masterGain = context.createGain();
      const globalFilter = context.createBiquadFilter();
      const analyser = context.createAnalyser();

      masterGain.gain.value = masterGainLevel;
      globalFilter.type = "lowpass";
      globalFilter.frequency.value = 12000;
      globalFilter.Q.value = 0.4;
      analyser.fftSize = 2048;

      masterGain.connect(globalFilter);
      globalFilter.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      masterGainRef.current = masterGain;
      globalFilterRef.current = globalFilter;
      analyserRef.current = analyser;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    setAudioReady(true);
    return context;
  }, [masterGainLevel]);

  useEffect(() => {
    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;

    if (!context || !masterGain) {
      return;
    }

    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.setTargetAtTime(masterGainLevel, context.currentTime, 0.01);
  }, [masterGainLevel]);

  const disconnectLfoTarget = useCallback((nodes) => {
    if (!nodes?.lfoConnection) {
      return;
    }

    try {
      nodes.lfoDepthNode.disconnect(nodes.lfoConnection);
    } catch {
      return;
    } finally {
      nodes.lfoConnection = null;
    }
  }, []);

  const getPitchForOscillator = useCallback(
    (oscillator, step, useSequencerPitch) => {
      const degree = useSequencerPitch
        ? getSequencedDegree(step.degree, oscillator.degree)
        : Number(oscillator.degree);
      const octaveShift = useSequencerPitch
        ? getDegreeOctaveShift(step.degree, oscillator.degree)
        : 0;

      const rawMidi = degreeToMidi(
        degree,
        Number(oscillator.octaveOffset) + octaveShift,
        key,
        scale,
      );

      return midiToFreq(quantizeToScale(rawMidi, key, scale));
    },
    [key, scale],
  );

  const scheduleOscillatorState = useCallback(
    (oscillator, step, scheduledTime) => {
      const nodes = oscillatorNodesRef.current.get(oscillator.id);

      if (!nodes) {
        return;
      }

      const smoothing = 0.015;
      const gateGain = oscillator.enabled && (step?.active ?? true) ? Number(oscillator.gain) : 0;
      const referenceStep = step ?? { degree: oscillator.degree, active: true };
      const shouldSequencePitch = isSequencerRunning && Boolean(step);
      const frequency = getPitchForOscillator(oscillator, referenceStep, shouldSequencePitch);

      nodes.oscillatorNode.type = oscillator.waveform;
      nodes.oscillatorNode.frequency.cancelScheduledValues(scheduledTime);
      nodes.oscillatorNode.frequency.setTargetAtTime(frequency, scheduledTime, smoothing);

      nodes.oscillatorNode.detune.cancelScheduledValues(scheduledTime);
      nodes.oscillatorNode.detune.setTargetAtTime(
        Number(oscillator.detune) || 0,
        scheduledTime,
        smoothing,
      );

      nodes.gainNode.gain.cancelScheduledValues(scheduledTime);
      nodes.gainNode.gain.setTargetAtTime(gateGain, scheduledTime, smoothing);

      nodes.filterNode.frequency.cancelScheduledValues(scheduledTime);
      nodes.filterNode.frequency.setTargetAtTime(
        oscillator.filterEnabled ? Number(oscillator.filterFrequency) : 20000,
        scheduledTime,
        smoothing,
      );
      nodes.filterNode.Q.cancelScheduledValues(scheduledTime);
      nodes.filterNode.Q.setTargetAtTime(Number(oscillator.filterQ) || 0.7, scheduledTime, smoothing);

      disconnectLfoTarget(nodes);
      nodes.lfoDepthNode.gain.setValueAtTime(0, scheduledTime);

      if (!oscillator.lfo.enabled) {
        return;
      }

      const targetLookup = {
        gain: nodes.gainNode.gain,
        detune: nodes.oscillatorNode.detune,
        "filter frequency": nodes.filterNode.frequency,
      };
      const lfoTarget = targetLookup[oscillator.lfo.target];

      if (!lfoTarget) {
        return;
      }

      // BPM subdivisions become modulation rates here, keeping movement locked to tempo.
      nodes.lfoNode.frequency.setValueAtTime(
        1 / getInterval(bpm, oscillator.lfo.division),
        scheduledTime,
      );
      nodes.lfoDepthNode.gain.setValueAtTime(Number(oscillator.lfo.depth) || 0, scheduledTime);
      nodes.lfoDepthNode.connect(lfoTarget);
      nodes.lfoConnection = lfoTarget;
    },
    [bpm, disconnectLfoTarget, getPitchForOscillator, isSequencerRunning],
  );

  const syncAllOscillators = useCallback(
    (timeOverride) => {
      const context = audioContextRef.current;
      if (!context) {
        return;
      }

      const scheduledTime = timeOverride ?? context.currentTime;

      oscillators.forEach((oscillator) => {
        scheduleOscillatorState(oscillator, null, scheduledTime);
      });
    },
    [oscillators, scheduleOscillatorState],
  );

  useEffect(() => {
    if (!audioReady || !audioContextRef.current || !masterGainRef.current) {
      return;
    }

    const context = audioContextRef.current;

    oscillators.forEach((oscillator) => {
      if (oscillatorNodesRef.current.has(oscillator.id)) {
        return;
      }

      oscillatorNodesRef.current.set(
        oscillator.id,
        createOscillatorNodes(context, masterGainRef.current),
      );
    });

    Array.from(oscillatorNodesRef.current.keys()).forEach((oscillatorId) => {
      if (oscillators.some((oscillator) => oscillator.id === oscillatorId)) {
        return;
      }

      const nodes = oscillatorNodesRef.current.get(oscillatorId);
      disconnectLfoTarget(nodes);
      nodes.lfoNode.stop();
      nodes.oscillatorNode.stop();
      nodes.lfoNode.disconnect();
      nodes.oscillatorNode.disconnect();
      nodes.lfoDepthNode.disconnect();
      nodes.filterNode.disconnect();
      nodes.gainNode.disconnect();
      oscillatorNodesRef.current.delete(oscillatorId);
    });

    syncAllOscillators(context.currentTime);
  }, [audioReady, disconnectLfoTarget, oscillators, syncAllOscillators]);

  useEffect(() => {
    if (!audioReady || isSequencerRunning) {
      return;
    }

    syncAllOscillators();
  }, [audioReady, bpm, key, scale, oscillators, isSequencerRunning, syncAllOscillators]);

  const stopSchedulerLoop = useCallback(() => {
    if (schedulerFrameRef.current !== null) {
      cancelAnimationFrame(schedulerFrameRef.current);
      schedulerFrameRef.current = null;
    }
  }, []);

  const scheduler = useCallback(() => {
    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    const interval = getInterval(bpm, "1/16");
    const scheduleAheadTime = 0.15;

    while (nextStepTimeRef.current < context.currentTime + scheduleAheadTime) {
      const stepIndex = transportStepRef.current % steps.length;
      const step = steps[stepIndex];

      // We schedule ahead using currentTime so browser UI work does not drift the pattern.
      oscillators.forEach((oscillator) => {
        scheduleOscillatorState(oscillator, step, nextStepTimeRef.current);
      });

      setCurrentStepIndex(stepIndex);
      nextStepTimeRef.current += interval;
      transportStepRef.current += 1;
    }

    schedulerFrameRef.current = requestAnimationFrame(scheduler);
  }, [bpm, oscillators, scheduleOscillatorState, steps]);

  const startSequencer = useCallback(async () => {
    const context = await ensureAudioGraph();
    transportStepRef.current = 0;
    nextStepTimeRef.current = context.currentTime + 0.05;
    setCurrentStepIndex(0);
    setIsSequencerRunning(true);
  }, [ensureAudioGraph]);

  const stopSequencer = useCallback(() => {
    setIsSequencerRunning(false);
    setCurrentStepIndex(-1);
    stopSchedulerLoop();

    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    oscillators.forEach((oscillator) => {
      scheduleOscillatorState(oscillator, null, context.currentTime);
    });
  }, [oscillators, scheduleOscillatorState, stopSchedulerLoop]);

  const stopAllAudio = useCallback(async () => {
    setIsSequencerRunning(false);
    setCurrentStepIndex(-1);
    stopSchedulerLoop();

    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    const stopTime = context.currentTime;

    oscillatorNodesRef.current.forEach((nodes) => {
      disconnectLfoTarget(nodes);
      nodes.lfoDepthNode.gain.cancelScheduledValues(stopTime);
      nodes.lfoDepthNode.gain.setValueAtTime(0, stopTime);
      nodes.gainNode.gain.cancelScheduledValues(stopTime);
      nodes.gainNode.gain.setTargetAtTime(0, stopTime, 0.01);
    });

    await context.suspend();
    setAudioReady(false);
  }, [disconnectLfoTarget, stopSchedulerLoop]);

  useEffect(() => {
    if (!isSequencerRunning) {
      stopSchedulerLoop();
      return;
    }

    scheduler();
    return stopSchedulerLoop;
  }, [isSequencerRunning, scheduler, stopSchedulerLoop]);

  useEffect(
    () => () => {
      stopSchedulerLoop();

      oscillatorNodesRef.current.forEach((nodes) => {
        disconnectLfoTarget(nodes);
        nodes.lfoNode.stop();
        nodes.oscillatorNode.stop();
        nodes.lfoNode.disconnect();
        nodes.oscillatorNode.disconnect();
        nodes.lfoDepthNode.disconnect();
        nodes.filterNode.disconnect();
        nodes.gainNode.disconnect();
      });

      oscillatorNodesRef.current.clear();
      audioContextRef.current?.close();
    },
    [disconnectLfoTarget, stopSchedulerLoop],
  );

  const addOscillator = useCallback(async () => {
    await ensureAudioGraph();
    setOscillators((current) => [...current, createOscillatorState(current.length)]);
  }, [ensureAudioGraph]);

  const removeOscillator = useCallback((oscillatorId) => {
    setOscillators((current) => current.filter((oscillator) => oscillator.id !== oscillatorId));
  }, []);

  const updateOscillator = useCallback((oscillatorId, updates) => {
    setOscillators((current) =>
      current.map((oscillator) =>
        oscillator.id === oscillatorId
          ? {
              ...oscillator,
              ...updates,
              lfo: updates.lfo ? { ...oscillator.lfo, ...updates.lfo } : oscillator.lfo,
            }
          : oscillator,
      ),
    );
  }, []);

  const updateStep = useCallback((stepIndex, updates) => {
    setSteps((current) =>
      current.map((step, index) => (index === stepIndex ? { ...step, ...updates } : step)),
    );
  }, []);

  const value = useMemo(
    () => ({
      audioContext: audioContextRef.current,
      masterGain: masterGainRef.current,
      globalFilter: globalFilterRef.current,
      analyser: analyserRef.current,
      audioReady,
      bpm,
      masterGainLevel,
      secondsPerBeat: getSecondsPerBeat(bpm),
      key,
      keys: KEYS,
      scale,
      scales: Object.keys(SCALES),
      oscillators,
      steps,
      isSequencerRunning,
      currentStepIndex,
      ensureAudioGraph,
      setMasterGainLevel,
      setBpm,
      setKey,
      setScale,
      addOscillator,
      removeOscillator,
      updateOscillator,
      updateStep,
      startSequencer,
      stopSequencer,
      stopAllAudio,
    }),
    [
      addOscillator,
      audioReady,
      bpm,
      currentStepIndex,
      ensureAudioGraph,
      isSequencerRunning,
      key,
      masterGainLevel,
      oscillators,
      removeOscillator,
      scale,
      startSequencer,
      steps,
      stopAllAudio,
      stopSequencer,
      setMasterGainLevel,
      updateOscillator,
      updateStep,
    ],
  );

  return <AudioEngineContext.Provider value={value}>{children}</AudioEngineContext.Provider>;
}

export function useAudioEngine() {
  const context = useContext(AudioEngineContext);

  if (!context) {
    throw new Error("useAudioEngine must be used within an AudioContextProvider");
  }

  return context;
}
