const ui = {
  startButton: document.getElementById("startButton"),
  stopButton: document.getElementById("stopButton"),
  headsetModeButton: document.getElementById("headsetModeButton"),
  statusLed: document.getElementById("statusLed"),
  spectrometerCanvas: document.getElementById("spectrometerCanvas"),
  meterValue: document.getElementById("meterValue"),
  fundamental: document.getElementById("fundamental"),
  fundamentalValue: document.getElementById("fundamentalValue"),
  quantizeEnabled: document.getElementById("quantizeEnabled"),
  rootNote: document.getElementById("rootNote"),
  scaleType: document.getElementById("scaleType"),
  waveform: document.getElementById("waveform"),
  harmonics: document.getElementById("harmonics"),
  harmonicsValue: document.getElementById("harmonicsValue"),
  brightness: document.getElementById("brightness"),
  brightnessValue: document.getElementById("brightnessValue"),
  carrierMonitor: document.getElementById("carrierMonitor"),
  carrierMonitorValue: document.getElementById("carrierMonitorValue"),
  bands: document.getElementById("bands"),
  bandsValue: document.getElementById("bandsValue"),
  mix: document.getElementById("mix"),
  mixValue: document.getElementById("mixValue"),
  attack: document.getElementById("attack"),
  attackValue: document.getElementById("attackValue"),
  release: document.getElementById("release"),
  releaseValue: document.getElementById("releaseValue"),
  inputGain: document.getElementById("inputGain"),
  inputGainValue: document.getElementById("inputGainValue"),
  gate: document.getElementById("gate"),
  gateValue: document.getElementById("gateValue"),
  noise: document.getElementById("noise"),
  noiseValue: document.getElementById("noiseValue"),
  outputGain: document.getElementById("outputGain"),
  outputGainValue: document.getElementById("outputGainValue")
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALE_INTERVALS = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  minorPentatonic: [0, 3, 5, 7, 10],
  majorPentatonic: [0, 2, 4, 7, 9]
};
const SEVEN_SEGMENT_MAP = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "c", "d", "e"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  "-": ["g"]
};

class AggregaVoxEngine {
  constructor(uiRefs) {
    this.ui = uiRefs;
    document.body.classList.remove("audio-on");
    document.body.classList.add("audio-off");
    this.audioContext = null;
    this.microphoneStream = null;
    this.microphoneSource = null;
    this.inputGainNode = null;
    this.modulatorHighpass = null;
    this.modulatorLowpass = null;
    this.outputCompressor = null;
    this.spectrometerAnalyser = null;
    this.spectrometerData = null;
    this.outputGainNode = null;
    this.dryGainNode = null;
    this.wetGainNode = null;
    this.carrierBus = null;
    this.carrierMonitorGainNode = null;
    this.noiseGainNode = null;
    this.noiseFilter = null;
    this.bandModules = [];
    this.carrierOscillators = [];
    this.animationFrame = 0;
    this.bufferLength = 256;
    this.spectrometerContext = this.ui.spectrometerCanvas.getContext("2d");
    this.meterSegments = Array.from(document.querySelectorAll(".meter-segment"));
    this.parameters = this.readParameters();
    this.drawSpectrometerIdle();
    this.setStatusLed("off");
    this.updateMeter(0);
  }

  readParameters() {
    return {
      fundamental: Number(this.ui.fundamental.value),
      quantizeEnabled: this.ui.quantizeEnabled.value === "on",
      rootNote: this.ui.rootNote.value,
      scaleType: this.ui.scaleType.value,
      waveform: this.ui.waveform.value,
      harmonics: Number(this.ui.harmonics.value),
      brightness: Number(this.ui.brightness.value),
      carrierMonitor: Number(this.ui.carrierMonitor.value),
      bands: Number(this.ui.bands.value),
      mix: Number(this.ui.mix.value),
      attack: Number(this.ui.attack.value),
      release: Number(this.ui.release.value),
      inputGain: Number(this.ui.inputGain.value),
      gate: Number(this.ui.gate.value),
      noise: Number(this.ui.noise.value),
      outputGain: Number(this.ui.outputGain.value),
      headsetMode: this.ui.headsetModeButton.getAttribute("aria-pressed") === "true"
    };
  }

  createMediaConstraints() {
    if (this.parameters.headsetMode) {
      return {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          latency: 0
        }
      };
    }

    return {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    };
  }

  getQuantizedFundamental() {
    const { fundamental, quantizeEnabled, rootNote, scaleType } = this.parameters;

    if (!quantizeEnabled) {
      return fundamental;
    }

    const midi = Math.round(69 + 12 * Math.log2(fundamental / 440));
    const rootIndex = NOTE_NAMES.indexOf(rootNote);
    const allowedIntervals = SCALE_INTERVALS[scaleType] || SCALE_INTERVALS.chromatic;
    let bestMidi = midi;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let candidate = 24; candidate <= 96; candidate += 1) {
      const pitchClass = (candidate - rootIndex + 1200) % 12;
      if (!allowedIntervals.includes(pitchClass)) {
        continue;
      }

      const distance = Math.abs(candidate - midi);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMidi = candidate;
      }
    }

    return 440 * Math.pow(2, (bestMidi - 69) / 12);
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("This browser does not support microphone capture.");
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.parameters = this.readParameters();
    this.microphoneStream = await navigator.mediaDevices.getUserMedia(this.createMediaConstraints());

    this.buildGraph();
    this.startEnvelopeLoop();
    document.body.classList.remove("audio-off");
    document.body.classList.add("audio-on");
  }

  buildGraph() {
    this.disposeGraph();

    const ctx = this.audioContext;
    const params = this.parameters;

    this.microphoneSource = ctx.createMediaStreamSource(this.microphoneStream);
    this.inputGainNode = ctx.createGain();
    this.inputGainNode.gain.value = params.inputGain;

    this.outputGainNode = ctx.createGain();
    this.outputGainNode.gain.value = params.outputGain;

    this.spectrometerAnalyser = ctx.createAnalyser();
    this.spectrometerAnalyser.fftSize = 256;
    this.spectrometerAnalyser.smoothingTimeConstant = 0.82;
    this.spectrometerData = new Uint8Array(this.spectrometerAnalyser.frequencyBinCount);

    this.outputCompressor = ctx.createDynamicsCompressor();
    this.outputCompressor.threshold.value = this.parameters.headsetMode ? -16 : -18;
    this.outputCompressor.knee.value = this.parameters.headsetMode ? 10 : 14;
    this.outputCompressor.ratio.value = this.parameters.headsetMode ? 2.6 : 2.1;
    this.outputCompressor.attack.value = 0.003;
    this.outputCompressor.release.value = this.parameters.headsetMode ? 0.08 : 0.11;

    this.modulatorHighpass = ctx.createBiquadFilter();
    this.modulatorHighpass.type = "highpass";
    this.modulatorHighpass.frequency.value = this.parameters.headsetMode ? 140 : 90;
    this.modulatorHighpass.Q.value = 0.707;

    this.modulatorLowpass = ctx.createBiquadFilter();
    this.modulatorLowpass.type = "lowpass";
    this.modulatorLowpass.frequency.value = this.parameters.headsetMode ? 3800 : 4600;
    this.modulatorLowpass.Q.value = 0.707;

    this.dryGainNode = ctx.createGain();
    this.wetGainNode = ctx.createGain();
    this.wetGainNode.gain.value = 1.45;
    this.updateMix(params.mix);

    this.carrierBus = ctx.createGain();
    this.carrierBus.gain.value = 0.42;

    this.carrierMonitorGainNode = ctx.createGain();
    this.carrierMonitorGainNode.gain.value = params.carrierMonitor;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "highpass";
    this.noiseFilter.frequency.value = 3200;
    this.noiseFilter.Q.value = 0.4;

    this.noiseGainNode = ctx.createGain();
    this.noiseGainNode.gain.value = params.noise;

    this.microphoneSource.connect(this.inputGainNode);
    this.inputGainNode.connect(this.dryGainNode);
    this.inputGainNode.connect(this.modulatorHighpass);
    this.modulatorHighpass.connect(this.modulatorLowpass);
    this.dryGainNode.connect(this.outputCompressor);
    this.wetGainNode.connect(this.outputCompressor);
    this.carrierMonitorGainNode.connect(this.outputCompressor);
    this.outputCompressor.connect(this.spectrometerAnalyser);
    this.outputCompressor.connect(this.outputGainNode);
    this.outputGainNode.connect(ctx.destination);
    this.carrierBus.connect(this.carrierMonitorGainNode);

    const noiseSource = this.createNoiseSource();
    noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGainNode);
    this.noiseGainNode.connect(this.carrierBus);
    noiseSource.start();
    this.noiseSource = noiseSource;

    this.createCarrierOscillators();
    this.createBands();
  }

  createNoiseSource() {
    const ctx = this.audioContext;
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  createCarrierOscillators() {
    const ctx = this.audioContext;
    const { harmonics, waveform, brightness } = this.parameters;
    const fundamental = this.getQuantizedFundamental();

    for (let i = 1; i <= harmonics; i += 1) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = waveform;
      oscillator.frequency.value = fundamental * i;
      gain.gain.value = brightness / Math.pow(i, 0.82);
      oscillator.connect(gain);
      gain.connect(this.carrierBus);
      oscillator.start();
      this.carrierOscillators.push({ oscillator, gain, harmonic: i });
    }
  }

  createBands() {
    const ctx = this.audioContext;
    const count = this.parameters.bands;
    const low = this.parameters.headsetMode ? 190 : 160;
    const high = this.parameters.headsetMode ? 3600 : 4200;
    const frequencies = [];

    for (let i = 0; i < count; i += 1) {
      const ratio = i / Math.max(1, count - 1);
      frequencies.push(low * Math.pow(high / low, ratio));
    }

    this.bandModules = frequencies.map((frequency, index) => {
      const widenedQ = count <= 10 ? 2.8 : 4.1;
      const modFilter = ctx.createBiquadFilter();
      modFilter.type = "bandpass";
      modFilter.frequency.value = frequency;
      modFilter.Q.value = widenedQ;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = this.bufferLength * 2;
      analyser.smoothingTimeConstant = 0.15;

      const carrierFilter = ctx.createBiquadFilter();
      carrierFilter.type = "bandpass";
      carrierFilter.frequency.value = frequency;
      carrierFilter.Q.value = widenedQ;

      const bandGain = ctx.createGain();
      bandGain.gain.value = 0;

      this.modulatorLowpass.connect(modFilter);
      modFilter.connect(analyser);

      this.carrierBus.connect(carrierFilter);
      carrierFilter.connect(bandGain);
      bandGain.connect(this.wetGainNode);

      return {
        index,
        frequency,
        analyser,
        bandGain,
        envelope: 0,
        target: 0,
        buffer: new Float32Array(analyser.fftSize)
      };
    });
  }

  startEnvelopeLoop() {
    cancelAnimationFrame(this.animationFrame);

    const update = () => {
      if (!this.audioContext || this.audioContext.state !== "running") {
        return;
      }

      const frameSeconds = 1 / 60;
      let total = 0;

      for (const band of this.bandModules) {
        band.analyser.getFloatTimeDomainData(band.buffer);

        let sumSquares = 0;
        for (let i = 0; i < band.buffer.length; i += 1) {
          const sample = band.buffer[i];
          sumSquares += sample * sample;
        }

        const rms = Math.sqrt(sumSquares / band.buffer.length);
        const gateFloor = this.parameters.headsetMode
          ? Math.max(this.parameters.gate, 0.01)
          : this.parameters.gate;
        const gated = Math.max(0, rms - gateFloor);
        const sensitivity = this.parameters.headsetMode ? 32 : 26;
        band.target = Math.min(1, gated * sensitivity);

        const timeConstant = band.target > band.envelope
          ? this.parameters.attack
          : this.parameters.release;

        const smoothing = 1 - Math.exp(-frameSeconds / Math.max(0.001, timeConstant));
        band.envelope += (band.target - band.envelope) * smoothing;

        const emphasis = 1 + (band.index / Math.max(1, this.bandModules.length - 1)) * 0.22;
        const voicedGain = Math.min(1.45, band.envelope * emphasis * 1.55);
        band.bandGain.gain.setTargetAtTime(voicedGain, this.audioContext.currentTime, 0.012);
        total += band.envelope;
      }

      const activity = this.bandModules.length ? total / this.bandModules.length : 0;
      this.updateMeter(activity);
      this.drawSpectrometerFrame(activity);
      if (activity > 0.18) {
        this.setStatusLed("green");
      } else if (activity > 0.08) {
        this.setStatusLed("yellow");
      } else {
        this.setStatusLed("red");
      }

      this.animationFrame = requestAnimationFrame(update);
    };

    this.animationFrame = requestAnimationFrame(update);
  }

  updateMix(value) {
    if (!this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;
    this.dryGainNode?.gain.setValueAtTime(1 - value, now);
    this.wetGainNode?.gain.setValueAtTime(value * 1.45, now);
  }

  updateOutputGain(value) {
    this.outputGainNode?.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.02);
  }

  updateInputGain(value) {
    this.inputGainNode?.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.02);
  }

  updateNoise(value) {
    this.noiseGainNode?.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.02);
  }

  updateCarrierMonitor(value) {
    this.carrierMonitorGainNode?.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.02);
  }

  rebuildBands() {
    if (!this.audioContext || !this.microphoneStream) {
      return;
    }

    this.buildGraph();
    this.startEnvelopeLoop();
  }

  updateCarrier() {
    if (!this.audioContext || !this.carrierOscillators.length) {
      return;
    }

    const { waveform, brightness } = this.parameters;
    const fundamental = this.getQuantizedFundamental();
    const now = this.audioContext.currentTime;

    for (const { oscillator, gain, harmonic } of this.carrierOscillators) {
      oscillator.type = waveform;
      oscillator.frequency.setTargetAtTime(fundamental * harmonic, now, 0.015);
      gain.gain.setTargetAtTime(brightness / Math.pow(harmonic, 0.82), now, 0.02);
    }
  }

  updateParameter(key, value) {
    this.parameters[key] = value;

    if (key === "mix") {
      this.updateMix(value);
    }

    if (key === "outputGain") {
      this.updateOutputGain(value);
    }

    if (key === "inputGain") {
      this.updateInputGain(value);
    }

    if (key === "noise") {
      this.updateNoise(value);
    }

    if (key === "carrierMonitor") {
      this.updateCarrierMonitor(value);
    }

    if (["fundamental", "quantizeEnabled", "rootNote", "scaleType", "waveform", "brightness"].includes(key)) {
      this.updateCarrier();
    }

    if (["harmonics", "bands"].includes(key) && this.audioContext) {
      this.rebuildBands();
    }
  }

  async stop() {
    cancelAnimationFrame(this.animationFrame);
    document.body.classList.remove("audio-on");
    document.body.classList.add("audio-off");
    this.updateMeter(0);
    this.drawSpectrometerIdle();
    this.setStatusLed("off");
    this.disposeGraph();

    this.microphoneStream?.getTracks().forEach((track) => track.stop());
    this.microphoneStream = null;

    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.suspend();
    }
  }

  disposeGraph() {
    for (const module of this.bandModules) {
      module.bandGain.disconnect();
      module.analyser.disconnect();
    }
    this.bandModules = [];

    for (const voice of this.carrierOscillators) {
      voice.oscillator.stop();
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }
    this.carrierOscillators = [];

    this.noiseSource?.stop();
    this.noiseSource?.disconnect();
    this.noiseSource = null;

    this.noiseGainNode?.disconnect();
    this.noiseFilter?.disconnect();
    this.carrierBus?.disconnect();
    this.carrierMonitorGainNode?.disconnect();
    this.dryGainNode?.disconnect();
    this.wetGainNode?.disconnect();
    this.outputCompressor?.disconnect();
    this.spectrometerAnalyser?.disconnect();
    this.outputGainNode?.disconnect();
    this.modulatorHighpass?.disconnect();
    this.modulatorLowpass?.disconnect();
    this.inputGainNode?.disconnect();
    this.microphoneSource?.disconnect();
    this.spectrometerAnalyser = null;
    this.spectrometerData = null;
  }

  drawSpectrometerIdle() {
    const ctx = this.spectrometerContext;
    const canvas = this.ui.spectrometerCanvas;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b0d08";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(210, 218, 151, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    ctx.shadowBlur = 16;
    ctx.shadowColor = "rgba(196, 255, 120, 0.65)";
    ctx.fillStyle = "rgba(210, 255, 145, 0.72)";
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText("FFT", 8, 14);
    ctx.fillText("IDLE", width - 32, height - 10);
    ctx.shadowBlur = 0;
  }

  drawSpectrometerFrame(activity) {
    if (!this.spectrometerAnalyser || !this.spectrometerData) {
      this.drawSpectrometerIdle();
      return;
    }

    this.spectrometerAnalyser.getByteFrequencyData(this.spectrometerData);

    const ctx = this.spectrometerContext;
    const canvas = this.ui.spectrometerCanvas;
    const { width, height } = canvas;
    const bars = 24;
    const barWidth = width / bars;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b0d08";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(210, 218, 151, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    for (let i = 0; i < bars; i += 1) {
      const start = Math.floor((i / bars) * this.spectrometerData.length);
      const end = Math.max(start + 1, Math.floor(((i + 1) / bars) * this.spectrometerData.length));
      let total = 0;

      for (let index = start; index < end; index += 1) {
        total += this.spectrometerData[index];
      }

      const magnitude = total / (end - start) / 255;
      const eased = Math.pow(magnitude, 1.35);
      const barHeight = Math.max(2, eased * (height - 20));
      const x = i * barWidth + 1;
      const y = height - barHeight - 1;
      const glow = 0.2 + activity * 0.45;

      ctx.shadowBlur = 24 + activity * 16;
      ctx.shadowColor = `rgba(196, 255, 120, ${0.75 + activity * 0.2})`;
      ctx.fillStyle = `rgba(210, 255, 145, ${0.72 + glow * 0.4})`;
      ctx.fillRect(x, y, Math.max(2, barWidth - 2), barHeight);

      ctx.fillStyle = `rgba(245, 255, 220, ${0.32 + activity * 0.2})`;
      ctx.fillRect(x, y, Math.max(1, barWidth - 3), Math.max(1, barHeight * 0.18));
    }

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(241, 185, 106, 0.8)";
    ctx.beginPath();
    const scanY = 8 + activity * (height - 16);
    ctx.moveTo(0, scanY);
    ctx.lineTo(width, scanY);
    ctx.stroke();

    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(196, 255, 120, 0.55)";
    ctx.fillStyle = "rgba(210, 255, 145, 0.9)";
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText("FFT", 8, 14);
    ctx.shadowBlur = 0;
  }

  setStatusLed(state) {
    this.ui.statusLed.classList.remove(
      "status-led-off",
      "status-led-red",
      "status-led-yellow",
      "status-led-green"
    );
    this.ui.statusLed.classList.add(`status-led-${state}`);
  }

  updateMeter(activity) {
    const totalSegments = this.meterSegments.length;
    const litSegments = Math.max(0, Math.min(totalSegments, Math.round(activity * totalSegments)));
    renderSevenSegment(this.ui.meterValue, `${litSegments}`);

    this.meterSegments.forEach((segment, index) => {
      segment.classList.toggle("meter-segment-active", index < litSegments);
    });
  }
}

const engine = new AggregaVoxEngine(ui);

function renderSevenSegment(target, text) {
  target.replaceChildren();

  for (const character of String(text)) {
    if (character === ".") {
      const dot = document.createElement("span");
      dot.className = "seven-dot";
      target.appendChild(dot);
      continue;
    }

    const digit = document.createElement("span");
    digit.className = "seven-char";

    for (const segmentName of ["a", "b", "c", "d", "e", "f", "g"]) {
      const segment = document.createElement("span");
      segment.className = `seven-seg seven-seg-${segmentName}`;
      if ((SEVEN_SEGMENT_MAP[character] || []).includes(segmentName)) {
        segment.classList.add("seven-seg-on");
      }
      digit.appendChild(segment);
    }

    target.appendChild(digit);
  }
}

function bindValue(input, label, formatter, key) {
  const sync = () => {
    const value = input.type === "range" ? Number(input.value) : input.value;
    renderSevenSegment(label, formatter(value));
    engine.updateParameter(key, value);
  };

  input.addEventListener("input", sync);
  sync();
}

function initializeWheelSelects() {
  const selects = Array.from(document.querySelectorAll("select"));

  const getWrappedIndex = (length, index) => {
    if (length === 0) {
      return 0;
    }

    return (index % length + length) % length;
  };

  const stepSelect = (select, direction) => {
    if (select.options.length === 0) {
      return;
    }

    const nextIndex = getWrappedIndex(select.options.length, select.selectedIndex + direction);
    select.selectedIndex = nextIndex;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const syncWheel = (select, wheel) => {
    const optionCount = select.options.length;
    const currentIndex = getWrappedIndex(optionCount, select.selectedIndex);
    const current = select.options[currentIndex]?.textContent ?? "";
    const previous = select.options[getWrappedIndex(optionCount, currentIndex - 1)]?.textContent ?? "";
    const next = select.options[getWrappedIndex(optionCount, currentIndex + 1)]?.textContent ?? "";

    wheel.querySelector(".wheel-select-current").textContent = current;
    wheel.querySelector(".wheel-select-prev").textContent = previous;
    wheel.querySelector(".wheel-select-next").textContent = next;
  };

  for (const select of selects) {
    select.classList.add("native-select-hidden");

    const wheel = document.createElement("div");
    wheel.className = "wheel-select";
    wheel.tabIndex = 0;
    wheel.setAttribute("role", "spinbutton");
    wheel.setAttribute("aria-label", select.closest("label")?.childNodes[0]?.textContent?.trim() || "Option selector");
    wheel.innerHTML = `
      <span class="wheel-select-arrow wheel-select-arrow-up" aria-hidden="true"></span>
      <div class="wheel-select-window">
        <div class="wheel-select-prev" aria-hidden="true"></div>
        <div class="wheel-select-current"></div>
        <div class="wheel-select-next" aria-hidden="true"></div>
      </div>
      <span class="wheel-select-arrow wheel-select-arrow-down" aria-hidden="true"></span>
    `;

    select.insertAdjacentElement("afterend", wheel);

    const render = () => syncWheel(select, wheel);
    render();

    select.addEventListener("change", render);

    wheel.addEventListener("wheel", (event) => {
      event.preventDefault();
      stepSelect(select, event.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    wheel.addEventListener("click", (event) => {
      const rect = wheel.getBoundingClientRect();
      const localY = event.clientY - rect.top;

      if (localY < rect.height * 0.35) {
        stepSelect(select, -1);
      } else if (localY > rect.height * 0.65) {
        stepSelect(select, 1);
      }
    });

    let dragAccumulator = 0;
    let dragging = false;
    let suppressClick = false;

    wheel.addEventListener("pointerdown", (event) => {
      dragging = true;
      suppressClick = false;
      dragAccumulator = 0;
      wheel.setPointerCapture(event.pointerId);
    });

    wheel.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }

      dragAccumulator += event.movementY;
      if (Math.abs(dragAccumulator) >= 10) {
        const steps = Math.trunc(Math.abs(dragAccumulator) / 10);
        const direction = dragAccumulator > 0 ? 1 : -1;

        for (let i = 0; i < steps; i += 1) {
          stepSelect(select, direction);
        }

        dragAccumulator -= steps * 10 * direction;
        suppressClick = true;
      }
    });

    const endDrag = (event) => {
      if (!dragging) {
        return;
      }

      dragging = false;
      dragAccumulator = 0;
      if (wheel.hasPointerCapture(event.pointerId)) {
        wheel.releasePointerCapture(event.pointerId);
      }
      setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    wheel.addEventListener("pointerup", endDrag);
    wheel.addEventListener("pointercancel", endDrag);

    wheel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        stepSelect(select, -1);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        stepSelect(select, 1);
      }
    });

    wheel.addEventListener("click", (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }
}

bindValue(ui.fundamental, ui.fundamentalValue, (value) => `${Math.round(value)}`, "fundamental");
bindValue(ui.harmonics, ui.harmonicsValue, (value) => `${value}`, "harmonics");
bindValue(ui.brightness, ui.brightnessValue, (value) => value.toFixed(2), "brightness");
bindValue(ui.carrierMonitor, ui.carrierMonitorValue, (value) => value.toFixed(2), "carrierMonitor");
bindValue(ui.bands, ui.bandsValue, (value) => `${value}`, "bands");
bindValue(ui.mix, ui.mixValue, (value) => `${Math.round(value * 100)}`, "mix");
bindValue(ui.attack, ui.attackValue, (value) => `${Math.round(value * 1000)}`, "attack");
bindValue(ui.release, ui.releaseValue, (value) => `${Math.round(value * 1000)}`, "release");
bindValue(ui.inputGain, ui.inputGainValue, (value) => `${value.toFixed(2)}`, "inputGain");
bindValue(ui.gate, ui.gateValue, (value) => value.toFixed(3), "gate");
bindValue(ui.noise, ui.noiseValue, (value) => value.toFixed(2), "noise");
bindValue(ui.outputGain, ui.outputGainValue, (value) => value.toFixed(2), "outputGain");
initializeWheelSelects();

ui.waveform.addEventListener("input", () => {
  engine.updateParameter("waveform", ui.waveform.value);
});

ui.quantizeEnabled.addEventListener("input", () => {
  engine.updateParameter("quantizeEnabled", ui.quantizeEnabled.value === "on");
});

ui.rootNote.addEventListener("input", () => {
  engine.updateParameter("rootNote", ui.rootNote.value);
});

ui.scaleType.addEventListener("input", () => {
  engine.updateParameter("scaleType", ui.scaleType.value);
});

ui.headsetModeButton.addEventListener("click", async () => {
  const nextState = ui.headsetModeButton.getAttribute("aria-pressed") !== "true";
  ui.headsetModeButton.setAttribute("aria-pressed", String(nextState));
  const wasRunning = ui.startButton.disabled;

  if (!wasRunning) {
    return;
  }

  await engine.stop();
  ui.startButton.disabled = false;
  ui.stopButton.disabled = true;
  ui.startButton.click();
});

ui.startButton.addEventListener("click", async () => {
  try {
    await engine.start();
    ui.startButton.disabled = true;
    ui.stopButton.disabled = false;
  } catch (error) {
    console.error(error);
  }
});

ui.stopButton.addEventListener("click", async () => {
  await engine.stop();
  ui.startButton.disabled = false;
  ui.stopButton.disabled = true;
});
