// src/contexts/AudioContextProvider.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { setupAudioGraph } from '../synth/setupAudioGraph';
import { setupSignalFlow } from '../synth/signalFlow';

export const AudioContextContext = createContext();

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const nodesRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const newCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = newCtx;
        await newCtx.resume(); // Ensure audio context is running
        
        const nodes = setupAudioGraph(newCtx);
        nodesRef.current = nodes;
        
        // Use the analyser from nodes instead of creating a new one
        setAnalyser(nodes.analyser);
        
        setupSignalFlow(nodes, nodes.analyser, newCtx.destination);
        setAudioContext(newCtx);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const contextValue = { audioContext, analyser, nodes: nodesRef.current }; // Provide the nodes object

  return (
    <AudioContextContext.Provider value={contextValue}>
      {children}
    </AudioContextContext.Provider>
  );
};