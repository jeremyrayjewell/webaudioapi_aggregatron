import React, { useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Component for the shader overlay
function TopShaderOverlay() {
  const canvasRef = useRef(null);
  const frameRef = useRef();
  const lastDrawTimeRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  // Use debounced resize handler for better performance
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // Add some extra width and height to cover the entire screen including edges
    canvas.width = window.innerWidth + 20;
    canvas.height = window.innerHeight + 20;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    
    // Set initial canvas size
    resizeCanvas();
    
    // Add debounced event listener
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };
    
    window.addEventListener("resize", handleResize);

    // More efficient shader effect with FPS limiting to 30fps
    const draw = (timestamp) => {
      // Limit to ~30fps for better performance
      if (timestamp - lastDrawTimeRef.current < 33) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }
      
      lastDrawTimeRef.current = timestamp;
        // First clear the entire canvas to ensure no empty areas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Use a smaller resolution for the noise effect
      const scale = window.devicePixelRatio < 2 ? 0.25 : 0.15; // Smaller scale for high DPI displays
      const width = Math.floor(canvas.width * scale);
      const height = Math.floor(canvas.height * scale);
      
      const imageData = ctx.createImageData(width, height);
      const buffer = new Uint32Array(imageData.data.buffer);      // Ensure we fill the entire buffer with noise
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      for (let i = 0; i < buffer.length; i++) {
        // Create some time-based variation for more dynamic effect
        const variation = Math.sin(elapsedTime * 0.5) * 20; // Higher amplitude variation
        const gray = Math.floor(Math.random() * (100 + variation)); // Higher intensity noise
        buffer[i] = (30 << 24) | (gray << 16) | (gray << 8) | gray; // Less transparent
      }      // Draw the smaller image and scale it up
      ctx.putImageData(imageData, 0, 0);
      ctx.globalAlpha = 0.6; // Increased opacity for more pronounced effect
      ctx.imageSmoothingEnabled = false; // Pixelated scaling for retro effect
      
      // Create a temporary canvas to avoid drawing from and to the same canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
      
      // Clear before redrawing to ensure full coverage
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the scaled up version to fill the entire canvas
      ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);      // Add CRT scanlines effect - ultra subtle, almost imperceptible
      const scanlineHeight = Math.max(1, Math.floor(canvas.height / 150)); // Even thinner scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'; // Extremely low opacity scanlines
      for (let y = 0; y < canvas.height; y += scanlineHeight * 6) { // Much more spacing between scanlines
        ctx.fillRect(0, y, canvas.width, scanlineHeight);
      }// Add RGB subpixel effect (extreme color separation)
      ctx.globalAlpha = 0.25; // Dramatically increased color separation
      ctx.globalCompositeOperation = 'screen';
      
      // Red channel offset - extreme
      ctx.fillStyle = 'rgb(255,50,50)'; // More saturated red
      ctx.drawImage(canvas, -5, 0); // Extreme offset
      
      // Blue channel offset - extreme
      ctx.fillStyle = 'rgb(50,50,255)'; // More saturated blue
      ctx.drawImage(canvas, 5, 0); // Extreme offset
      
      // Add green offset for extremely pronounced chromatic aberration
      ctx.fillStyle = 'rgb(50,255,50)'; // More saturated green
      ctx.drawImage(canvas, 0, 3);
      
      ctx.globalAlpha = 0.6; // Higher opacity after effects
      ctx.globalCompositeOperation = 'source-over';
        // Add more pronounced vignette (CRT screen edge darkening)
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height / 12, // Smaller inner radius
        canvas.width / 2, canvas.height / 2, canvas.height * 0.8 // Smaller outer radius
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)'); // Added middle stop
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)'); // Darker edges
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, canvas.width, canvas.height);      // Add subtle TV flicker effect - reduced for less flickering
      const flickerIntensity = Math.random() * 0.06; // Reduced flicker
      ctx.fillStyle = `rgba(255, 255, 255, ${flickerIntensity})`;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(0, 0, canvas.width, canvas.height);      // Add retro color bleed effect - extremely pronounced blooming where bright meets dark
      const bloomIntensity = 0.35 + Math.sin(elapsedTime * 0.3) * 0.1; // Maximal pulsing bloom effect
      ctx.globalCompositeOperation = 'lighten';
      ctx.globalAlpha = bloomIntensity;
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        // Add a second pass of bloom with slight offset for more intense glow
      ctx.globalAlpha = bloomIntensity * 0.7;
      ctx.drawImage(canvas, 1, 1, canvas.width, canvas.height);
        // Add a third pass of bloom with larger offset for even more glow
      ctx.globalAlpha = bloomIntensity * 0.5;
      ctx.drawImage(canvas, 2, 2, canvas.width, canvas.height);
        // Add a fourth pass of bloom with even larger offset for maximum glow
      ctx.globalAlpha = bloomIntensity * 0.35;
      ctx.drawImage(canvas, 3, 3, canvas.width, canvas.height);
        // Add a fifth pass of bloom with maximum offset for ultimate glow
      ctx.globalAlpha = bloomIntensity * 0.25;
      ctx.drawImage(canvas, 4, 4, canvas.width, canvas.height);
      
      // Add a slight color shift that moves with time for a more dynamic retro effect
      const colorIntensity = 0.12 + Math.sin(elapsedTime * 0.2) * 0.05;
      const colorPhase = (Math.sin(elapsedTime * 0.1) + 1) * 0.5; // Value between 0 and 1
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = colorIntensity;
        // Create more saturated color tint that shifts over time (from blue-ish to magenta-ish)
      const r = Math.floor(70 + 50 * Math.sin(elapsedTime * 0.2));
      const g = Math.floor(50 + 30 * Math.cos(elapsedTime * 0.3));
      const b = Math.floor(160 + 60 * Math.sin(elapsedTime * 0.17));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'source-over';
      
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      clearTimeout(resizeTimeout);
    };
  }, []);
  return createPortal(
    <canvas
      ref={canvasRef}      style={{
        position: "fixed",
        top: -10,
        left: -10, // Move slightly left to cover the left edge
        width: "calc(100% + 20px)", // Add extra width to cover the edges
        height: "calc(100% + 20px)", // Add extra height to cover the edges
        zIndex: 10000, // higher than TransparentWaveOverlay
        pointerEvents: "none",
        mixBlendMode: "screen",
        backgroundColor: "transparent",
        opacity: 1,        boxShadow: "0 0 100px rgba(140, 180, 255, 1.0)", // Ultimate blue glow
        filter: "blur(3.0px) saturate(200%) contrast(115%) brightness(105%)", // Maximum blur, saturation and contrast
      }}
    />,    document.body
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(TopShaderOverlay);
