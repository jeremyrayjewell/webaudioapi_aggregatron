import './ADSRControl.scss';
import React from 'react';
import { Knob } from 'primereact/knob';
import attack from '../assets/attack.svg'; 
import decay from '../assets/decay.svg';
import sustain from '../assets/sustain.svg';
import release from '../assets/release.svg';


export const ADSRControl = ({ adsr, setADSR }) => {
  const handleChange = (name, value) => {
    setADSR((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="adsr-control">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <label>
      <img src={attack} alt="Attack" className="oscillator-icon" /> 
        <Knob
          value={adsr.attack}
          step={0.01}
          min={0}
          max={5}
          onChange={(e) => handleChange('attack', e.value)}
          size={40}
        />
        attack
      </label>
      <label>
      <img src={decay} alt="Decay" className="oscillator-icon" />
        <Knob
          value={adsr.decay}
          step={0.01}
          min={0}
          max={5}
          onChange={(e) => handleChange('decay', e.value)}
          size={40}
        />
        decay
      </label>
      <label>
      <img src={sustain} alt="Sustain" className="oscillator-icon" />
        <Knob
          value={adsr.sustain}
          step={0.01}
          min={0}
          max={1}
          onChange={(e) => handleChange('sustain', e.value)}
          size={40}
        />
        sustain
      </label>
      <label>
      <img src={release} alt="Release" className="oscillator-icon" />
        <Knob
          value={adsr.release}
          step={0.01}
          min={0}
          max={5}
          onChange={(e) => handleChange('release', e.value)}
          size={40}
        />
        release
      </label>
    </div>
  );
};