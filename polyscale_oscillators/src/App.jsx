import { useAudioEngine } from "./audio/AudioContextProvider";
import OscillatorPanel from "./components/OscillatorPanel";
import Sequencer from "./components/Sequencer";

export default function App() {
  const {
    audioReady,
    bpm,
    masterGainLevel,
    secondsPerBeat,
    key,
    keys,
    scale,
    scales,
    isSequencerRunning,
    ensureAudioGraph,
    setMasterGainLevel,
    setBpm,
    setKey,
    setScale,
    startSequencer,
    stopAllAudio,
    stopSequencer,
  } = useAudioEngine();

  const handleTransportToggle = async () => {
    await ensureAudioGraph();

    if (isSequencerRunning) {
      stopSequencer();
      return;
    }

    await startSequencer();
  };

  return (
    <main className="app-shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">PolyScale</p>
          <h1>Multi-oscillator harmonic engine</h1>
          <p className="intro">
            A browser synth focused on harmonic layering. Every oscillator is independent, but all
            pitch and modulation stay locked to the same scale and BPM grid.
          </p>
        </div>

        <div className="transport">
          <div className="transport-buttons">
            <button type="button" onClick={handleTransportToggle}>
              {isSequencerRunning ? "Stop Sequencer" : "Start Sequencer"}
            </button>
            <button type="button" className="danger" onClick={stopAllAudio}>
              Stop All
            </button>
          </div>
          <label className="master-gain-control">
            <span>Master Gain</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterGainLevel}
              onChange={(event) => setMasterGainLevel(Number(event.target.value))}
            />
            <strong>{masterGainLevel.toFixed(2)}</strong>
          </label>
          <span className={`status-pill ${audioReady ? "ready" : ""}`}>
            {audioReady ? "Audio Ready" : "Click Start to unlock audio"}
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Global Controls</h2>
            <p>Tempo and scale settings define the harmonic space for the entire engine.</p>
          </div>
        </div>

        <div className="global-grid">
          <label>
            <span>BPM</span>
            <input
              type="number"
              min="30"
              max="240"
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
            />
          </label>

          <label>
            <span>Key</span>
            <select value={key} onChange={(event) => setKey(event.target.value)}>
              {keys.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Scale</span>
            <select value={scale} onChange={(event) => setScale(event.target.value)}>
              {scales.map((scaleName) => (
                <option key={scaleName} value={scaleName}>
                  {scaleName}
                </option>
              ))}
            </select>
          </label>

          <div className="info-card">
            <span>Seconds / beat</span>
            <strong>{secondsPerBeat.toFixed(3)}s</strong>
          </div>
        </div>
      </section>

      <OscillatorPanel />
      <Sequencer />
    </main>
  );
}
