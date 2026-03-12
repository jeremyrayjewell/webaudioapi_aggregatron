import React, { useEffect, useMemo, useRef } from 'react';

// Create the component
const AnimatedAsciiArt = ({ asciiLines }) => {
  const charRefs = useRef([]);
  
  // Pre-calculate line length once for better performance
  const lineLengths = useMemo(() => 
    asciiLines.map(line => line.length),
    [asciiLines]
  );
  
  useEffect(() => {
    const amplitude = 0.7;  // Reduced amplitude to prevent overlap
    const speed = 0.0007;   // Slightly slower animation
    const wavelength = 20; 
    
    let animationFrameId;
    let startTime = Date.now();
    let lastFrameTime = 0;
    const frameInterval = 1000 / 24;
    
    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);
      if (timestamp - lastFrameTime < frameInterval) {
        return;
      }

      lastFrameTime = timestamp;
      const elapsed = Date.now() - startTime;

      for (let i = 0; i < asciiLines.length; i++) {
        for (let j = 0; j < lineLengths[i]; j++) {
          const element = charRefs.current[i]?.[j];
          if (!element) continue;
          const phase = (j / wavelength) - (elapsed * speed);
          const offset = Math.sin(phase * 2 * Math.PI) * amplitude;
          element.style.transform = offset === 0 ? "translateY(0px)" : `translateY(${offset}px)`;
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [asciiLines, lineLengths]);    return (
    <div className="animated-ascii-container" style={{ 
      fontFamily: "'Px437_IBM_EGA8', 'DOS', monospace",
      background: "transparent",  // Transparent background      color: "#cccccc", // Brighter text color
      padding: "0",
      whiteSpace: "pre",
      overflow: "visible",
      lineHeight: "1",
      fontSize: "10px", // Fixed exact pixel size
      textAlign: "center",
      width: "100%",
      margin: "0 auto",
      transform: "none", // Prevent transforms from affecting the container
      textShadow: "0 0 8px rgba(180, 210, 255, 0.7)", // Add text glow
      filter: "brightness(110%)" // Slightly increase brightness
    }}>      {asciiLines.map((line, lineIndex) => (
        <div key={lineIndex} className="ascii-line" style={{ 
          marginBottom: "0", 
          height: "10px", 
          lineHeight: "10px",
          fontSize: "10px"
        }}>
          {line.split('').map((char, charIndex) => {
              return (              <span
                key={charIndex}
                ref={(element) => {
                  if (!charRefs.current[lineIndex]) {
                    charRefs.current[lineIndex] = [];
                  }
                  charRefs.current[lineIndex][charIndex] = element;
                }}
                style={{                  display: 'inline-block',
                  transform: 'translateY(0px)',
                  background: "transparent", // Ensure each character has transparent background
                  fontSize: "10px", // Fixed exact size
                  lineHeight: "1",
                  fontFamily: "inherit",
                  width: "auto",
                  height: "auto",
                  textShadow: char.trim() !== '' ? "0 0 5px rgba(170, 200, 255, 0.6)" : "none" // Individual character glow
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      ))}
    </div>  );
};

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(AnimatedAsciiArt);
