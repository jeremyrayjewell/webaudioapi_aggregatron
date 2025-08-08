import React, { useRef, useEffect, useState, useCallback } from "react";

const MemoizedTransparentWaveOverlay = React.memo(function TransparentWaveOverlay({ audioCtx, analyser }) {
  const canvasRef = useRef(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const resizeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  // Create optimized resize handler with useCallback
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    
    // Set canvas size based on parent container size for better responsiveness
    const parentElement = canvasRef.current.parentElement;
    if (parentElement) {
      // Use slightly smaller dimensions to prevent edge artifacts
      // Subtract 2 pixels from width and height to avoid border issues
      canvasRef.current.width = Math.floor(parentElement.clientWidth) - 2;
      canvasRef.current.height = Math.floor(parentElement.clientHeight || window.innerHeight) - 2;
    } else {
      // Fallback to window dimensions if no parent
      canvasRef.current.width = Math.floor(window.innerWidth) - 2;
      canvasRef.current.height = Math.floor(window.innerHeight) - 2;
    }
  }, []);useEffect(() => {
    handleResize();
    
    // Use debounced resize for better performance
    const debouncedResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(handleResize, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    // Clean up event listeners and timeout on unmount
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [handleResize]);
  
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }); // Use desynchronized for better performance
    
    // Ensure dimensions are integers to prevent anti-aliasing issues at edges
    canvas.width = Math.floor(window.innerWidth);
    canvas.height = Math.floor(window.innerHeight);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw with a small inset to prevent border artifacts
    const inset = 1;
    ctx.beginPath();
    ctx.moveTo(inset, canvas.height / 2);
    ctx.lineTo(canvas.width - inset, canvas.height / 2);
    ctx.strokeStyle = "rgb(0, 255, 255)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);
  
  useEffect(() => {
    if (!audioCtx || !analyser || !canvasRef.current) return;
    
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { 
      alpha: true,
      willReadFrequently: true, 
      desynchronized: true 
    });
    
    // Use a smaller buffer size for better performance
    const bufferLength = Math.min(analyser.frequencyBinCount, 1024);
    const dataArray = new Uint8Array(bufferLength);
    
    let silenceCounter = 0;
    const SILENCE_THRESHOLD = 0.01; 
    const MAX_SILENCE_FRAMES = 10;
    
    // Use frame skipping for better performance
    let lastFrameTime = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;
    
    // Use downsample factor to process fewer data points
    const downsampleFactor = window.devicePixelRatio > 1 ? 4 : 2;
    
    // Pre-calculate the slice width to avoid recalculations in the loop
    const sliceWidth = (canvas.width * 1.0) / (bufferLength / downsampleFactor);
    
    const draw = (currentTime) => {
      animationFrameRef.current = requestAnimationFrame(draw);
      const elapsed = currentTime - lastFrameTime;

      // Skip frames for better performance
      if (elapsed < frameInterval) return;
      
      lastFrameTime = currentTime - (elapsed % frameInterval);

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get audio data
      analyser.getByteTimeDomainData(dataArray);

      // ADJUST THIS FACTOR:
      // This controls how "tall" or "stretched" the waveform is.
      // Increase it if WaveformVisualizer.jsx's waveform is taller/more stretched.
      // Decrease it if WaveformVisualizer.jsx's waveform is shorter/less stretched.
      const VERTICAL_STRETCH_FACTOR = 1.5; // Example: 50% more stretched. Tune this value.
      
      // Quick check on just a subset of the buffer for audio activity
      let hasAudioActivity = false;
      for (let i = 0; i < bufferLength; i += downsampleFactor * 2) {
        const normalizedValue = Math.abs((dataArray[i] / 128.0) - 1.0);
        if (normalizedValue > SILENCE_THRESHOLD) {
          hasAudioActivity = true;
          silenceCounter = 0;
          break;
        }
      }      if (hasAudioActivity) {
        setIsAudioActive(true);
        
        // Set clipping path to prevent drawing outside the canvas
        ctx.save();
        
        // Create a clipping region with padding from the edges
        const padding = 3; // Add padding around the edges
        ctx.beginPath();
        ctx.rect(padding, padding, canvas.width - padding*2, canvas.height - padding*2);
        ctx.clip();
          
        // Set drawing styles once outside the loop
        ctx.lineWidth = 4; 
        ctx.strokeStyle = "rgb(255, 255, 0)"; 
        ctx.shadowBlur = 15; // Increased shadow blur for more pronounced glow
        ctx.shadowColor = "rgba(255, 255, 100, 1.0)"; // Brighter, more intense glow
        
        ctx.beginPath();
        
        // Use downsampling for better performance, start with padding offset
        let x = padding;
        const drawWidth = canvas.width - padding*2;
        const adjustedSliceWidth = (drawWidth * 1.0) / (bufferLength / downsampleFactor);
        
        for (let i = 0; i < bufferLength; i += downsampleFactor) {
          // Normalize audio data: dataArray[i] is 0-255. 128 is silence.
          // normalizedAmplitude will be -1.0 (for data 0) to ~+1.0 (for data 255).
          const normalizedAmplitude = (dataArray[i] / 128.0) - 1.0;
          
          // ADJUST BASELINE HERE IF WaveformVisualizer.jsx ISN'T CENTERED:
          // If WaveformVisualizer.jsx's baseline isn't at its vertical center,
          // change `canvas.height / 2` to match its relative baseline.
          // For example, if WaveformVisualizer.jsx draws from the bottom, baselineY might be `canvas.height`.
          // Or if it's 3/4 down, it might be `canvas.height * 0.75`.
          const baselineY = canvas.height / 2; 
          
          // Calculate y position:
          // 1. Start from the baselineY.
          // 2. Add the scaled and stretched amplitude.
          //    (canvas.height / 2) is used here as the scaling reference for a full-height wave before stretch.
          //    If WaveformVisualizer.jsx uses a different reference height for its amplitude scaling,
          //    this part might also need adjustment, but VERTICAL_STRETCH_FACTOR is the primary control.
          const y = baselineY + (normalizedAmplitude * VERTICAL_STRETCH_FACTOR * (canvas.height / 2));

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += adjustedSliceWidth;
          
          // Stop if we exceed the drawable area
          if (x > canvas.width - padding) break;
        }
        
        // Stop the path before reaching the edge
        ctx.lineTo(Math.min(x, canvas.width - padding), canvas.height / 2);
        ctx.stroke();
        ctx.restore();
      } else {
        silenceCounter++;
        if (silenceCounter > MAX_SILENCE_FRAMES) {
          setIsAudioActive(false);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioCtx, analyser]);  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", 
        top: 0,
        left: 0,
        width: "100%", 
        height: "100%", 
        minHeight: "100vh",
        zIndex: 99, 
        pointerEvents: "none", 
        backgroundColor: "transparent", 
        mixBlendMode: "lighten", 
        opacity: isAudioActive ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
        outline: "none",
        border: "none",
        boxSizing: "border-box",
        padding: 0,
        margin: 0,
        overflow: "hidden",
        WebkitBackfaceVisibility: "hidden", // Helps with browser rendering artifacts
        backfaceVisibility: "hidden"
      }}
    />
  );
});

export default MemoizedTransparentWaveOverlay;
