import React from "react";

export function EnvelopeModulationSection(props) {
  const {
    showEnvelopeSection,
    setShowEnvelopeSection,
    attack,
    setAttack,
    decay,
    setDecay,
    sustain,
    setSustain,
    release,
    setRelease,
    showModulationSection,
    setShowModulationSection,
    modulatorOn,
    setModulatorOn,
    modulatorWaveform,
    setModulatorWaveform,
    rate,
    setRate,
    depth,
    setDepth,
    showFilterSection,
    setShowFilterSection,
    filterOn,
    setFilterOn,
    filterType,
    setFilterType,
    filterFrequency,
    setFilterFrequency,
    filterQ,
    setFilterQ,
    showVibratoSection,
    setShowVibratoSection,
    vibratoOn,
    setVibratoOn,
    vibratoRate,
    setVibratoRate,
    vibratoDepth,
    setVibratoDepth,
  } = props;

  return (
    <div className="row">
      <div className="col-12">
        <div className="dos-panel">
          <h3>Envelope & Modulation <span className="blink">_</span></h3>
          <div className="row mt-3">
            <div className="col-12">
              <div className="dos-subtitle-container">
                <h4 className="dos-subtitle">
                  ADSR Envelope
                  <span className="collapse-indicator" onClick={() => setShowEnvelopeSection(!showEnvelopeSection)} title={showEnvelopeSection ? "Collapse section" : "Expand section"}>
                    {showEnvelopeSection ? "[-]" : "[+]"}
                  </span>
                </h4>
              </div>
            </div>
          </div>
          <div className={`collapsible-section ${showEnvelopeSection ? "collapsible-section-expanded" : "collapsible-section-collapsed"}`}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group dos-form-group"><label>Attack: {attack}</label><input type="range" className="form-control-range dos-range" min="0" max="1" step="0.01" value={attack} onChange={(e) => setAttack(e.target.value)} /></div>
                <div className="form-group dos-form-group"><label>Decay: {decay}</label><input type="range" className="form-control-range dos-range" min="0" max="1" step="0.01" value={decay} onChange={(e) => setDecay(e.target.value)} /></div>
              </div>
              <div className="col-md-6">
                <div className="form-group dos-form-group"><label>Sustain: {sustain}</label><input type="range" className="form-control-range dos-range" min="0" max="1" step="0.01" value={sustain} onChange={(e) => setSustain(e.target.value)} /></div>
                <div className="form-group dos-form-group"><label>Release: {release}</label><input type="range" className="form-control-range dos-range" min="0" max="1" step="0.01" value={release} onChange={(e) => setRelease(e.target.value)} /></div>
              </div>
            </div>
          </div>
          <div className="row mt-3"><div className="col-12"><div className="dos-subtitle-container"><h4 className="dos-subtitle">Amplitude Modulation<span className="collapse-indicator" onClick={() => setShowModulationSection(!showModulationSection)} title={showModulationSection ? "Collapse section" : "Expand section"}>{showModulationSection ? "[-]" : "[+]"}</span>{modulatorOn && <span className="status-indicator">[ON]</span>}</h4></div></div></div>
          <div className={`collapsible-section ${showModulationSection ? "collapsible-section-expanded" : "collapsible-section-collapsed"}`}>
            <div className="row">
              <div className="col-md-3"><div className="form-check"><input id="modulatorCheckbox" className="form-check-input dos-checkbox" type="checkbox" checked={modulatorOn} onChange={(e) => setModulatorOn(e.target.checked)} /><label className="form-check-label" htmlFor="modulatorCheckbox">Amplitude Modulator On</label></div></div>
              <div className="col-md-3"><div className="form-group dos-form-group"><label htmlFor="modulatorWaveform">Waveform:</label><select id="modulatorWaveform" className="form-control dos-control" value={modulatorWaveform} onChange={(e) => setModulatorWaveform(e.target.value)} disabled={!modulatorOn}><option value="sine">Sine</option><option value="square">Square</option><option value="sawtooth">Sawtooth</option><option value="triangle">Triangle</option></select></div></div>
              <div className="col-md-3"><div className="form-group dos-form-group"><label htmlFor="rate">Rate:</label><input id="rate" type="number" className="form-control dos-control" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} disabled={!modulatorOn} /></div></div>
              <div className="col-md-3"><div className="form-group dos-form-group"><label htmlFor="depth">Depth:</label><input id="depth" type="number" className="form-control dos-control" step="0.1" value={depth} onChange={(e) => setDepth(e.target.value)} disabled={!modulatorOn} /></div></div>
            </div>
          </div>
          <div className="row mt-3"><div className="col-12"><div className="dos-subtitle-container"><h4 className="dos-subtitle">Filter<span className="collapse-indicator" onClick={() => setShowFilterSection(!showFilterSection)} title={showFilterSection ? "Collapse section" : "Expand section"}>{showFilterSection ? "[-]" : "[+]"}</span>{filterOn && <span className="status-indicator">[ON]</span>}</h4></div></div></div>
          <div className={`collapsible-section ${showFilterSection ? "collapsible-section-expanded" : "collapsible-section-collapsed"}`}>
            <div className="row">
              <div className="col-md-3"><div className="form-check"><input id="filterCheckbox" className="form-check-input dos-checkbox" type="checkbox" checked={filterOn} onChange={(e) => setFilterOn(e.target.checked)} /><label className="form-check-label" htmlFor="filterCheckbox">Filter On</label></div></div>
              <div className="col-md-3"><div className="form-group dos-form-group"><label htmlFor="filterType">Type:</label><select id="filterType" className="form-control dos-control" value={filterType} onChange={(e) => setFilterType(e.target.value)} disabled={!filterOn}><option value="lowpass">Low Pass</option><option value="highpass">High Pass</option><option value="bandpass">Band Pass</option><option value="notch">Notch</option><option value="allpass">All Pass</option></select></div></div>
              <div className="col-md-3"><div className="form-group dos-form-group"><label htmlFor="filterFrequency">Frequency:</label><input id="filterFrequency" type="range" className="form-control-range dos-range" min="20" max="20000" step="1" value={filterFrequency} onChange={(e) => setFilterFrequency(e.target.value)} disabled={!filterOn} /><span className="dos-value-display">{filterFrequency} Hz</span></div></div>
              <div className="col-md-3"><div className="form-group dos-form-group"><label htmlFor="filterQ">Resonance (Q):</label><input id="filterQ" type="range" className="form-control-range dos-range" min="0.1" max="20" step="0.1" value={filterQ} onChange={(e) => setFilterQ(e.target.value)} disabled={!filterOn} /><span className="dos-value-display">{filterQ}</span></div></div>
            </div>
          </div>
          <div className="row mt-3"><div className="col-12"><div className="dos-subtitle-container"><h4 className="dos-subtitle">Vibrato<span className="collapse-indicator" onClick={() => setShowVibratoSection(!showVibratoSection)} title={showVibratoSection ? "Collapse section" : "Expand section"}>{showVibratoSection ? "[-]" : "[+]"}</span>{vibratoOn && <span className="status-indicator">[ON]</span>}</h4></div></div></div>
          <div className={`collapsible-section ${showVibratoSection ? "collapsible-section-expanded" : "collapsible-section-collapsed"}`}>
            <div className="row">
              <div className="col-md-4"><div className="form-check"><input id="vibratoCheckbox" className="form-check-input dos-checkbox" type="checkbox" checked={vibratoOn} onChange={(e) => setVibratoOn(e.target.checked)} /><label className="form-check-label" htmlFor="vibratoCheckbox">Vibrato On</label></div></div>
              <div className="col-md-4"><div className="form-group dos-form-group"><label htmlFor="vibratoRate">Rate:</label><input id="vibratoRate" type="range" className="form-control-range dos-range" min="0.5" max="20" step="0.1" value={vibratoRate} onChange={(e) => setVibratoRate(e.target.value)} disabled={!vibratoOn} /><span className="dos-value-display">{vibratoRate} Hz</span></div></div>
              <div className="col-md-4"><div className="form-group dos-form-group"><label htmlFor="vibratoDepth">Depth:</label><input id="vibratoDepth" type="range" className="form-control-range dos-range" min="0.1" max="20" step="0.1" value={vibratoDepth} onChange={(e) => setVibratoDepth(e.target.value)} disabled={!vibratoOn} /><span className="dos-value-display">{vibratoDepth}</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
