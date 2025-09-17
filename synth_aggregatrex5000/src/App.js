// src/App.js
import React, { useState, useContext } from 'react';
import { Keyboard } from './keyboard/Keyboard';
import './App.scss';
import { ControlPanel } from './synth/controlPanel';
import { AudioContextProvider, AudioContextContext } from './contexts/AudioContextProvider';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
  const [activeNotes, setActiveNotes] = useState({});
  const [oscillatorType, setOscillatorType] = useState('sawtooth');
  const [adsr, setADSR] = useState({ attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.1 });
  const [lfo, setLFO] = useState({ rate: 5, depth: 0.5, pulseWidth: 0.5, phase: 0 });
  const [amplitude, setAmplitude] = useState(0.5);
  const [reverbLevel, setReverbLevel] = useState(0);
  const [reverbDecay, setReverbDecay] = useState(1);

  const { audioContext, analyser, startAudio, initError, attemptedAutoInit } = useContext(AudioContextContext);

  if (!audioContext || !analyser) {
    return (
      <div className="App" style={{ justifyContent: 'center' }}>
        <h2>Audio Engine Not Started</h2>
        {initError && <p style={{ color: 'salmon' }}>Init issue: {initError}</p>}
        <button onClick={startAudio} style={{ padding: '0.75rem 1.25rem', fontSize: '1rem', cursor: 'pointer' }}>
          {attemptedAutoInit ? 'Enable Audio' : 'Start Audio'}
        </button>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '1rem' }}>
          Your browser may require a user gesture (click / key press) to start Web Audio.
        </p>
      </div>
    );
  }

  console.log('AudioContext and Analyser ready:', { audioContext, analyser });

  return (
    <div className="App">
      <div className="control-panel-container">
        <ControlPanel
          setOscillatorType={setOscillatorType}
          adsr={adsr}
          setADSR={setADSR}
          lfo={lfo}
          setLFO={setLFO}
          amplitude={amplitude}
          setAmplitude={setAmplitude}
          reverbLevel={reverbLevel}
          setReverbLevel={setReverbLevel}
          reverbDecay={reverbDecay}
          setReverbDecay={setReverbDecay}
        />
      </div>

      <div className="keyboard-container">
        <Keyboard
          activeNotes={activeNotes}
          setActiveNotes={setActiveNotes}
          oscillatorType={oscillatorType}
          adsr={adsr}
          lfo={lfo}
          amplitude={amplitude}
        />
      </div>
    </div>
  );
}

export default function AppWithProvider() {
  return (
    <AudioContextProvider>
      <App />
    </AudioContextProvider>
  );
}