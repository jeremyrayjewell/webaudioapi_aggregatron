import { useAudioEngine } from "../audio/AudioContextProvider";

const DEGREES = ["1", "2", "3", "4", "5", "6", "7"];

export default function Sequencer() {
  const { steps, updateStep, currentStepIndex, isSequencerRunning } = useAudioEngine();

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Sequencer</h2>
          <p>
            Each step provides a scale degree transpose. All oscillators move together, so chord
            spacing stays intact while the progression changes.
          </p>
        </div>
      </div>

      <div className="step-grid">
        {steps.map((step, index) => {
          const isCurrent = isSequencerRunning && currentStepIndex === index;

          return (
            <div
              key={step.id}
              className={`step-cell ${step.active ? "active" : ""} ${isCurrent ? "current" : ""}`}
            >
              <button
                type="button"
                className="step-toggle"
                onClick={() => updateStep(index, { active: !step.active })}
              >
                {step.active ? "On" : "Off"}
              </button>

              <select
                value={step.degree}
                onChange={(event) => updateStep(index, { degree: event.target.value })}
              >
                {DEGREES.map((degree) => (
                  <option key={`${step.id}-${degree}`} value={degree}>
                    Degree {degree}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </section>
  );
}
