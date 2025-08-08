import React, { useRef, useEffect, useState, useCallback } from "react";
import bgImage from './bg.png'; 

function WaveformVisualizer({ audioCtx, analyser }) {
  const backgroundCanvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const resizeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Preload and cache the background image
  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.decoding = 'async'; // Use async decoding for better performance
    img.onload = () => {
      setBackgroundImage(img);
    };
  }, []);
  
  // Debounced resize handler for better performance
  const handleResize = useCallback(() => {
    if (!backgroundCanvasRef.current) return;
    
    // Set canvas size based on parent container size for better responsiveness
    const parentElement = backgroundCanvasRef.current.parentElement;
    if (parentElement) {
      const { clientWidth, clientHeight } = parentElement;
      backgroundCanvasRef.current.width = clientWidth;
      backgroundCanvasRef.current.height = clientHeight || window.innerHeight;
    } else {
      // Fallback to window dimensions if no parent
      backgroundCanvasRef.current.width = window.innerWidth;
      backgroundCanvasRef.current.height = window.innerHeight;
    }
  }, []);
  
  useEffect(() => {
    handleResize();
    
    // Use debounced resize for better performance
    const debouncedResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [handleResize]);

  useEffect(() => {
    if (!audioCtx || !analyser || !backgroundCanvasRef.current) return;

    const canvas = backgroundCanvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false }); // Disable alpha for better performance
    
    // For better performance, use smaller buffer when possible
    const bufferLength = Math.min(analyser.frequencyBinCount, 1024); // Limit to 1024 points
    const dataArray = new Uint8Array(bufferLength);
    
    // Cache for calculated dimensions to avoid layout thrashing
    const dimensionsCache = {
      width: 0,
      height: 0,
      drawWidth: 0,
      drawHeight: 0,
      offsetX: 0,
      offsetY: 0,
    };
    
    // Animation frame tracking
    let lastFrameTime = 0;
    const fps = 30; // Limit to 30fps
    const frameInterval = 1000 / fps;

    const draw = (currentTime) => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const elapsed = currentTime - lastFrameTime;
      
      // Skip frames for performance improvement
      if (elapsed < frameInterval) return;
        
      lastFrameTime = currentTime - (elapsed % frameInterval);
      
      // Only re-calculate dimensions if canvas size changed
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      if (canvasWidth !== dimensionsCache.width || canvasHeight !== dimensionsCache.height) {
        dimensionsCache.width = canvasWidth;
        dimensionsCache.height = canvasHeight;
        
        // Pre-calculate image dimensions if we have a background image
        if (backgroundImage) {
          const imgWidth = backgroundImage.width;
          const imgHeight = backgroundImage.height;
          const canvasRatio = canvasWidth / canvasHeight;
          const imgRatio = imgWidth / imgHeight;
          
          if (canvasRatio > imgRatio) {
            dimensionsCache.drawWidth = canvasWidth;
            dimensionsCache.drawHeight = canvasWidth / imgRatio;
            dimensionsCache.offsetX = 0;
            dimensionsCache.offsetY = (canvasHeight - dimensionsCache.drawHeight) / 2;
          } else {
            dimensionsCache.drawHeight = canvasHeight;
            dimensionsCache.drawWidth = canvasHeight * imgRatio;
            dimensionsCache.offsetX = (canvasWidth - dimensionsCache.drawWidth) / 2;
            dimensionsCache.offsetY = 0;
          }
        }
      }
      
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (backgroundImage) {
        const { drawWidth, drawHeight, offsetX, offsetY } = dimensionsCache;
        
        // Draw background image at full opacity
        ctx.globalAlpha = 1.0;
        ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // Fallback to black background if image is not loaded
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }      // Draw multiple copies with different blurs for extreme bloom effect
      
      // First draw a very blurry background copy for maximum glow
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(30, 255, 30, 0.4)";
      ctx.shadowColor = "rgba(0, 255, 0, 0.8)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }
        ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Now draw a sharper, more defined line on top
      ctx.beginPath();
      x = 0;
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(200, 255, 200, 1.0)"; // Bright white-green for the main line
      ctx.shadowColor = "rgba(50, 255, 100, 1.0)";
      ctx.shadowBlur = 10;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Reset shadow effect to avoid affecting other drawings
      ctx.shadowBlur = 0;
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioCtx, analyser, backgroundImage]);

  return (
    <canvas
      ref={backgroundCanvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
        maxWidth: "100vw",
        maxHeight: "100vh",
        margin: 0,
        padding: 0,
        objectFit: "cover"
      }}
    />
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(WaveformVisualizer);
