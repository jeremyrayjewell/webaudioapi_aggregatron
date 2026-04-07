import { midiToFrequency, snapMidiToScale } from "../utils/midi.js";

export class PolySynth {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.voiceBus = this.audioContext.createGain();
    this.dryGain = this.audioContext.createGain();
    this.flangerDelay = this.audioContext.createDelay(0.05);
    this.flangerFeedback = this.audioContext.createGain();
    this.flangerWet = this.audioContext.createGain();
    this.flangerLfo = this.audioContext.createOscillator();
    this.flangerLfoGain = this.audioContext.createGain();
    this.phaserWet = this.audioContext.createGain();
    this.phaserFilters = Array.from({ length: 4 }, () => this.audioContext.createBiquadFilter());
    this.phaserLfo = this.audioContext.createOscillator();
    this.phaserLfoGains = this.phaserFilters.map(() => this.audioContext.createGain());
    this.output = this.audioContext.createGain();
    this.baseGain = 0.75;
    this.output.gain.value = this.baseGain;
    this.output.connect(this.audioContext.destination);

    this.dryGain.gain.value = 1;
    this.flangerWet.gain.value = 0;
    this.flangerFeedback.gain.value = 0.25;
    this.phaserWet.gain.value = 0;

    this.voiceBus.connect(this.dryGain);
    this.dryGain.connect(this.output);

    this.voiceBus.connect(this.flangerDelay);
    this.flangerDelay.connect(this.flangerFeedback);
    this.flangerFeedback.connect(this.flangerDelay);
    this.flangerDelay.connect(this.flangerWet);
    this.flangerWet.connect(this.output);
    this.flangerLfo.connect(this.flangerLfoGain);
    this.flangerLfoGain.connect(this.flangerDelay.delayTime);
    this.flangerLfo.start();

    let phaserChain = this.voiceBus;
    this.phaserFilters.forEach((filter, index) => {
      filter.type = "allpass";
      filter.frequency.value = 500 + index * 220;
      filter.Q.value = 0.7;
      phaserChain.connect(filter);
      this.phaserLfo.connect(this.phaserLfoGains[index]);
      this.phaserLfoGains[index].connect(filter.frequency);
      phaserChain = filter;
    });
    phaserChain.connect(this.phaserWet);
    this.phaserWet.connect(this.output);
    this.phaserLfo.start();
    this.updateEffects({});
  }

  setGain(amount) {
    this.output.gain.value = this.baseGain * amount;
  }

  updateEffects(options = {}) {
    const flangerEnabled = Boolean(options.flangerEnabled);
    this.flangerWet.gain.value = flangerEnabled ? (options.flangerMix ?? 0.35) : 0;
    this.flangerDelay.delayTime.value = 0.0035;
    this.flangerLfo.frequency.value = options.flangerRate ?? 0.25;
    this.flangerLfoGain.gain.value = flangerEnabled ? (options.flangerDepth ?? 0.0025) : 0;

    const phaserEnabled = Boolean(options.phaserEnabled);
    this.phaserWet.gain.value = phaserEnabled ? (options.phaserMix ?? 0.3) : 0;
    this.phaserLfo.frequency.value = options.phaserRate ?? 0.2;
    this.phaserFilters.forEach((filter, index) => {
      filter.frequency.value = 500 + index * 220;
      this.phaserLfoGains[index].gain.value = phaserEnabled ? (options.phaserDepth ?? 900) : 0;
    });
  }

  midiToFreq(note) {
    return midiToFrequency(note);
  }

  playNote(note, time, durationSeconds, options = {}) {
    const transposedNote = note + (options.transpose || 0);
    const finalNote = options.scaleCorrection
      ? snapMidiToScale(transposedNote, options.key, options.scale)
      : transposedNote;
    const oscillator = this.audioContext.createOscillator();
    const filterNode = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();
    const velocity = options.velocity || 0.2;
    const attack = Math.max(0.001, options.attack ?? 0.01);
    const decay = Math.max(0.001, options.decay ?? 0.08);
    const sustain = Math.max(0.05, Math.min(1, options.sustain ?? 0.65));
    const release = Math.max(0.001, options.release ?? 0.12);

    oscillator.type = options.waveform || "sawtooth";
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(options.filterCutoff ?? 8000, time);
    filterNode.Q.value = options.filterQ ?? 0.8;
    const targetFrequency = this.midiToFreq(finalNote);
    const glideFromFrequency = options.glideFromNote !== undefined && options.glideFromNote !== null
      ? this.midiToFreq(options.glideFromNote + (options.transpose || 0))
      : null;
    const glideTime = Math.max(0.001, options.glideTime || 0.08);

    if (options.glideEnabled && glideFromFrequency) {
      oscillator.frequency.setValueAtTime(glideFromFrequency, time);
      oscillator.frequency.linearRampToValueAtTime(targetFrequency, time + glideTime);
    } else {
      oscillator.frequency.setValueAtTime(targetFrequency, time);
    }

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(velocity, time + attack);
    gainNode.gain.linearRampToValueAtTime(velocity * sustain, time + attack + decay);

    const scaledDuration = Math.max(0.04, durationSeconds * (options.lengthScale || 1));
    const releaseStart = time + Math.max(scaledDuration, attack + decay);
    gainNode.gain.setValueAtTime(velocity * sustain, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0.0001, releaseStart + release);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.voiceBus);
    oscillator.start(time);
    oscillator.stop(releaseStart + release + 0.02);
  }
}
