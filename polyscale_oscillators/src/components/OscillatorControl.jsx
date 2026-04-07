import LFO from "./LFO";

const WAVEFORMS = ["sine", "square", "sawtooth", "triangle"];
const DEGREES = ["1", "2", "3", "4", "5", "6", "7"];

export default function OscillatorControl({ oscillator, index, onChange, onRemove }) {
  return (
    <article className="oscillator-card">
      <div className="card-header">
        <h3>Oscillator {index + 1}</h3>
        <button type="button" className="danger" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="control-grid">
        <label>
          <span>Waveform</span>
          <select
            value={oscillator.waveform}
            onChange={(event) => onChange({ waveform: event.target.value })}
          >
            {WAVEFORMS.map((waveform) => (
              <option key={waveform} value={waveform}>
                {waveform}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Degree</span>
          <select
            value={oscillator.degree}
            onChange={(event) => onChange({ degree: event.target.value })}
          >
            {DEGREES.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Octave</span>
          <input
            type="number"
            min="-2"
            max="3"
            value={oscillator.octaveOffset}
            onChange={(event) => onChange({ octaveOffset: Number(event.target.value) })}
          />
        </label>

        <label>
          <span>Detune</span>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={oscillator.detune}
            onChange={(event) => onChange({ detune: Number(event.target.value) })}
          />
          <strong>{oscillator.detune} cents</strong>
        </label>

        <label>
          <span>Gain</span>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={oscillator.gain}
            onChange={(event) => onChange({ gain: Number(event.target.value) })}
          />
          <strong>{oscillator.gain.toFixed(2)}</strong>
        </label>

        <label className="toggle-row">
          <span>Enabled</span>
          <input
            type="checkbox"
            checked={oscillator.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
          />
        </label>

        <label className="toggle-row">
          <span>Filter</span>
          <input
            type="checkbox"
            checked={oscillator.filterEnabled}
            onChange={(event) => onChange({ filterEnabled: event.target.checked })}
          />
        </label>

        <label>
          <span>Filter Hz</span>
          <input
            type="range"
            min="100"
            max="8000"
            step="10"
            value={oscillator.filterFrequency}
            onChange={(event) => onChange({ filterFrequency: Number(event.target.value) })}
          />
          <strong>{oscillator.filterFrequency} Hz</strong>
        </label>

        <label>
          <span>Filter Q</span>
          <input
            type="range"
            min="0.1"
            max="12"
            step="0.1"
            value={oscillator.filterQ}
            onChange={(event) => onChange({ filterQ: Number(event.target.value) })}
          />
          <strong>{oscillator.filterQ.toFixed(1)}</strong>
        </label>
      </div>

      <LFO value={oscillator.lfo} onChange={(lfo) => onChange({ lfo })} />
    </article>
  );
}
