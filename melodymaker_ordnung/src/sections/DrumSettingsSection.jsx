import React from "react";
import { DRUM_TYPES } from "../drums.js";

export function DrumSettingsSection({
  showDrumGain,
  setShowDrumGain,
  drumVariation,
  setDrumVariation,
  drumGains,
  updateDrumGain,
}) {
  return (
    <div className="row">
      <div className="col-12">
        <div className="dos-panel">
          <h3>Drum Settings <span className="blink">_</span></h3>
          <div className="row">
            <div className="col-md-6">
              <button className="btn dos-btn mb-2" onClick={() => setShowDrumGain(!showDrumGain)}>{showDrumGain ? "Hide Drum Gains" : "Show Drum Gains"}</button>
              <div className="form-group dos-form-group">
                <label htmlFor="drumVariation">Drum Pattern:</label>
                <select id="drumVariation" className="form-control dos-control" value={drumVariation} onChange={(e) => setDrumVariation(e.target.value)}>
                  <optgroup label="Simple"><option value="simple1">Simple 1</option><option value="simple2">Simple 2</option><option value="simple3">Simple 3</option><option value="simple4">Simple 4</option></optgroup>
                  <optgroup label="Rock"><option value="rock1">Rock 1</option><option value="rock2">Rock 2</option><option value="rock3">Rock 3</option><option value="rock4">Rock 4</option></optgroup>
                  <optgroup label="Funk"><option value="funk1">Funk 1</option><option value="funk2">Funk 2</option><option value="funk3">Funk 3</option><option value="funk4">Funk 4</option></optgroup>
                  <optgroup label="Jazz"><option value="jazz1">Jazz 1</option><option value="jazz2">Jazz 2</option><option value="jazz3">Jazz 3</option><option value="jazz4">Jazz 4</option></optgroup>
                  <optgroup label="Electronic"><option value="electronic1">Electronic 1</option><option value="electronic2">Electronic 2</option><option value="electronic3">Electronic 3</option><option value="electronic4">Electronic 4</option></optgroup>
                  <optgroup label="Latin"><option value="latin1">Latin 1</option><option value="latin2">Latin 2</option><option value="latin3">Latin 3</option><option value="latin4">Latin 4</option></optgroup>
                  <optgroup label="Hip Hop"><option value="hiphop1">Hip Hop 1</option><option value="hiphop2">Hip Hop 2</option><option value="hiphop3">Hip Hop 3</option><option value="hiphop4">Hip Hop 4</option></optgroup>
                  <optgroup label="Minimal"><option value="minimal1">Minimal 1</option><option value="minimal2">Minimal 2</option><option value="minimal3">Minimal 3</option><option value="minimal4">Minimal 4</option></optgroup>
                  <optgroup label="Techno"><option value="techno1">Techno 1</option><option value="techno2">Techno 2</option><option value="techno3">Techno 3</option><option value="techno4">Techno 4</option></optgroup>
                  <optgroup label="Dubstep"><option value="dubstep1">Dubstep 1</option><option value="dubstep2">Dubstep 2</option><option value="dubstep3">Dubstep 3</option><option value="dubstep4">Dubstep 4</option></optgroup>
                  <optgroup label="Trap"><option value="trap1">Trap 1</option><option value="trap2">Trap 2</option><option value="trap3">Trap 3</option><option value="trap4">Trap 4</option></optgroup>
                  <optgroup label="Reggae"><option value="reggae1">Reggae 1</option><option value="reggae2">Reggae 2</option><option value="reggae3">Reggae 3</option><option value="reggae4">Reggae 4</option></optgroup>
                  <optgroup label="House"><option value="house1">House 1</option><option value="house2">House 2</option><option value="house3">House 3</option><option value="house4">House 4</option></optgroup>
                  <optgroup label="Ambient"><option value="ambient1">Ambient 1</option><option value="ambient2">Ambient 2</option><option value="ambient3">Ambient 3</option><option value="ambient4">Ambient 4</option></optgroup>
                  <optgroup label="Waltz"><option value="waltz1">Waltz 1 (3/4)</option><option value="waltz2">Waltz 2 (3/4)</option><option value="waltz3">Waltz 3 (3/4)</option><option value="waltz4">Waltz 4 (3/4)</option></optgroup>
                  <optgroup label="Breakbeat"><option value="breakbeat1">Breakbeat 1</option><option value="breakbeat2">Breakbeat 2</option><option value="breakbeat3">Breakbeat 3</option><option value="breakbeat4">Breakbeat 4</option></optgroup>
                  <optgroup label="Other"><option value="drumless">No Drums</option></optgroup>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              {showDrumGain && (
                <div className="dos-drum-gain">
                  <h4>Drum Gains <span className="blink">_</span></h4>
                  {DRUM_TYPES.map((drumType) => (
                    <div key={drumType} className="form-group dos-form-group mb-1">
                      <label>{drumType}: {drumGains[drumType].toFixed(2)}</label>
                      <input type="range" className="form-control-range dos-range" min="0" max="10" step="0.01" value={drumGains[drumType]} onChange={(e) => updateDrumGain(drumType, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
