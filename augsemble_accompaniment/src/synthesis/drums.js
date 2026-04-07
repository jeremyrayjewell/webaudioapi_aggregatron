function createNoiseBuffer(audioContext) {
  const length = Math.floor(audioContext.sampleRate * 0.2);
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

export class DrumMachine {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.output = audioContext.createGain();
    this.baseGain = 0.85;
    this.output.gain.value = this.baseGain;
    this.output.connect(audioContext.destination);
    this.noiseBuffer = createNoiseBuffer(audioContext);
  }

  setGain(amount) {
    this.output.gain.value = this.baseGain * amount;
  }

  triggerKick(time, options = {}) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const energy = options.energy || 1;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(140, time);
    oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.exponentialRampToValueAtTime(0.7 * energy, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(this.output);
    oscillator.start(time);
    oscillator.stop(time + 0.2);
  }

  triggerSnare(time, options = {}) {
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    const bandpass = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();
    const energy = options.energy || 1;

    bandpass.type = "bandpass";
    bandpass.frequency.value = options.snareTone || 1800;
    bandpass.Q.value = 0.8;

    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.exponentialRampToValueAtTime(0.5 * energy, time + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.output);
    noiseSource.start(time);
    noiseSource.stop(time + 0.18);
  }

  triggerHiHat(time, options = {}) {
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    const highpass = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();
    const energy = options.energy || 1;

    highpass.type = "highpass";
    highpass.frequency.value = options.hihatTone || 6500;

    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.exponentialRampToValueAtTime(0.18 * energy, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noiseSource.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(this.output);
    noiseSource.start(time);
    noiseSource.stop(time + 0.06);
  }

  scheduleStep(stepIndex, time, options = {}) {
    const density = options.density || "normal";
    if (stepIndex % 4 === 0) this.triggerKick(time, options);
    if (stepIndex % 8 === 4) this.triggerSnare(time, options);
    if (density === "sparse") {
      if (stepIndex % 4 === 2) this.triggerHiHat(time, options);
      return;
    }
    this.triggerHiHat(time, options);
    if (density === "busy" && stepIndex % 2 === 1) {
      this.triggerHiHat(time + 0.5 * (60 / (options.bpm || 120)) / 4, options);
    }
  }
}
