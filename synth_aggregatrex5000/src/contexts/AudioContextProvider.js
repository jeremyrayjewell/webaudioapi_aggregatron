// src/contexts/AudioContextProvider.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { setupAudioGraph } from '../synth/setupAudioGraph';
import { setupSignalFlow } from '../synth/signalFlow';

export const AudioContextContext = createContext();

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const nodesRef = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);

    const nodes = setupAudioGraph(ctx);
    nodesRef.current = nodes;

    const analyserNode = ctx.createAnalyser();
    setAnalyser(analyserNode);

    setupSignalFlow(nodes, analyserNode, ctx.destination);

    return () => {
      ctx.close();
    };
  }, []);

  const contextValue = { audioContext, analyser, nodes: nodesRef.current }; // Provide the nodes object

  return (
    <AudioContextContext.Provider value={contextValue}>
      {children}
    </AudioContextContext.Provider>
  );
};