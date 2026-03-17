export function createCustomWaveform(audioCtx, type, frequency) {
  if (!audioCtx) return null;

  const oscillator = audioCtx.createOscillator();

  if (["sine", "square", "sawtooth", "triangle"].includes(type)) {
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    return oscillator;
  }

  switch (type) {
    case "pulse": {
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
    }
    case "fatsaw": {
      const detuneFactor = 5;
      const sawNode = audioCtx.createGain();
      const oscillators = [];

      for (let i = 0; i < 3; i++) {
        const detune = (i - 1) * detuneFactor;
        const detunedOsc = audioCtx.createOscillator();
        detunedOsc.type = "sawtooth";
        detunedOsc.frequency.value = frequency + detune;
        detunedOsc.connect(sawNode);
        oscillators.push(detunedOsc);

        if (i === 0) {
          Object.defineProperty(sawNode, "frequency", {
            value: detunedOsc.frequency,
          });
        }
      }

      Object.defineProperty(sawNode, "_oscillators", {
        value: oscillators,
      });

      Object.defineProperty(sawNode, "start", {
        value: (time) => {
          sawNode._oscillators.forEach((osc) => osc.start(time));
        },
      });

      Object.defineProperty(sawNode, "stop", {
        value: (time) => {
          sawNode._oscillators.forEach((osc) => osc.stop(time));
        },
      });

      sawNode.gain.value = 0.33;
      return sawNode;
    }
    case "organ": {
      const organNode = audioCtx.createGain();
      const harmonics = [1, 2, 3, 4, 6, 8];
      const volumes = [1, 0.6, 0.4, 0.25, 0.15, 0.08];
      const organOscs = [];

      harmonics.forEach((harmonic, i) => {
        const organOsc = audioCtx.createOscillator();
        organOsc.type = "sine";
        organOsc.frequency.value = frequency * harmonic;

        const harmonicGain = audioCtx.createGain();
        harmonicGain.gain.value = volumes[i] || 0.1;

        organOsc.connect(harmonicGain);
        harmonicGain.connect(organNode);
        organOscs.push(organOsc);
      });

      Object.defineProperty(organNode, "frequency", {
        value: { value: frequency },
      });
      Object.defineProperty(organNode, "_oscillators", {
        value: organOscs,
      });

      Object.defineProperty(organNode, "start", {
        value: (time) => {
          organNode._oscillators.forEach((osc) => osc.start(time));
        },
      });

      Object.defineProperty(organNode, "stop", {
        value: (time) => {
          organNode._oscillators.forEach((osc) => osc.stop(time));
        },
      });
      return organNode;
    }
    case "fm": {
      const carrier = audioCtx.createOscillator();
      const modulator = audioCtx.createOscillator();
      const modulationIndex = audioCtx.createGain();

      carrier.frequency.value = frequency;
      modulator.frequency.value = frequency * 2;
      modulationIndex.gain.value = 100;

      modulator.connect(modulationIndex);
      modulationIndex.connect(carrier.frequency);

      Object.defineProperty(carrier, "_modulator", {
        value: modulator,
      });

      const originalStart = carrier.start;
      Object.defineProperty(carrier, "start", {
        value: (time) => {
          originalStart.call(carrier, time);
          modulator.start(time);
        },
      });

      Object.defineProperty(carrier, "stop", {
        value: (time) => {
          carrier.__proto__.stop.call(carrier, time);
          modulator.stop(time);
        },
      });
      return carrier;
    }
    case "vintage": {
      const vintageOsc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const outputNode = audioCtx.createGain();

      vintageOsc.type = "sawtooth";
      vintageOsc.frequency.value = frequency * (1 + (Math.random() * 0.01 - 0.005));

      filter.type = "lowpass";
      filter.frequency.value = 1200;
      filter.Q.value = 8;

      vintageOsc.connect(filter);
      filter.connect(outputNode);

      Object.defineProperty(outputNode, "frequency", {
        value: vintageOsc.frequency,
      });
      Object.defineProperty(outputNode, "_oscillator", {
        value: vintageOsc,
      });

      Object.defineProperty(outputNode, "start", {
        value: (time) => {
          vintageOsc.start(time);
        },
      });

      Object.defineProperty(outputNode, "stop", {
        value: (time) => {
          vintageOsc.stop(time);
        },
      });
      return outputNode;
    }
    default:
      oscillator.type = "sine";
  }

  oscillator.frequency.value = frequency;
  return oscillator;
}

export function playSynthNote({
  audioCtx,
  analyser,
  frequency,
  startTime,
  durationSeconds = 0.2,
  settings,
}) {
  if (!audioCtx) return;

  const adjustedFreq = frequency * Math.pow(2, settings.selectedOctave);
  const oscillator = createCustomWaveform(audioCtx, settings.waveform, adjustedFreq);
  if (!oscillator) return;

  const gainNode = audioCtx.createGain();
  const now = startTime ?? audioCtx.currentTime;
  const attackTime = parseFloat(settings.attack);
  const decayTime = parseFloat(settings.decay);
  const sustainLevel = parseFloat(settings.sustain);
  const releaseTime = parseFloat(settings.release);
  const depth = parseFloat(settings.depth);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(depth, now + attackTime);
  gainNode.gain.linearRampToValueAtTime(
    sustainLevel * depth,
    now + attackTime + decayTime
  );

  let audioOutput = gainNode;

  if (settings.filterOn) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = settings.filterType;
    filter.frequency.value = parseFloat(settings.filterFrequency);
    filter.Q.value = parseFloat(settings.filterQ);
    audioOutput.connect(filter);
    audioOutput = filter;
  }

  oscillator.connect(audioOutput);
  audioOutput.connect(analyser);
  oscillator.start(now);

  if (settings.modulatorOn && settings.rate !== 1) {
    const modOscillator = audioCtx.createOscillator();
    modOscillator.type = settings.modulatorWaveform;
    modOscillator.frequency.value = parseFloat(settings.rate);
    const modGain = audioCtx.createGain();
    modGain.gain.value = depth;

    modOscillator.connect(modGain);
    modGain.connect(gainNode.gain);
    modOscillator.start(now);
    modOscillator.stop(now + durationSeconds + releaseTime);
  }

  if (settings.vibratoOn) {
    const vibratoOsc = audioCtx.createOscillator();
    vibratoOsc.type = "sine";
    vibratoOsc.frequency.value = parseFloat(settings.vibratoRate);

    const vibratoGain = audioCtx.createGain();
    vibratoGain.gain.value = parseFloat(settings.vibratoDepth);

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

  if (typeof oscillator.stop === "function") {
    oscillator.stop(noteOffTime + releaseTime);
  }
}
