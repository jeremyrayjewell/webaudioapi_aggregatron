import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import MusicalBigO from "./MusicalBigO";
import WaveformVisualizer from "./WaveformVisualizer";
import AnimatedAsciiArt from "./AnimatedAsciiArt";
import CombinedOverlay from "./CombinedOverlay";
import "./globalStyles.css";
import {
  footerAsciiArt1,
  footerAsciiArt2,
  footerAsciiArt3,
  footerAsciiArt1b,
  footerAsciiArt1c,
} from "./asciiFooter";

// Define the component
function App() {
  const [audioCtx, setAudioCtx] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 666);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 415);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    // Lazy initialize AudioContext only once when needed
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Optimize FFT size for better performance - 1024 is often enough and improves performance
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 1024; // Changed from 2048 to 1024 for better performance
    analyserNode.smoothingTimeConstant = 0.8; // Add smoothing for nicer visualization
    
    setAudioCtx(ctx);
    setAnalyser(analyserNode);

    // Apply the DOS theme to body
    document.body.setAttribute("data-bs-theme", "dos");

    return () => {
      if (ctx && ctx.state !== "closed") {
        ctx.close();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Debounced resize handler using useCallback to prevent recreation on renders
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      setIsMobile(window.innerWidth < 666);
      setIsSmallMobile(window.innerWidth < 415);
    }, 200); // 200ms debounce
  }, []);

  // Add event listener in a separate effect for cleaner code
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const memoizedAnimatedAsciiArt = useMemo(() => {
    return (
      <AnimatedAsciiArt
        asciiLines={[
          "         ######                                                                                       ### ",
          "      ##############  ################### ###################   ##########    ####################   ##################    #########    ############## ",
          "    ######     #######  #######     ######  #######    ######## ##########      ####     ######         ####  ##########     ####     ################# ",
          "  ######         ######  #####       ######  #####         ###### ##########    ####      #####         ####   ##########    ####    #####         ##### ",
          "######          ###### #####       #####   #####          ##### #### ######   ####      #####         ####   #### ######   ####   ######           # ",
          "   ######           ###### ################    #####          ##### ####   ######  ###      #####         ####   ####   ###### ####   ######            ### # ",
          "   ######           ###### #############       #####          ##### ####    ##########      #####         ####   ####     #########   #####       ########### ",
          "   #######          ###### #####   ######      #####          ##### ####     #########      #####         ####   ####      ########   ######        ###### ## ",
          " ######          #####  #####    ######     #####         #####  ####       #######      #####         ###    ####      ########   ######        ###### ",
          "  ######       ######  ######     #######   ######      #######  ####        ######       ######     #####    ####        ######    ######       ###### ",
          "   #############################   ########################## ##########      #####       ################ ##########      #####     ################# ",
          "##########     ##########          ##############         #######         ##          ##########      #####            ##       ########",
        ]}
      />
    );
  }, []);

  const memoizedFooterAsciiArt1 = useMemo(() => {
    const art = isSmallMobile
      ? footerAsciiArt1b
      : isMobile
      ? footerAsciiArt1c
      : footerAsciiArt1;
    return art.map((line, index) => <span key={index}>{line}</span>);
  }, [isSmallMobile, isMobile]);

  const memoizedFooterAsciiArt2 = useMemo(() => {
    return footerAsciiArt2.map((line, index) => <span key={index}>{line}</span>);
  }, []);

  const memoizedFooterAsciiArt3 = useMemo(() => {
    return footerAsciiArt3.map((line, index) => <span key={index}>{line}</span>);
  }, []);
  return (
    <div
      className="container-fluid dosbox"
      style={{
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
        margin: 0,
        overflow: "hidden", // Add overflow hidden to prevent border artifacts
      }}
    >
      <div className="row mb-3" style={{ margin: 0 }}>
        <div className="col-12 text-center">
          <div className="ascii-art-container">
            <pre
              style={{
                fontSize: "clamp(6px, 1vw, 10px)",
                color: "white",
                padding: "0",
              }}
            >
              {memoizedAnimatedAsciiArt}
            </pre>
          </div>
          <h1>
            Musical Big-O <span className="blink">_</span>
          </h1>
        </div>
      </div>
      
      <div
        className="App scrolling-content"
        style={{ 
          position: "relative", 
          width: "100%", 
          height: "100%", 
          margin: 0, 
          padding: 0,
          overflow: "hidden", 
          border: "none",
          outline: "none"
        }}
      >
        {audioCtx && analyser && (
          <>
            <WaveformVisualizer audioCtx={audioCtx} analyser={analyser} />
            <CombinedOverlay audioCtx={audioCtx} analyser={analyser} />
          </>
        )}
        <MusicalBigO audioCtx={audioCtx} analyser={analyser} />
      </div>

      {/* Footer ASCII art block 1 - responsive to screen size */}
      <div className="ascii-art-container">
        <pre className="ascii-art">
          {memoizedFooterAsciiArt1}
        </pre>
      </div>

      {/* Footer ASCII art blocks 2 & 3 for desktop only */}
      {!isMobile && (
        <>
          <div className="ascii-art-container">
            <pre style={{ fontSize: "clamp(2px, 0.4vw, 4px)" }}>
              {memoizedFooterAsciiArt2}
            </pre>
          </div>

          <div className="ascii-art-container">
            <pre style={{ fontSize: "clamp(2px, 0.4vw, 4px)" }}>
              {memoizedFooterAsciiArt3}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
