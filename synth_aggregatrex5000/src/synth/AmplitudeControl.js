import './AmplitudeControl.scss';
import React, { useEffect } from 'react';
import { Knob } from 'primereact/knob';
import amplitudeIcon from '../assets/amplitude.svg';
import filterIcon from '../assets/filter.svg';
import cutoffIcon from '../assets/cutoff.svg';
import resonanceIcon from '../assets/resonance.svg';
import { configureFilter } from './filterConfig';

const filterTypes = ['none', 'lowpass', 'highpass'];
const filterLabels = ['null', 'l.p.', 'h.p.'];

export const AmplitudeControl = ({
  amplitude,
  setAmplitude,
  filterType,
  setFilterType,
  cutoff,
  setCutoff,
  resonance,
  setResonance,
  filterNode, // Filter node passed from parent
}) => {
  const handleAmplitudeChange = (value) => {
    setAmplitude(parseFloat(value));
  };

  const handleFilterTypeChange = (value) => {
    const selectedType = filterTypes[value];
    setFilterType(selectedType);
    console.log(`Filter type changed to: ${selectedType}`);
  };

  const handleCutoffChange = (value) => {
    setCutoff(parseFloat(value));
    console.log(`Cutoff frequency changed to: ${value} Hz`);
  };

  const handleResonanceChange = (value) => {
    setResonance(parseFloat(value));
    console.log(`Resonance (Q) changed to: ${value}`);
  };

  // Use effect to dynamically update the filter
  useEffect(() => {
    if (!filterNode) {
      console.warn('Filter node is still null in AmplitudeControl.');
    } else {
      console.log('Filter node received in AmplitudeControl:', filterNode);
      console.log('Audio graph state:');
      console.log('FilterNode connections:', filterNode.numberOfInputs, filterNode.numberOfOutputs);
      console.log('FilterNode properties before update:', {
        type: filterNode.type,
        frequency: filterNode.frequency.value,
        Q: filterNode.Q.value,
      });

      configureFilter(filterNode, filterType, cutoff, resonance);

      console.log('FilterNode properties after update:', {
        type: filterNode.type,
        frequency: filterNode.frequency.value,
        Q: filterNode.Q.value,
      });
    }
  }, [filterType, cutoff, resonance, filterNode]);

  return (
    <div className="amplitude-control">
      <label>
        <img src={amplitudeIcon} alt="Amplitude" className="oscillator-icon" />
        <Knob
          value={amplitude || 0}
          step={0.01}
          min={0}
          max={1}
          onChange={(e) => handleAmplitudeChange(e.value)}
          size={40}
        />
        amplitude
      </label>
      <label>
        <img src={filterIcon} alt="Filter Type" className="oscillator-icon" />
        <Knob
          value={filterTypes.indexOf(filterType) || 0}
          step={1}
          min={0}
          max={2}
          onChange={(e) => handleFilterTypeChange(e.value)}
          size={40}
        />
        <span className="filter-label">filter: {filterLabels[filterTypes.indexOf(filterType) || 0]}</span>
      </label>
      <label>
        <img src={cutoffIcon} alt="Cutoff" className="oscillator-icon" />
        <Knob
          value={cutoff || 20}
          step={0.01}
          min={20}
          max={20000}
          onChange={(e) => handleCutoffChange(e.value)}
          size={40}
        />
        cutoff
      </label>
      <label>
        <img src={resonanceIcon} alt="Resonance" className="oscillator-icon" />
        <Knob
          value={resonance || 0}
          step={0.01}
          min={0}
          max={10}
          onChange={(e) => handleResonanceChange(e.value)}
          size={40}
        />
        resonance
      </label>
    </div>
  );
};