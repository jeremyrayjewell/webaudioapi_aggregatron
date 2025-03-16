import React, { useState, useEffect, useContext } from 'react';
import { OscillatorSwitcher } from './oscillatorSwitcher';
import { ADSRControl } from './ADSRControl';
import { LFOControl } from './LFOControl';
import WaveformVisualizer from './WaveformVisualizer';
import { AmplitudeControl } from './AmplitudeControl';
import { ReverbControl } from './ReverbControl';
import { AudioContextContext } from '../contexts/AudioContextProvider';
import { configureFilter } from './filterConfig';
import './controlPanel.scss';

export const ControlPanel = ({
    setOscillatorType,
    adsr, setADSR,
    lfo, setLFO,
    amplitude, setAmplitude,
    reverbLevel, setReverbLevel,
    reverbDecay, setReverbDecay,
}) => {
    const { analyser, nodes } = useContext(AudioContextContext);
    const filterNode = nodes.filter;  // No need for state or effects for filterNode

    const [filterType, setFilterType] = useState('lowpass');
    const [cutoff, setCutoff] = useState(20000);
    const [resonance, setResonance] = useState(0);

    useEffect(() => {
        configureFilter(filterNode, filterType, cutoff, resonance);
    }, [filterNode, filterType, cutoff, resonance]);

    return (
        <div className="control-panel">
            <div className="control-section">
                <OscillatorSwitcher setOscillatorType={setOscillatorType} />
                <LFOControl lfo={lfo} setLFO={setLFO} />
                <ADSRControl adsr={adsr} setADSR={setADSR} />
            </div>
            <div className="control-section">
                <WaveformVisualizer analyser={analyser} />                
                <AmplitudeControl
                    amplitude={amplitude}
                    setAmplitude={setAmplitude}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    cutoff={cutoff}
                    setCutoff={setCutoff}
                    resonance={resonance}
                    setResonance={setResonance}
                    filterNode={filterNode}
                />
            </div>
            <div className="control-section">
                <ReverbControl
                    reverbLevel={reverbLevel}
                    setReverbLevel={setReverbLevel}
                    reverbDecay={reverbDecay}
                    setReverbDecay={setReverbDecay}
                />
            </div>
        </div>
    );
};