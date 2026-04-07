import { decodeAudioFile } from "./audio/decode.js";
import { prepareSignalSegment } from "./audio/preprocess.js";
import { detectBpm } from "./analysis/bpm.js";
import { detectKey } from "./analysis/key.js";
import { detectPitch } from "./analysis/pitch.js";
import { extractMelody } from "./analysis/melody.js";
import { PolySynth } from "./synthesis/synth.js";
import { DrumMachine } from "./synthesis/drums.js";
import { TransportScheduler } from "./synthesis/scheduler.js";

const fileInput = document.querySelector("#file-input");
const analyzeButton = document.querySelector("#analyze-button");
const playMelodyButton = document.querySelector("#play-melody-button");
const playDrumsButton = document.querySelector("#play-drums-button");
const playFullButton = document.querySelector("#play-full-button");
const saveAnalysisButton = document.querySelector("#save-analysis-button");
const loadAnalysisButton = document.querySelector("#load-analysis-button");
const analysisFileInput = document.querySelector("#analysis-file-input");
const stopButton = document.querySelector("#stop-button");
const scaleCorrectionToggle = document.querySelector("#scale-correction");
const analysisStartInput = document.querySelector("#analysis-start");
const analysisLengthSelect = document.querySelector("#analysis-length");
const rangeSummary = document.querySelector("#range-summary");
const statusNode = document.querySelector("#status");
const masterGainInput = document.querySelector("#master-gain");
const masterGainValue = document.querySelector("#master-gain-value");
const melodyGainInput = document.querySelector("#melody-gain");
const melodyGainValue = document.querySelector("#melody-gain-value");
const drumGainInput = document.querySelector("#drum-gain");
const drumGainValue = document.querySelector("#drum-gain-value");
const melodyWaveformInput = document.querySelector("#melody-waveform");
const melodyTransposeInput = document.querySelector("#melody-transpose");
const melodyTransposeValue = document.querySelector("#melody-transpose-value");
const melodyVelocityInput = document.querySelector("#melody-velocity");
const melodyVelocityValue = document.querySelector("#melody-velocity-value");
const melodyLengthScaleInput = document.querySelector("#melody-length-scale");
const melodyLengthScaleValue = document.querySelector("#melody-length-scale-value");
const melodyAttackInput = document.querySelector("#melody-attack");
const melodyAttackValue = document.querySelector("#melody-attack-value");
const melodyDecayInput = document.querySelector("#melody-decay");
const melodyDecayValue = document.querySelector("#melody-decay-value");
const melodySustainInput = document.querySelector("#melody-sustain");
const melodySustainValue = document.querySelector("#melody-sustain-value");
const melodyReleaseInput = document.querySelector("#melody-release");
const melodyReleaseValue = document.querySelector("#melody-release-value");
const melodyFilterCutoffInput = document.querySelector("#melody-filter-cutoff");
const melodyFilterCutoffValue = document.querySelector("#melody-filter-cutoff-value");
const melodyFilterQInput = document.querySelector("#melody-filter-q");
const melodyFilterQValue = document.querySelector("#melody-filter-q-value");
const melodyFlangerEnabledInput = document.querySelector("#melody-flanger-enabled");
const melodyFlangerMixInput = document.querySelector("#melody-flanger-mix");
const melodyFlangerMixValue = document.querySelector("#melody-flanger-mix-value");
const melodyFlangerRateInput = document.querySelector("#melody-flanger-rate");
const melodyFlangerRateValue = document.querySelector("#melody-flanger-rate-value");
const melodyFlangerDepthInput = document.querySelector("#melody-flanger-depth");
const melodyFlangerDepthValue = document.querySelector("#melody-flanger-depth-value");
const melodyPhaserEnabledInput = document.querySelector("#melody-phaser-enabled");
const melodyPhaserMixInput = document.querySelector("#melody-phaser-mix");
const melodyPhaserMixValue = document.querySelector("#melody-phaser-mix-value");
const melodyPhaserRateInput = document.querySelector("#melody-phaser-rate");
const melodyPhaserRateValue = document.querySelector("#melody-phaser-rate-value");
const melodyPhaserDepthInput = document.querySelector("#melody-phaser-depth");
const melodyPhaserDepthValue = document.querySelector("#melody-phaser-depth-value");
const melodyNoteLimitInput = document.querySelector("#melody-note-limit");
const melodyNoteLimitValue = document.querySelector("#melody-note-limit-value");
const melodyGlideEnabledInput = document.querySelector("#melody-glide-enabled");
const melodyGlideTimeInput = document.querySelector("#melody-glide-time");
const melodyGlideTimeValue = document.querySelector("#melody-glide-time-value");
const melodyArpeggiatorEnabledInput = document.querySelector("#melody-arpeggiator-enabled");
const melodyArpeggiatorPatternInput = document.querySelector("#melody-arpeggiator-pattern");
const melodyArpeggiatorRateInput = document.querySelector("#melody-arpeggiator-rate");
const melodyArpeggiatorSpanInput = document.querySelector("#melody-arpeggiator-span");
const drumEnergyInput = document.querySelector("#drum-energy");
const drumEnergyValue = document.querySelector("#drum-energy-value");
const drumDensityInput = document.querySelector("#drum-density");
const drumHihatToneInput = document.querySelector("#drum-hihat-tone");
const drumHihatToneValue = document.querySelector("#drum-hihat-tone-value");
const drumSnareToneInput = document.querySelector("#drum-snare-tone");
const drumSnareToneValue = document.querySelector("#drum-snare-tone-value");

const bpmValue = document.querySelector("#bpm-value");
const keyValue = document.querySelector("#key-value");
const scaleValue = document.querySelector("#scale-value");
const melodyCountValue = document.querySelector("#melody-count");
const analysisJson = document.querySelector("#analysis-json");

const waveformCanvas = document.querySelector("#waveform-canvas");
const pitchCanvas = document.querySelector("#pitch-canvas");
const beatsCanvas = document.querySelector("#beats-canvas");

let audioContext = null;
let synth = null;
let drums = null;
let scheduler = null;
let latestAnalysis = null;
let latestSignal = null;
let latestPitchFrames = null;
let latestSampleRate = 44100;
let latestDurationSeconds = 0;
let latestVisualizationData = null;
const saveableControls = Array.from(document.querySelectorAll("[data-save-key]"));

function summarizeWaveform(signal, width = 960) {
  if (!signal.length) return [];

  const summary = [];
  const samplesPerBucket = Math.max(1, Math.floor(signal.length / width));
  for (let x = 0; x < width; x += 1) {
    const start = x * samplesPerBucket;
    let min = 1;
    let max = -1;
    for (let index = start; index < Math.min(start + samplesPerBucket, signal.length); index += 1) {
      min = Math.min(min, signal[index]);
      max = Math.max(max, signal[index]);
    }
    summary.push([min, max]);
  }
  return summary;
}

function renderVisualizationState(visualizationData) {
  if (!visualizationData) {
    drawWaveformFromSummary([]);
    drawPitchTimeline([]);
    drawBeatMarkersFromData([], 1);
    return;
  }

  drawWaveformFromSummary(visualizationData.waveformSummary || []);
  drawPitchTimeline(visualizationData.pitchFrames || []);
  drawBeatMarkersFromData(visualizationData.beatPeaks || [], visualizationData.durationSeconds || 1);
}

function readControlValue(control) {
  if (control.type === "checkbox") {
    return control.checked;
  }
  if (control.type === "number" || control.type === "range") {
    return Number(control.value);
  }
  return control.value;
}

function writeControlValue(control, value) {
  if (value === undefined) {
    return;
  }
  if (control.type === "checkbox") {
    control.checked = Boolean(value);
    return;
  }
  control.value = String(value);
}

function collectSaveableControlState() {
  return saveableControls.reduce((controls, control) => {
    controls[control.dataset.saveKey] = readControlValue(control);
    return controls;
  }, {});
}

function applySaveableControlState(controlState = {}) {
  saveableControls.forEach((control) => {
    writeControlValue(control, controlState[control.dataset.saveKey]);
  });
  updateModLabels();
}

function buildVisualizationDataFromAnalysis(analysis) {
  const melody = Array.isArray(analysis.melody) ? analysis.melody : [];
  const durationSeconds = Math.max(
    1,
    melody.reduce((maxTime, note) => {
      const noteEnd = ((note.time || 0) + (note.duration || 0)) * (60 / Math.max(analysis.bpm || 120, 1));
      return Math.max(maxTime, noteEnd);
    }, 0),
  );

  const pitchFrames = melody.flatMap((note) => {
    const noteSeconds = 60 / Math.max(analysis.bpm || 120, 1);
    const startSeconds = (note.time || 0) * noteSeconds;
    const endSeconds = startSeconds + (note.duration || 0) * noteSeconds;
    const frameCount = Math.max(1, Math.round(((note.duration || 0) * 4)));
    const frames = [];

    for (let index = 0; index < frameCount; index += 1) {
      const time = startSeconds + ((endSeconds - startSeconds) * index) / frameCount;
      frames.push({
        time,
        note: note.note,
        confidence: 1,
      });
    }

    return frames;
  });

  const beatPeaks = [];
  const beatLength = 60 / Math.max(analysis.bpm || 120, 1);
  for (let time = 0; time <= durationSeconds; time += beatLength) {
    beatPeaks.push(time);
  }

  const waveformSummary = Array.from({ length: waveformCanvas.width }, (_, index) => {
    const time = (index / Math.max(waveformCanvas.width - 1, 1)) * durationSeconds;
    let amplitude = 0.02;

    for (const note of melody) {
      const noteStart = (note.time || 0) * beatLength;
      const noteEnd = noteStart + (note.duration || 0) * beatLength;
      if (time >= noteStart && time <= noteEnd) {
        const phase = ((time - noteStart) / Math.max(noteEnd - noteStart, 0.001)) * Math.PI;
        amplitude = Math.max(amplitude, 0.15 + 0.55 * Math.sin(phase));
      }
    }

    return [-amplitude, amplitude];
  });

  return {
    waveformSummary,
    pitchFrames,
    beatPeaks,
    durationSeconds,
  };
}

function normalizeLoadedPayload(payload) {
  if (isValidAnalysis(payload)) {
    return { analysis: payload, visualizations: null, settings: null };
  }

  if (payload && isValidAnalysis(payload.analysis)) {
    return {
      analysis: payload.analysis,
      visualizations: payload.visualizations || null,
      settings: payload.settings || null,
    };
  }

  throw new Error("Invalid analysis format.");
}

function formatSeconds(seconds) {
  return `${Math.max(0, Math.round(seconds))} sec`;
}

function getSelectedAnalysisRange() {
  const requestedStart = Number(analysisStartInput.value || 0);
  const requestedLength = Number(analysisLengthSelect.value || 30);
  const start = Math.max(0, requestedStart);
  const maxLength = Math.max(1, latestDurationSeconds - start);
  const length = Math.min(requestedLength, maxLength || requestedLength);
  return { start, length };
}

function updateRangeSummary() {
  if (!latestDurationSeconds) {
    rangeSummary.textContent = "Analysis range: waiting for file.";
    return;
  }

  const { start, length } = getSelectedAnalysisRange();
  const end = Math.min(latestDurationSeconds, start + length);
  rangeSummary.textContent = `Analysis range: ${formatSeconds(start)} to ${formatSeconds(end)} of ${formatSeconds(latestDurationSeconds)}.`;
}

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.style.color = isError ? "#842029" : "";
}

function updateModLabels() {
  masterGainValue.textContent = `${Number(masterGainInput.value).toFixed(2)}x`;
  melodyGainValue.textContent = `${Number(melodyGainInput.value).toFixed(2)}x`;
  drumGainValue.textContent = `${Number(drumGainInput.value).toFixed(2)}x`;
  melodyTransposeValue.textContent = `${Number(melodyTransposeInput.value)} st`;
  melodyVelocityValue.textContent = Number(melodyVelocityInput.value).toFixed(2);
  melodyLengthScaleValue.textContent = `${Number(melodyLengthScaleInput.value).toFixed(2)}x`;
  melodyAttackValue.textContent = `${Number(melodyAttackInput.value).toFixed(3)} s`;
  melodyDecayValue.textContent = `${Number(melodyDecayInput.value).toFixed(2)} s`;
  melodySustainValue.textContent = Number(melodySustainInput.value).toFixed(2);
  melodyReleaseValue.textContent = `${Number(melodyReleaseInput.value).toFixed(2)} s`;
  melodyFilterCutoffValue.textContent = `${Number(melodyFilterCutoffInput.value)} Hz`;
  melodyFilterQValue.textContent = `${Number(melodyFilterQInput.value).toFixed(1)} Q`;
  melodyFlangerMixValue.textContent = Number(melodyFlangerMixInput.value).toFixed(2);
  melodyFlangerRateValue.textContent = `${Number(melodyFlangerRateInput.value).toFixed(2)} Hz`;
  melodyFlangerDepthValue.textContent = `${(Number(melodyFlangerDepthInput.value) * 1000).toFixed(1)} ms`;
  melodyPhaserMixValue.textContent = Number(melodyPhaserMixInput.value).toFixed(2);
  melodyPhaserRateValue.textContent = `${Number(melodyPhaserRateInput.value).toFixed(2)} Hz`;
  melodyPhaserDepthValue.textContent = `${Number(melodyPhaserDepthInput.value)} Hz`;
  melodyNoteLimitValue.textContent = String(Number(melodyNoteLimitInput.value));
  melodyGlideTimeValue.textContent = `${Number(melodyGlideTimeInput.value).toFixed(2)} s`;
  drumEnergyValue.textContent = `${Number(drumEnergyInput.value).toFixed(2)}x`;
  drumHihatToneValue.textContent = `${Number(drumHihatToneInput.value)} Hz`;
  drumSnareToneValue.textContent = `${Number(drumSnareToneInput.value)} Hz`;
}

function applyPlaybackGains() {
  if (!synth || !drums) {
    return;
  }

  const master = Number(masterGainInput.value);
  synth.setGain(master * Number(melodyGainInput.value));
  drums.setGain(master * Number(drumGainInput.value));
}

function applyMelodyEffects() {
  if (!synth) {
    return;
  }

  synth.updateEffects({
    flangerEnabled: melodyFlangerEnabledInput.checked,
    flangerMix: Number(melodyFlangerMixInput.value),
    flangerRate: Number(melodyFlangerRateInput.value),
    flangerDepth: Number(melodyFlangerDepthInput.value),
    phaserEnabled: melodyPhaserEnabledInput.checked,
    phaserMix: Number(melodyPhaserMixInput.value),
    phaserRate: Number(melodyPhaserRateInput.value),
    phaserDepth: Number(melodyPhaserDepthInput.value),
  });
}

function getMelodyModSettings() {
  return {
    waveform: melodyWaveformInput.value,
    transpose: Number(melodyTransposeInput.value),
    velocity: Number(melodyVelocityInput.value),
    lengthScale: Number(melodyLengthScaleInput.value),
    attack: Number(melodyAttackInput.value),
    decay: Number(melodyDecayInput.value),
    sustain: Number(melodySustainInput.value),
    release: Number(melodyReleaseInput.value),
    filterCutoff: Number(melodyFilterCutoffInput.value),
    filterQ: Number(melodyFilterQInput.value),
    flangerEnabled: melodyFlangerEnabledInput.checked,
    flangerMix: Number(melodyFlangerMixInput.value),
    flangerRate: Number(melodyFlangerRateInput.value),
    flangerDepth: Number(melodyFlangerDepthInput.value),
    phaserEnabled: melodyPhaserEnabledInput.checked,
    phaserMix: Number(melodyPhaserMixInput.value),
    phaserRate: Number(melodyPhaserRateInput.value),
    phaserDepth: Number(melodyPhaserDepthInput.value),
    noteLimit: Number(melodyNoteLimitInput.value),
    glideEnabled: melodyGlideEnabledInput.checked,
    glideTime: Number(melodyGlideTimeInput.value),
    arpeggiatorEnabled: melodyArpeggiatorEnabledInput.checked,
    arpeggiatorPattern: melodyArpeggiatorPatternInput.value,
    arpeggiatorRate: Number(melodyArpeggiatorRateInput.value),
    arpeggiatorSpan: Number(melodyArpeggiatorSpanInput.value),
  };
}

function getDrumModSettings() {
  return {
    energy: Number(drumEnergyInput.value),
    density: drumDensityInput.value,
    hihatTone: Number(drumHihatToneInput.value),
    snareTone: Number(drumSnareToneInput.value),
  };
}

async function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
    synth = new PolySynth(audioContext);
    drums = new DrumMachine(audioContext);
    scheduler = new TransportScheduler(audioContext, synth, drums);
    applyPlaybackGains();
    applyMelodyEffects();
  }

  if (audioContext.state === "suspended") await audioContext.resume();
  applyPlaybackGains();
  applyMelodyEffects();
}

function updateMetrics(analysis) {
  bpmValue.textContent = String(analysis.bpm);
  if (analysis.ambiguousRelative) {
    keyValue.textContent = `${analysis.ambiguousRelative.primary.key} / ${analysis.ambiguousRelative.secondary.key}`;
    scaleValue.textContent = `${analysis.ambiguousRelative.primary.scale} / ${analysis.ambiguousRelative.secondary.scale}`;
  } else {
    keyValue.textContent = analysis.key;
    scaleValue.textContent = analysis.scale;
  }
  melodyCountValue.textContent = String(analysis.melody.length);
  analysisJson.textContent = JSON.stringify(analysis, null, 2);
  saveAnalysisButton.disabled = false;
}

function setPlaybackAvailability(analysis) {
  const hasMelody = Boolean(analysis?.melody?.length);
  playMelodyButton.disabled = !hasMelody;
  playDrumsButton.disabled = false;
  playFullButton.disabled = !hasMelody;
  stopButton.disabled = false;
}

function isValidAnalysis(analysis) {
  return Boolean(
    analysis
    && typeof analysis.bpm === "number"
    && typeof analysis.key === "string"
    && typeof analysis.scale === "string"
    && Array.isArray(analysis.melody),
  );
}

function applyLoadedAnalysis(analysis, sourceLabel = "saved analysis") {
  const normalized = normalizeLoadedPayload(analysis);
  applySaveableControlState(normalized.settings?.controls);
  latestAnalysis = normalized.analysis;
  latestSignal = null;
  latestVisualizationData = normalized.visualizations || buildVisualizationDataFromAnalysis(latestAnalysis);
  latestPitchFrames = latestVisualizationData.pitchFrames || [];
  updateMetrics(latestAnalysis);
  setPlaybackAvailability(latestAnalysis);
  renderVisualizationState(latestVisualizationData);
  setStatus(`Loaded ${sourceLabel}.`);
}

function drawWaveformFromSummary(summary) {
  const context = waveformCanvas.getContext("2d");
  const { width, height } = waveformCanvas;
  context.clearRect(0, 0, width, height);
  if (!summary.length) return;
  context.lineWidth = 2;
  context.strokeStyle = "#b0502d";
  context.beginPath();

  for (let x = 0; x < Math.min(width, summary.length); x += 1) {
    const [min, max] = summary[x];
    const y1 = ((1 - max) * 0.5) * height;
    const y2 = ((1 - min) * 0.5) * height;
    context.moveTo(x, y1);
    context.lineTo(x, y2);
  }

  context.stroke();
}

function drawWaveform(signal) {
  drawWaveformFromSummary(summarizeWaveform(signal, waveformCanvas.width));
}

function drawPitchTimeline(pitchFrames) {
  const context = pitchCanvas.getContext("2d");
  const { width, height } = pitchCanvas;
  context.clearRect(0, 0, width, height);
  if (!pitchFrames.length) return;
  context.strokeStyle = "#1c6b46";
  context.lineWidth = 2;
  context.beginPath();

  const detected = pitchFrames.filter((frame) => frame && frame.note !== null);
  if (!detected.length) return;

  const minNote = Math.min(...detected.map((frame) => frame.note)) - 2;
  const maxNote = Math.max(...detected.map((frame) => frame.note)) + 2;
  const totalTime = pitchFrames[pitchFrames.length - 1].time || 1;

  detected.forEach((frame, index) => {
    const x = (frame.time / totalTime) * width;
    const normalized = (frame.note - minNote) / Math.max(maxNote - minNote, 1);
    const y = height - normalized * height;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });

  context.stroke();
}

function drawBeatMarkersFromData(peaks, durationSeconds) {
  const context = beatsCanvas.getContext("2d");
  const { width, height } = beatsCanvas;

  context.clearRect(0, 0, width, height);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;
  context.fillStyle = "rgba(176, 80, 45, 0.15)";
  context.fillRect(0, height / 2 - 6, width, 12);
  context.strokeStyle = "#68584a";
  context.lineWidth = 1;

  peaks.forEach((time) => {
    const x = (time / durationSeconds) * width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  });
}

function drawBeatMarkers(signal, sampleRate, peaks) {
  drawBeatMarkersFromData(peaks, signal.length / sampleRate);
}

async function analyzeSelectedFile() {
  const file = fileInput.files?.[0];
  if (!file) {
    setStatus("Choose a file before analyzing.", true);
    return;
  }

  analyzeButton.disabled = true;
  playMelodyButton.disabled = true;
  playDrumsButton.disabled = true;
  playFullButton.disabled = true;
  saveAnalysisButton.disabled = true;
  stopButton.disabled = true;

  try {
    await ensureAudioContext();
    setStatus(`Decoding ${file.name}...`);

    const audioBuffer = await decodeAudioFile(audioContext, file);
    latestSampleRate = audioBuffer.sampleRate;
    latestDurationSeconds = audioBuffer.duration;
    updateRangeSummary();

    const analysisRange = getSelectedAnalysisRange();
    setStatus(`Running analysis on ${formatSeconds(analysisRange.length)} starting at ${formatSeconds(analysisRange.start)}...`);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    latestSignal = prepareSignalSegment(audioBuffer, analysisRange.start, analysisRange.length);

    const bpmResult = detectBpm(latestSignal, latestSampleRate);
    const pitchResult = detectPitch(latestSignal, latestSampleRate);
    const melody = extractMelody(pitchResult.frames, bpmResult.bpm);
    const keyResult = detectKey(pitchResult.frames, melody);
    latestPitchFrames = pitchResult.frames;

    latestAnalysis = {
      bpm: bpmResult.bpm,
      key: keyResult.key,
      scale: keyResult.scale,
      keyConfidence: keyResult.confidence,
      keyCandidates: keyResult.candidates,
      ambiguousRelative: keyResult.ambiguousRelative,
      melody,
    };
    latestVisualizationData = {
      waveformSummary: summarizeWaveform(latestSignal, waveformCanvas.width),
      pitchFrames: latestPitchFrames,
      beatPeaks: bpmResult.peaks,
      durationSeconds: latestSignal.length / latestSampleRate,
    };

    updateMetrics(latestAnalysis);
    renderVisualizationState(latestVisualizationData);

    setPlaybackAvailability(latestAnalysis);
    const hasMelody = latestAnalysis.melody.length > 0;
    setStatus(
      hasMelody
        ? `Analysis complete. Detected ${latestAnalysis.melody.length} melody notes in the selected range.`
        : "Analysis complete, but no stable melody notes were detected from this file.",
      false,
    );
  } catch (error) {
    console.error(error);
    setStatus(`Analysis failed: ${error.message}`, true);
  } finally {
    analyzeButton.disabled = false;
  }
}

async function playAnalysis(options) {
  if (!latestAnalysis) {
    setStatus("Analyze an audio file first.", true);
    return;
  }

  await ensureAudioContext();

  const melodyMod = getMelodyModSettings();
  const melody = latestAnalysis.melody.slice(0, melodyMod.noteLimit || 128);
  scheduler.start(
    { ...latestAnalysis, melody },
    {
      includeMelody: options.includeMelody,
      includeDrums: options.includeDrums,
      scaleCorrection: scaleCorrectionToggle.checked,
      melodyMod,
      drumMod: getDrumModSettings(),
    },
  );

  if (options.includeMelody && options.includeDrums) {
    setStatus("Full playback started.");
  } else if (options.includeMelody) {
    setStatus("Melody playback started.");
  } else {
    setStatus("Drum playback started.");
  }
}

function stopPlayback() {
  scheduler?.stop();
  setStatus("Playback stopped.");
}

function buildSuggestedAnalysisFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `augsemble-analysis-${timestamp}.json`;
}

async function saveAnalysisToFile() {
  if (!latestAnalysis) {
    setStatus("Analyze or load a result before saving.", true);
    return;
  }

  const serialized = JSON.stringify(
    {
      analysis: latestAnalysis,
      visualizations: latestVisualizationData,
      settings: {
        controls: collectSaveableControlState(),
      },
    },
    null,
    2,
  );

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: buildSuggestedAnalysisFilename(),
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(serialized);
      await writable.close();
      setStatus(`Analysis saved to ${handle.name}.`);
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus("Save cancelled.");
        return;
      }
      console.error(error);
      setStatus("Native save dialog failed. Falling back to browser download.", true);
    }
  }

  const blob = new Blob([serialized], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildSuggestedAnalysisFilename();
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Analysis downloaded as JSON. Your browser may choose the save location.");
}

async function loadAnalysisFromFile() {
  const file = analysisFileInput.files?.[0];
  if (!file) return;

  try {
    const parsed = JSON.parse(await file.text());
    applyLoadedAnalysis(parsed, file.name);
  } catch (error) {
    setStatus(`Could not load analysis: ${error.message}`, true);
  } finally {
    analysisFileInput.value = "";
  }
}

analyzeButton.addEventListener("click", analyzeSelectedFile);
playMelodyButton.addEventListener("click", () => playAnalysis({ includeMelody: true, includeDrums: false }));
playDrumsButton.addEventListener("click", () => playAnalysis({ includeMelody: false, includeDrums: true }));
playFullButton.addEventListener("click", () => playAnalysis({ includeMelody: true, includeDrums: true }));
saveAnalysisButton.addEventListener("click", saveAnalysisToFile);
loadAnalysisButton.addEventListener("click", () => analysisFileInput.click());
analysisFileInput.addEventListener("change", loadAnalysisFromFile);
stopButton.addEventListener("click", stopPlayback);
fileInput.addEventListener("change", () => {
  if (fileInput.files?.[0]) {
    setStatus(`Loaded ${fileInput.files[0].name}. Adjust the analysis range, then click Analyze.`);
  }
});
analysisStartInput.addEventListener("input", updateRangeSummary);
analysisLengthSelect.addEventListener("change", updateRangeSummary);
melodyTransposeInput.addEventListener("input", updateModLabels);
melodyVelocityInput.addEventListener("input", updateModLabels);
melodyLengthScaleInput.addEventListener("input", updateModLabels);
melodyAttackInput.addEventListener("input", updateModLabels);
melodyDecayInput.addEventListener("input", updateModLabels);
melodySustainInput.addEventListener("input", updateModLabels);
melodyReleaseInput.addEventListener("input", updateModLabels);
melodyFilterCutoffInput.addEventListener("input", updateModLabels);
melodyFilterQInput.addEventListener("input", updateModLabels);
melodyFlangerEnabledInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyFlangerMixInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyFlangerRateInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyFlangerDepthInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyPhaserEnabledInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyPhaserMixInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyPhaserRateInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyPhaserDepthInput.addEventListener("input", () => {
  updateModLabels();
  applyMelodyEffects();
});
melodyNoteLimitInput.addEventListener("input", updateModLabels);
melodyGlideTimeInput.addEventListener("input", updateModLabels);
drumEnergyInput.addEventListener("input", updateModLabels);
drumHihatToneInput.addEventListener("input", updateModLabels);
drumSnareToneInput.addEventListener("input", updateModLabels);
masterGainInput.addEventListener("input", () => {
  updateModLabels();
  applyPlaybackGains();
});
melodyGainInput.addEventListener("input", () => {
  updateModLabels();
  applyPlaybackGains();
});
drumGainInput.addEventListener("input", () => {
  updateModLabels();
  applyPlaybackGains();
});
updateModLabels();
