const DIVISIONS = ["1/1", "1/2", "1/4", "1/8", "1/16", "triplet"];
const TARGETS = ["detune", "gain", "filter frequency"];

export default function LFO({ value, onChange }) {
  return (
    <div className="lfo-panel">
      <label className="toggle-row">
        <span>LFO</span>
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(event) => onChange({ enabled: event.target.checked })}
        />
      </label>

      <label>
        <span>Target</span>
        <select
          value={value.target}
          onChange={(event) => onChange({ target: event.target.value })}
          disabled={!value.enabled}
        >
          {TARGETS.map((target) => (
            <option key={target} value={target}>
              {target}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Division</span>
        <select
          value={value.division}
          onChange={(event) => onChange({ division: event.target.value })}
          disabled={!value.enabled}
        >
          {DIVISIONS.map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Depth</span>
        <input
          type="range"
          min="0"
          max={value.target === "gain" ? "0.25" : "1200"}
          step={value.target === "gain" ? "0.01" : "1"}
          value={value.depth}
          onChange={(event) => onChange({ depth: Number(event.target.value) })}
          disabled={!value.enabled}
        />
        <strong>{value.depth}</strong>
      </label>
    </div>
  );
}
