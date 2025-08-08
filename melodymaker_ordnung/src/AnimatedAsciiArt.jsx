import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Create the component
const AnimatedAsciiArt = ({ asciiLines }) => {
  
  const [charOffsets, setCharOffsets] = useState(
    // Initialize with empty arrays for each line
    Array.from({ length: asciiLines.length }, () => [])
  );
  
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
    
    // Optimized animation function with less GC pressure
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Calculate new vertical offsets for each character with reduced object creation
      const newOffsets = [];
      for (let i = 0; i < asciiLines.length; i++) {
        const lineOffsets = new Array(lineLengths[i]);
        for (let j = 0; j < lineLengths[i]; j++) {
          const phase = (j / wavelength) - (elapsed * speed);
          lineOffsets[j] = Math.sin(phase * 2 * Math.PI) * amplitude;
        }
        newOffsets.push(lineOffsets);
      }
      
      setCharOffsets(newOffsets);
      animationFrameId = requestAnimationFrame(animate);
    };
      animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [asciiLines]);    return (
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
            // Don't animate spaces and special characters
            const offset = char.trim() === '' ? 0 : (charOffsets[lineIndex][charIndex] || 0);
              return (              <span
                key={charIndex}
                style={{                  display: 'inline-block',
                  transform: `translateY(${offset}px)`,
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
