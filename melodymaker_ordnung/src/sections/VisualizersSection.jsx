import React from "react";

export function VisualizersSection({
  audioCanvasRef,
  pseudocodePanelRef,
  verificationPanelText,
  sourcePanelRef,
  algorithmPanelRef,
  drumCanvasRef,
}) {
  return (
    <div className="row mt-3">
      <div className="col-12">
        <div className="dos-panel">
          <h3>Visualizers <span className="blink">_</span></h3>
          <div className="visualizer-grid">
            <div className="visualizer-cell visualizer-cell-frequency visualizer-cell-top"><div className="dos-canvas-container visualizer-panel audio-container visualizer-panel-frequency"><h4>Hz</h4><div className="visualizer-canvas-shell"><canvas ref={audioCanvasRef} className="dos-canvas visualizer-canvas audio-canvas" id="audioVisualization" data-always-visible="true" style={{ maxWidth: "100%" }} /></div></div></div>
            <div className="visualizer-cell visualizer-cell-top"><div className="dos-canvas-container visualizer-panel"><h4>Algorithm Pseudocode</h4><div ref={pseudocodePanelRef} className="visualizer-text-panel visualizer-text-panel-large terminal-like-display" /></div></div>
            <div className="visualizer-cell visualizer-cell-top"><div className="dos-canvas-container visualizer-panel"><h4>Implementation Source</h4><pre className="visualizer-text-panel terminal-like-display mb-2">{verificationPanelText}</pre><div ref={sourcePanelRef} className="visualizer-text-panel visualizer-text-panel-large terminal-like-display" /></div></div>
            <div className="visualizer-cell visualizer-cell-trace visualizer-cell-top"><div className="dos-canvas-container visualizer-panel"><h4>Execution Trace</h4><div ref={algorithmPanelRef} className="visualizer-text-panel visualizer-text-panel-large terminal-like-display" /></div></div>
            <div className="visualizer-cell visualizer-cell-full"><div className="dos-canvas-container visualizer-panel"><h4>Drum Pattern</h4><canvas ref={drumCanvasRef} className="dos-canvas visualizer-canvas drum-canvas" style={{ maxWidth: "100%" }} /></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
