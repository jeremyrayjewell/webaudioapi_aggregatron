// my-app/src/synth/LFOControl.js
import './LFOControl.scss';
import React from 'react';
import { Knob } from 'primereact/knob';
import lfoRate from '../assets/lfo-rate.svg';
import lfoDepth from '../assets/lfo-depth.svg';
import lfoPulseWidth from '../assets/lfo-pulse-width.svg';
import lfoPhase from '../assets/lfo-phase.svg';

export const LFOControl = ({ lfo, setLFO }) => {
  const handleChange = (name, value) => {
    setLFO((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="lfo-control">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <label>
        <img src={lfoRate} alt="LFO Rate" className="oscillator-icon" />
        <Knob
          value={lfo.rate}
          step={0.01}
          min={0}
          max={20}
          onChange={(e) => handleChange('rate', e.value)}
          size={40}
        />
        rate
      </label>
      <label>
        <img src={lfoDepth} alt="LFO Depth" className="oscillator-icon" />
        <Knob
          value={lfo.depth}
          step={0.01}
          min={0}
          max={1}
          onChange={(e) => handleChange('depth', e.value)}
          size={40}
        />
        depth
      </label>
      <label>
        <img src={lfoPulseWidth} alt="LFO Pulse Width" className="oscillator-icon" />
        <Knob
          value={lfo.pulseWidth}
          step={0.01}
          min={0}
          max={1}
          onChange={(e) => handleChange('pulseWidth', e.value)}
          size={40}
        />
        width
      </label>
      <label>
        <img src={lfoPhase} alt="LFO Phase" className="oscillator-icon" />
        <Knob
          value={lfo.phase}
          step={0.01}
          min={0}
          max={360}
          onChange={(e) => handleChange('phase', e.value)}
          size={40}
        />
        phase
      </label>
    </div>
  );
};