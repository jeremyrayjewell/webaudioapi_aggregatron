// src/App.js
import React, { useState, useContext, useEffect } from 'react';
import { Keyboard } from './keyboard/Keyboard';
import './App.scss';
import { ControlPanel } from './synth/controlPanel';
import { AudioContextProvider, AudioContextContext } from './contexts/AudioContextProvider';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import MobilePan from './components/MobilePan';
import StartOverlay from './components/StartOverlay';

function App() {
  // Lock screen orientation to portrait on mobile
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        if (isMobile && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('portrait-primary');
        }
      } catch (error) {
        // Orientation lock may not be supported or allowed
        console.log('Screen orientation lock not supported or allowed:', error);
      }
    };

    lockOrientation();
  }, []);
  const [activeNotes, setActiveNotes] = useState({});
  const [oscillatorType, setOscillatorType] = useState('sawtooth');
  const [adsr, setADSR] = useState({ attack: 0.1, decay: 0.1, sustain: 0.7, release: 0.1 });
  const [lfo, setLFO] = useState({ rate: 5, depth: 0.5, pulseWidth: 0.5, phase: 0 });
  const [amplitude, setAmplitude] = useState(0.5);
  const [reverbLevel, setReverbLevel] = useState(0);
  const [reverbDecay, setReverbDecay] = useState(1);

  const { audioContext, analyser, startAudio, attemptedAutoInit } = useContext(AudioContextContext);

  // Always render app; show overlay button when audio isn't started

  console.log('AudioContext and Analyser ready:', { audioContext, analyser });

  return (
    <div className="App">
  <StartOverlay
        visible={!audioContext || !analyser}
        label={attemptedAutoInit ? 'Enable Audio' : 'Start Audio'}
        onStart={startAudio}
      />
  <MobilePan key={audioContext ? 'audio-on' : 'audio-off'}>
        <div className="instrument">
          <div className="instrument-center">
            <div className="instrument-inner">
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
          </div>
        </div>
      </MobilePan>
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