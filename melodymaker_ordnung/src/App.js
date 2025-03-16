import React, { useState, useEffect } from "react";
import MusicalBigO from "./MusicalBigO";
import WaveformVisualizer from "./WaveformVisualizer";

function App() {
  const [audioCtx, setAudioCtx] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 2048;
    setAudioCtx(ctx);
    setAnalyser(analyserNode);
  }, []);

  return (
    <div className="App">
      {audioCtx && analyser && (
        <WaveformVisualizer audioCtx={audioCtx} analyser={analyser} />
      )}
      <MusicalBigO audioCtx={audioCtx} analyser={analyser} />
    </div>
  );
}

export default App;