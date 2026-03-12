import React, { useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Component for the shader overlay
function TopShaderOverlay() {
  const canvasRef = useRef(null);
  const frameRef = useRef();
  const lastDrawTimeRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const noiseCanvasRef = useRef(null);
  const noiseImageDataRef = useRef(null);
  const noiseBufferRef = useRef(null);
  const noiseSizeRef = useRef({ width: 0, height: 0 });
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
    
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    const noiseCanvas = document.createElement("canvas");
    const noiseCtx = noiseCanvas.getContext("2d", { alpha: true, desynchronized: true });
    noiseCanvasRef.current = noiseCanvas;
    
    // Set initial canvas size
    resizeCanvas();
    
    // Add debounced event listener
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };
    
    window.addEventListener("resize", handleResize);

    // Keep the CRT layer visible without returning to the old multi-pass cost.
    const draw = (timestamp) => {
      // Limit to ~15fps for better performance
      if (timestamp - lastDrawTimeRef.current < 66) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }
      
      lastDrawTimeRef.current = timestamp;
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      const scale = window.devicePixelRatio < 2 ? 0.14 : 0.1;
      const width = Math.max(32, Math.floor(canvas.width * scale));
      const height = Math.max(24, Math.floor(canvas.height * scale));

      if (
        noiseSizeRef.current.width !== width ||
        noiseSizeRef.current.height !== height
      ) {
        noiseCanvas.width = width;
        noiseCanvas.height = height;
        noiseImageDataRef.current = noiseCtx.createImageData(width, height);
        noiseBufferRef.current = new Uint32Array(noiseImageDataRef.current.data.buffer);
        noiseSizeRef.current = { width, height };
      }

      const buffer = noiseBufferRef.current;
      const imageData = noiseImageDataRef.current;
      const variation = 70 + Math.sin(elapsedTime * 0.4) * 20;
      for (let i = 0; i < buffer.length; i++) {
        const gray = Math.floor(Math.random() * variation);
        buffer[i] = (34 << 24) | (gray << 16) | (gray << 8) | gray;
      }
      noiseCtx.putImageData(imageData, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 0.42;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(noiseCanvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

      // Low-cost scanlines
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      const scanlineHeight = Math.max(1, Math.floor(canvas.height / 180));
      for (let y = 0; y < canvas.height; y += scanlineHeight * 8) {
        ctx.fillRect(0, y, canvas.width, scanlineHeight);
      }

      // Single chromatic split pass
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.1;
      ctx.drawImage(noiseCanvas, 0, 0, width, height, -2, 0, canvas.width, canvas.height);
      ctx.drawImage(noiseCanvas, 0, 0, width, height, 2, 0, canvas.width, canvas.height);

      // Vignette
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.42;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height / 10,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.78
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.72, "rgba(0, 0, 0, 0.08)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Slow color tint drift
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.14;
      const r = Math.floor(70 + 50 * Math.sin(elapsedTime * 0.2));
      const g = Math.floor(50 + 30 * Math.cos(elapsedTime * 0.3));
      const b = Math.floor(160 + 60 * Math.sin(elapsedTime * 0.17));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      
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
        opacity: 1,
        boxShadow: "0 0 56px rgba(140, 180, 255, 0.65)",
        filter: "blur(1.9px) saturate(150%) contrast(112%) brightness(104%)",
      }}
    />,    document.body
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(TopShaderOverlay);
