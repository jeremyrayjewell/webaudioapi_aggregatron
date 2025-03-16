import React, { useState, useEffect } from 'react';
import './oscillatorSwitcher.scss';
import sineWave from '../assets/sine-wave.svg'; 
import squareWave from '../assets/square-wave.svg';
import sawtoothWave from '../assets/sawtooth-wave.svg';
import triangleWave from '../assets/triangle-wave.svg';




export const OscillatorSwitcher = ({ setOscillatorType }) => {
  const [selectedOscillator, setSelectedOscillator] = useState('sawtooth');

  useEffect(() => {
    setOscillatorType(selectedOscillator);
  }, [selectedOscillator, setOscillatorType]);

  const handleChange = (e) => {
    setSelectedOscillator(e.target.value);
  };

  return (
    <div className="oscillator-switcher">
      <label>
      <img src={sineWave} alt="Sine Wave" className="oscillator-icon" />
        <input
          type="radio"
          name="oscillator"
          value="sine"
          checked={selectedOscillator === 'sine'}
          onChange={handleChange}
        />
        sine
      </label>
      <label>
      <img src={squareWave} alt="Square Wave" className="oscillator-icon" />
        <input
          type="radio"
          name="oscillator"
          value="square"
          checked={selectedOscillator === 'square'}
          onChange={handleChange}
        />
        square
      </label>
      <label>
        <img src={sawtoothWave} alt="Sawtooth Wave" className="oscillator-icon" />
        <input
          type="radio"
          name="oscillator"
          value="sawtooth"
          checked={selectedOscillator === 'sawtooth'}
          onChange={handleChange}
        />
        sawtooth
      </label>
      <label>
        <img src={triangleWave} alt="Triangle Wave" className="oscillator-icon" />
        <input
          type="radio"
          name="oscillator"
          value="triangle"
          checked={selectedOscillator === 'triangle'}
          onChange={handleChange}
        />
        triangle
      </label>
    </div>
  );
};