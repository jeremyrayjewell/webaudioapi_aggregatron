import React from "react";

export function SynthesisScaleSection({
  waveform,
  setWaveform,
  bpm,
  setBpm,
  selectedRootNote,
  setSelectedRootNote,
  selectedScaleType,
  setSelectedScaleType,
  selectedScaleVariation,
  setSelectedScaleVariation,
  availableScaleVariations,
  selectedOctave,
  setSelectedOctave,
}) {
  return (
    <div className="row mt-3 mb-3">
      <div className="col-12">
        <div className="dos-panel">
          <h3>Synthesis & Scale <span className="blink">_</span></h3>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group dos-form-group">
                <label htmlFor="waveform">Waveform:</label>
                <select
                  id="waveform"
                  className="form-control dos-control"
                  value={waveform}
                  onChange={(e) => setWaveform(e.target.value)}
                  title="Choose a waveform type for the synthesizer. Standard waveforms (sine, square, sawtooth, triangle) are built-in. Custom waveforms provide richer sound textures."
                >
                  <option value="sine">Sine</option>
                  <option value="square">Square</option>
                  <option value="sawtooth">Sawtooth</option>
                  <option value="triangle">Triangle</option>
                  <option value="pulse">Pulse</option>
                  <option value="fatsaw">Fat Sawtooth</option>
                  <option value="organ">Organ</option>
                  <option value="fm">FM Synth</option>
                  <option value="vintage">Vintage Synth</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group dos-form-group">
                <label htmlFor="bpm">BPM:</label>
                <input
                  id="bpm"
                  type="number"
                  className="form-control dos-control"
                  min="20"
                  max="300"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group dos-form-group">
                <label htmlFor="rootNote">Root Note:</label>
                <select
                  id="rootNote"
                  className="form-control dos-control"
                  value={selectedRootNote}
                  onChange={(e) => setSelectedRootNote(e.target.value)}
                >
                  {["A", "B", "C", "D", "E", "F", "G", "Atonal"].map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group dos-form-group">
                <label htmlFor="scaleType">Scale Type:</label>
                <select
                  id="scaleType"
                  className="form-control dos-control"
                  value={selectedScaleType}
                  onChange={(e) => setSelectedScaleType(e.target.value)}
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group dos-form-group">
                <label htmlFor="scaleVariation">Scale Variation:</label>
                <select
                  id="scaleVariation"
                  className="form-control dos-control"
                  value={selectedScaleVariation}
                  onChange={(e) => setSelectedScaleVariation(e.target.value)}
                >
                  {availableScaleVariations.map((variation) => (
                    <option key={variation.value} value={variation.value}>
                      {variation.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="form-group dos-form-group">
                <label htmlFor="octave">Octave: {selectedOctave}</label>
                <input
                  id="octave"
                  type="range"
                  className="form-control-range dos-range"
                  min="-2"
                  max="2"
                  step="1"
                  value={selectedOctave}
                  onChange={(e) => setSelectedOctave(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
