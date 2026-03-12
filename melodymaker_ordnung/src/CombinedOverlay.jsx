import React, { useEffect, useRef } from "react";
import TransparentWaveOverlay from "./TransparentWaveOverlay";
import TopShaderOverlay from "./TopShaderOverlay";

// A component that combines all overlay effects with unified enhanced glow aesthetics
const CombinedOverlay = ({ audioCtx, analyser }) => {
  const overlayRef = useRef(null);
  const pulseIntensityRef = useRef(0);

  // Add a pulsing effect synchronized with audio
  useEffect(() => {
    if (!analyser || !overlayRef.current) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrame;
    let lastAppliedBrightness = 100;
    
    const updatePulse = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average bass frequency for pulsing
      let bassSum = 0;
      // Only look at the first ~80 frequency bins (bass frequencies)
      const bassRange = Math.min(80, bufferLength);
      for (let i = 0; i < bassRange; i++) {
        bassSum += dataArray[i];
      }
      
      const bassAvg = bassSum / bassRange;
      // Normalize and add some smoothing
      const newIntensity = Math.min(1, bassAvg / 200);
      pulseIntensityRef.current =
        pulseIntensityRef.current * 0.7 + newIntensity * 0.3;

      const brightness = 100 + pulseIntensityRef.current * 20;
      if (Math.abs(brightness - lastAppliedBrightness) >= 1) {
        overlayRef.current.style.filter = `brightness(${brightness}%)`;
        lastAppliedBrightness = brightness;
      }
      
      animationFrame = requestAnimationFrame(updatePulse);
    };
    
    animationFrame = requestAnimationFrame(updatePulse);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [analyser]);
  return (
    <div 
      ref={overlayRef}
      style={{
        position: "fixed", // Changed from "absolute"
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
        filter: "brightness(100%)",
        transition: "filter 0.1s ease-out"
      }}
    >
      {/* The shader with extreme glow - fixed position */}
      <TopShaderOverlay />
      
      {/* The waveform visualization with enhanced glow - scrolls with content */}      <div style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        boxSizing: "border-box"
      }}>
        <TransparentWaveOverlay audioCtx={audioCtx} analyser={analyser} />
      </div>
    </div>
  );
};

export default CombinedOverlay;
