// src/synth/oscillator.js
import { useContext } from 'react';
import { AudioContextContext } from '../contexts/AudioContextProvider';
import { setupAudioGraph } from './setupAudioGraph';
import { setupSignalFlow } from './signalFlow';

const activeOscillators = {};
let reverbBuffer = null;
let audioNodes = null;

const preloadImpulseResponse = async (audioContext) => {
  try {
    const response = await fetch('./assets/impulse-response.wav');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    reverbBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error('Failed to preload impulse response:', err);
  }
};

export const useOscillator = () => {
  const { audioContext } = useContext(AudioContextContext);

  if (!audioContext) {
    console.error('AudioContext is not available');
    return { startOscillator: () => {}, stopOscillator: () => {} };
  }

  if (!audioNodes) {
    audioNodes = setupAudioGraph(audioContext);
    setupSignalFlow(audioNodes, audioNodes.analyser, audioContext.destination);
  }

  if (!reverbBuffer) preloadImpulseResponse(audioContext);

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

    osc1.connect(gain1);
    gain1.connect(audioNodes.analyser); 
    audioNodes.analyser.connect(audioContext.destination); 

    osc1.start();
    lfoOsc.start();
    activeOscillators[freq] = { osc1, gain1, lfoOsc, adsr };
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

  return { startOscillator, stopOscillator };
};