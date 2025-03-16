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

  const { audioContext, analyser } = useContext(AudioContextContext);

  if (!audioContext || !analyser) {
    console.log('Waiting for AudioContext and Analyser...');
    return <div>Loading Audio Context...</div>;
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