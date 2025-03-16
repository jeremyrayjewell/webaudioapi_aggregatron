import './ReverbControl.scss';
import React from 'react';
import { Knob } from 'primereact/knob';
import reverbIcon from '../assets/reverb.svg';
import decayIcon from '../assets/decay.svg';

export const ReverbControl = ({ reverbLevel, setReverbLevel, reverbDecay, setReverbDecay }) => {
  const handleReverbLevelChange = (value) => {
    setReverbLevel(parseFloat(value));
  };

  const handleReverbDecayChange = (value) => {
    setReverbDecay(parseFloat(value));
  };

  return (
    <div className="reverb-control">
      <label>
        <img src={reverbIcon} alt="Reverb Level" className="oscillator-icon" />
        <Knob
          value={reverbLevel || 0}
          step={0.01}
          min={0}
          max={1}
          onChange={(e) => handleReverbLevelChange(e.value)}
          size={40}
        />
        Reverb Level
      </label>
      <label>
        <img src={decayIcon} alt="Reverb Decay" className="oscillator-icon" />
        <Knob
          value={reverbDecay || 1}
          step={0.1}
          min={0.1}
          max={10}
          onChange={(e) => handleReverbDecayChange(e.value)}
          size={40}
        />
        Reverb Decay
      </label>
    </div>
  );
};