import React from 'react';
import { Knob } from 'primereact/knob';
import './EffectControls.scss';

export const DistortionControl = ({ drive, setDrive, mix, setMix }) => {
  return (
    <div className="effect-control distortion-control">
  <h4 className="effect-title">distortion</h4>
      <div className="knob-row">
        <div className="knob-wrapper">
          <Knob value={Math.round(drive * 100)} onChange={(e) => setDrive(e.value / 100)} min={0} max={100} step={1} size={40} />
          <div className="knob-label">drive</div>
        </div>
        <div className="knob-wrapper">
          <Knob value={Math.round(mix * 100)} onChange={(e) => setMix(e.value / 100)} min={0} max={100} step={1} size={40} />
          <div className="knob-label">mix</div>
        </div>
      </div>
    </div>
  );
};
