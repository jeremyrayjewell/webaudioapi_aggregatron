// src/synth/oscillator.js
import { useContext } from 'react';
import { AudioContextContext } from '../contexts/AudioContextProvider';
// import { setupAudioGraph } from './setupAudioGraph'; // unused import
import { applyTimbre } from './timbreControl';

const activeOscillators = {};
// removed unused _audioNodes

export const useOscillator = () => {
  const { audioContext, nodes } = useContext(AudioContextContext);

  if (!audioContext || !nodes) {
    console.error('[useOscillator] AudioContext or nodes not available');
    return { startOscillator: () => {}, stopOscillator: () => {} };
  }

  // Ensure master gain isn't accidentally zeroed elsewhere
  if (nodes.master && nodes.master.gain.value === 0) {
    console.warn('[useOscillator] Master gain was 0. Resetting to 0.8');
    nodes.master.gain.value = 0.8;
  }

  if (nodes?.convolver && !nodes.convolver.buffer) {
    console.warn('[useOscillator] Convolver has no buffer yet (impulse still loading)');
  }

  const startOscillator = (
    rawFreq,
    type = 'sine',
    adsr = { attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.1 },
    lfo = { rate: 5, depth: 0.5, phase: 0 },
    amplitude = 0.5,
    usePWM = false
  ) => {
    const freq = typeof rawFreq === 'string' ? parseFloat(rawFreq) : rawFreq;

    if (activeOscillators[freq]) {
      return;
    }

    if (audioContext.state === 'suspended') {
      console.log('[useOscillator] Resuming suspended AudioContext');
      audioContext.resume();
    }

    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    const lfoOsc = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

  osc1.type = type;
    osc1.frequency.value = freq;

    lfoOsc.type = 'sine';
    lfoOsc.frequency.value = lfo.rate;
    // Apply phase offset if provided (degrees) by constructing a periodic wave
    if (typeof lfo.phase === 'number' && lfo.phase !== 0) {
      const phaseRad = (lfo.phase * Math.PI) / 180;
      // A sine with phase phi: sin(wt + phi) = sin(wt)cos(phi) + cos(wt)sin(phi)
      // Web Audio periodicWave arrays: index 1 imag = sin coeff, real = cos coeff
      const real = new Float32Array(2);
      const imag = new Float32Array(2);
      real[0] = 0; imag[0] = 0; // DC
      real[1] = Math.sin(phaseRad); // cosine coefficient
      imag[1] = Math.cos(phaseRad); // sine coefficient
      try {
        const wave = audioContext.createPeriodicWave(real, imag);
        lfoOsc.setPeriodicWave(wave);
      } catch (e) {
        console.warn('[useOscillator] LFO phase periodicWave failed', e);
      }
    }
    lfoGain.gain.value = lfo.depth * freq;

    lfoOsc.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    const now = audioContext.currentTime;
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(amplitude, now + adsr.attack);
    gain1.gain.linearRampToValueAtTime(
      adsr.sustain * amplitude,
      now + adsr.attack + adsr.decay
    );

    // Connect to the main signal path through our nodes
    osc1.connect(gain1);
    // Apply generalized timbre shaping using existing lfo.pulseWidth param as 'timbre'
    if (typeof lfo.pulseWidth === 'number') {
      try {
        applyTimbre(osc1, type, lfo.pulseWidth);
      } catch (e) {
        console.warn('[useOscillator] applyTimbre failed', e);
      }
    }
    if (nodes.filter) {
      gain1.connect(nodes.filter);
    } else if (nodes.master) {
      console.warn('[useOscillator] Filter missing; connecting directly to master');
      gain1.connect(nodes.master);
    } else {
      console.error('[useOscillator] Neither filter nor master node available for connection');
    }

    // Reverb send (pre-filter gain tap)
    if (nodes.reverbGain) {
      const sendGain = audioContext.createGain();
      // Use current global reverb send level as baseline
      sendGain.gain.value = nodes.reverbGain.gain.value;
      gain1.connect(sendGain);
      sendGain.connect(nodes.reverbGain);
    }

    // Start the oscillators
    osc1.start();
    lfoOsc.start();
    
  activeOscillators[freq] = { osc1, gain1, lfoOsc, adsr };
  console.log('[useOscillator] Started oscillator', { freq, type, amplitude, adsr, lfo });
  };

  const stopOscillator = (rawFreq, immediate = false) => {
    const freq = typeof rawFreq === 'string' ? parseFloat(rawFreq) : rawFreq;

    const oscillator = activeOscillators[freq];
    if (!oscillator) {
      return;
    }

    const { osc1, gain1, lfoOsc, adsr } = oscillator;
    const now = audioContext.currentTime;

    if (immediate) {
      osc1.stop(now);
      lfoOsc.stop(now);
      delete activeOscillators[freq];
    } else {
      gain1.gain.setValueAtTime(gain1.gain.value, now);
      gain1.gain.linearRampToValueAtTime(0, now + adsr.release);
      osc1.stop(now + adsr.release);
      lfoOsc.stop(now + adsr.release);
      setTimeout(() => {
        delete activeOscillators[freq];
      }, adsr.release * 1000);
    }
  };

  // Expose simple test utilities for manual debugging
  if (typeof window !== 'undefined') {
    window.__startTestTone = () => startOscillator(440, 'sine');
    window.__stopTestTone = () => stopOscillator(440, true);
  }

  return { startOscillator, stopOscillator };
};