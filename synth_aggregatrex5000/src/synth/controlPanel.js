import React, { useState, useEffect, useContext } from 'react';
import { OscillatorSwitcher } from './oscillatorSwitcher';
import { ADSRControl } from './ADSRControl';
import { LFOControl } from './LFOControl';
import WaveformVisualizer from './WaveformVisualizer';
import { AmplitudeControl } from './AmplitudeControl';
import { ReverbControl } from './ReverbControl';
import { AudioContextContext } from '../contexts/AudioContextProvider';
import { DistortionControl } from './DistortionControl';
import { CompressorControl } from './CompressorControl';
import { applyDistortionCurve } from './distortionCurve';
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

    // Distortion state
    const [drive, setDrive] = useState(0.3); // 0..1
    const [distMix, setDistMix] = useState(0.5); // 0..1

    // Compressor state
    const [compThreshold, setCompThreshold] = useState(-24); // dB
    const [compRatio, setCompRatio] = useState(4); // :1

    useEffect(() => {
        configureFilter(filterNode, filterType, cutoff, resonance);
    }, [filterNode, filterType, cutoff, resonance]);

    // Consolidated reverb gain mapping
    useEffect(() => {
        if (!nodes?.reverbGain) return;
        const ctxTime = nodes.reverbGain.context.currentTime;
        const scale = Math.min(3, Math.max(0.2, Math.log10(reverbDecay + 1) + 0.2));
        const finalGain = reverbLevel * scale;
        nodes.reverbGain.gain.setValueAtTime(finalGain, ctxTime);
        console.log('[reverb] level', reverbLevel.toFixed(2), 'decay', reverbDecay.toFixed(2), 'scale', scale.toFixed(2), 'final', finalGain.toFixed(2));
    }, [reverbLevel, reverbDecay, nodes]);

    // Distortion parameter mapping
    useEffect(() => {
        if (!nodes?.waveshaper || !nodes?.preGain || !nodes?.distortionWet || !nodes?.distortionDry) return;
        // Update drive curve
        applyDistortionCurve(nodes.waveshaper, drive);
        // PreGain scales into shaper for extra intensity (1..10 roughly)
        const intensity = 1 + drive * 9;
        nodes.preGain.gain.setValueAtTime(intensity, nodes.preGain.context.currentTime);
        // Mix: wet/dry gains normalized so combined ~1
        nodes.distortionWet.gain.setValueAtTime(distMix, nodes.distortionWet.context.currentTime);
        nodes.distortionDry.gain.setValueAtTime(1 - distMix, nodes.distortionDry.context.currentTime);
        console.log('[distortion] drive', drive.toFixed(2), 'mix', distMix.toFixed(2));
    }, [drive, distMix, nodes]);

    // Compressor parameter mapping
    useEffect(() => {
        if (!nodes?.compressor) return;
        try {
            nodes.compressor.threshold.setValueAtTime(compThreshold, nodes.compressor.context.currentTime);
            nodes.compressor.ratio.setValueAtTime(compRatio, nodes.compressor.context.currentTime);
            console.log('[compressor] threshold', compThreshold, 'ratio', compRatio);
        } catch (e) {
            console.warn('Setting compressor params failed', e);
        }
    }, [compThreshold, compRatio, nodes]);

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
                <DistortionControl
                    drive={drive}
                    setDrive={setDrive}
                    mix={distMix}
                    setMix={setDistMix}
                />
                <CompressorControl
                    threshold={compThreshold}
                    setThreshold={setCompThreshold}
                    ratio={compRatio}
                    setRatio={setCompRatio}
                />
            </div>
        </div>
    );
};