import { useAudioEngine } from "../audio/AudioContextProvider";
import OscillatorControl from "./OscillatorControl";

export default function OscillatorPanel() {
  const { oscillators, addOscillator, updateOscillator, removeOscillator, ensureAudioGraph } =
    useAudioEngine();

  const handleAdd = async () => {
    await ensureAudioGraph();
    await addOscillator();
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Oscillators</h2>
          <p>Layer independent voices that all remain locked to the active key and scale.</p>
        </div>
        <button type="button" onClick={handleAdd}>
          Add Oscillator
        </button>
      </div>

      <div className="oscillator-list">
        {oscillators.map((oscillator, index) => (
          <OscillatorControl
            key={oscillator.id}
            oscillator={oscillator}
            index={index}
            onChange={(updates) => updateOscillator(oscillator.id, updates)}
            onRemove={() => removeOscillator(oscillator.id)}
          />
        ))}
      </div>
    </section>
  );
}
