export class TransportScheduler {
  constructor(audioContext, synth, drums) {
    this.audioContext = audioContext;
    this.synth = synth;
    this.drums = drums;
    this.lookaheadMs = 25;
    this.scheduleAheadTime = 0.1;
    this.intervalId = null;
    this.state = null;
  }

  start(analysis, options = {}) {
    this.stop();

    this.state = {
      analysis,
      options: {
        includeMelody: options.includeMelody !== false,
        includeDrums: options.includeDrums !== false,
        scaleCorrection: Boolean(options.scaleCorrection),
        melodyMod: options.melodyMod || {},
        drumMod: options.drumMod || {},
      },
      secondsPerBeat: 60 / analysis.bpm,
      startTime: this.audioContext.currentTime + 0.05,
      currentStep: 0,
      melodyIndex: 0,
      totalSteps: Math.max(64, Math.ceil(this.findMelodyLength(analysis) * 4) + 4),
    };

    this.intervalId = window.setInterval(() => this.tick(), this.lookaheadMs);
  }

  findMelodyLength(analysis) {
    return analysis.melody.reduce((maxBeat, note) => Math.max(maxBeat, note.time + note.duration), 0);
  }

  buildArpeggioSequence(note, scale, span, pattern) {
    const triad = scale === "minor" ? [0, 3, 7] : [0, 4, 7];
    const notes = [];

    for (let octave = 0; octave < span; octave += 1) {
      for (const interval of triad) {
        notes.push(note + interval + octave * 12);
      }
    }

    if (pattern === "down") {
      return [...notes].reverse();
    }

    if (pattern === "updown") {
      const descending = [...notes].slice(1, -1).reverse();
      return notes.concat(descending);
    }

    return notes;
  }

  scheduleMelodyNote(note, noteTime, secondsPerBeat, analysis, previousNote) {
    const melodyMod = this.state.options.melodyMod;
    const noteDurationSeconds = note.duration * secondsPerBeat;
    const noteStartsAt = note.time * secondsPerBeat;
    const previousEndsAt = previousNote
      ? (previousNote.time + previousNote.duration) * secondsPerBeat
      : null;
    const shouldGlide = Boolean(
      melodyMod.glideEnabled
      && previousNote
      && Math.abs(noteStartsAt - previousEndsAt) <= secondsPerBeat * 0.35,
    );

    if (melodyMod.arpeggiatorEnabled) {
      const arpRateBeats = Number(melodyMod.arpeggiatorRate || 0.25);
      const arpStepSeconds = arpRateBeats * secondsPerBeat;
      const sequence = this.buildArpeggioSequence(
        note.note,
        analysis.scale,
        Number(melodyMod.arpeggiatorSpan || 1),
        melodyMod.arpeggiatorPattern || "up",
      );

      if (!sequence.length) {
        return;
      }

      const totalSteps = Math.max(1, Math.floor(noteDurationSeconds / arpStepSeconds));
      for (let step = 0; step < totalSteps; step += 1) {
        const arpNote = sequence[step % sequence.length];
        const stepTime = noteTime + step * arpStepSeconds;
        const stepDuration = Math.min(arpStepSeconds * 0.92, noteDurationSeconds - step * arpStepSeconds);
        if (stepDuration <= 0) {
          continue;
        }

        this.synth.playNote(arpNote, stepTime, stepDuration, {
          key: analysis.key,
          scale: analysis.scale,
          scaleCorrection: this.state.options.scaleCorrection,
          waveform: melodyMod.waveform || "sawtooth",
          velocity: melodyMod.velocity || 0.22,
          transpose: melodyMod.transpose || 0,
          lengthScale: melodyMod.lengthScale || 1,
          attack: melodyMod.attack ?? 0.01,
          decay: melodyMod.decay ?? 0.08,
          sustain: melodyMod.sustain ?? 0.65,
          release: melodyMod.release ?? 0.12,
          filterCutoff: melodyMod.filterCutoff ?? 8000,
          filterQ: melodyMod.filterQ ?? 0.8,
          glideEnabled: Boolean(melodyMod.glideEnabled),
          glideFromNote: step > 0 ? sequence[(step - 1) % sequence.length] : (shouldGlide ? previousNote.note : null),
          glideTime: melodyMod.glideTime || 0.08,
        });
      }
      return;
    }

    this.synth.playNote(note.note, noteTime, noteDurationSeconds, {
      key: analysis.key,
      scale: analysis.scale,
      scaleCorrection: this.state.options.scaleCorrection,
      waveform: melodyMod.waveform || "sawtooth",
      velocity: melodyMod.velocity || 0.22,
      transpose: melodyMod.transpose || 0,
      lengthScale: melodyMod.lengthScale || 1,
      attack: melodyMod.attack ?? 0.01,
      decay: melodyMod.decay ?? 0.08,
      sustain: melodyMod.sustain ?? 0.65,
      release: melodyMod.release ?? 0.12,
      filterCutoff: melodyMod.filterCutoff ?? 8000,
      filterQ: melodyMod.filterQ ?? 0.8,
      glideEnabled: shouldGlide,
      glideFromNote: shouldGlide ? previousNote.note : null,
      glideTime: melodyMod.glideTime || 0.08,
    });
  }

  tick() {
    if (!this.state) return;

    const { analysis, secondsPerBeat } = this.state;
    const currentTime = this.audioContext.currentTime;

    while (this.state.startTime + this.state.currentStep * (secondsPerBeat / 4) < currentTime + this.scheduleAheadTime) {
      const stepTime = this.state.startTime + this.state.currentStep * (secondsPerBeat / 4);
      if (this.state.options.includeDrums) {
        this.drums.scheduleStep(this.state.currentStep, stepTime, {
          ...this.state.options.drumMod,
          bpm: analysis.bpm,
        });
      }

      while (this.state.options.includeMelody && this.state.melodyIndex < analysis.melody.length) {
        const note = analysis.melody[this.state.melodyIndex];
        const noteTime = this.state.startTime + note.time * secondsPerBeat;
        if (noteTime > currentTime + this.scheduleAheadTime) break;
        const previousIndex = this.state.melodyIndex === 0 ? analysis.melody.length - 1 : this.state.melodyIndex - 1;
        const previousNote = analysis.melody[previousIndex] || null;
        this.scheduleMelodyNote(note, noteTime, secondsPerBeat, analysis, previousNote);

        this.state.melodyIndex += 1;
      }

      this.state.currentStep += 1;
      if (this.state.currentStep > this.state.totalSteps) {
        this.state.startTime += this.state.totalSteps * (secondsPerBeat / 4);
        this.state.currentStep = 0;
        this.state.melodyIndex = 0;
      }
    }
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state = null;
  }
}
