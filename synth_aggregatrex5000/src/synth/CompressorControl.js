import React from 'react';
import { Knob } from 'primereact/knob';
import './EffectControls.scss';

export const CompressorControl = ({ threshold, setThreshold, ratio, setRatio }) => {
  return (
    <div className="effect-control compressor-control">
  <h4 className="effect-title">compressor</h4>
      <div className="knob-row">
        <div className="knob-wrapper">
          <Knob value={threshold} onChange={(e) => setThreshold(e.value)} min={-60} max={0} step={1} size={40} />
          <div className="knob-label">thresh</div>
        </div>
        <div className="knob-wrapper">
          <Knob value={ratio} onChange={(e) => setRatio(e.value)} min={1} max={20} step={0.5} size={40} />
          <div className="knob-label">ratio</div>
        </div>
      </div>
    </div>
  );
};
