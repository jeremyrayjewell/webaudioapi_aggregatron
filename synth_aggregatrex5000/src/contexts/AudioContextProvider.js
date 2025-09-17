// src/contexts/AudioContextProvider.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { setupAudioGraph } from '../synth/setupAudioGraph';
import { setupSignalFlow } from '../synth/signalFlow';

export const AudioContextContext = createContext();

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [initError, setInitError] = useState(null);
  const [attemptedAutoInit, setAttemptedAutoInit] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const nodesRef = useRef(null);
  const audioContextRef = useRef(null);

  const loadImpulse = async (ctx, nodes, attempt = 1) => {
    if (!nodes?.convolver || nodes.convolver.buffer) return;
    try {
      const url = attempt === 1 ? '/impulse-response.wav' : `/impulse-response.wav?bust=${Date.now()}`;
      const resp = await fetch(url, { cache: 'reload' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const arr = await resp.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr.slice(0));
      nodes.convolver.buffer = buf;
      console.log('[AudioProvider] Impulse loaded (dur', buf.duration.toFixed(2),'s)');
    } catch (e) {
      console.warn('[AudioProvider] Impulse load failed attempt', attempt, e.message);
      if (attempt < 3) {
        setTimeout(() => loadImpulse(ctx, nodes, attempt + 1), 500 * attempt);
      }
    }
  };

  const actuallyInit = async () => {
    let ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      console.log('[AudioProvider] Created new AudioContext');
    }
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        console.log('[AudioProvider] Resumed suspended AudioContext');
      } catch (e) {
        console.warn('[AudioProvider] Resume attempt failed:', e.message);
        throw e;
      }
    }
    const nodes = setupAudioGraph(ctx);
    nodesRef.current = nodes;
    setAnalyser(nodes.analyser);
  setupSignalFlow(nodes, nodes.analyser, ctx.destination);
  // Kick off impulse loading
  loadImpulse(ctx, nodes);
    setAudioContext(ctx);
    setInitError(null);
    setInitialized(true);
  };

  const startAudio = async () => {
    try {
      await actuallyInit();
    } catch (e) {
      console.error('Manual startAudio failed:', e);
      setInitError(e.message || 'Failed to start audio');
    }
  };

  useEffect(() => {
    let mounted = true;
    const autoInit = async () => {
      try {
        await actuallyInit();
      } catch (e) {
        setInitError(e.message || 'Browser blocked auto init');
      } finally {
        if (mounted) setAttemptedAutoInit(true);
      }
    };
    autoInit();
    return () => {
      // Do NOT close the context automatically; StrictMode double-mount would kill audio.
      mounted = false;
    };
  }, []);

  // Expose startAudio so UI can show a button
  // Developer helpers
  if (typeof window !== 'undefined') {
    window.__reverbStatus = () => {
      const nodes = nodesRef.current;
      if (!nodes) return console.log('No nodes yet');
      console.log('[reverbStatus]', {
        hasBuffer: !!nodes.convolver.buffer,
        bufferDuration: nodes.convolver.buffer?.duration,
        reverbGain: nodes.reverbGain.gain.value
      });
    };
    window.__reloadImpulse = () => {
      const nodes = nodesRef.current;
      if (!audioContextRef.current || !nodes) return console.log('Context/nodes missing');
      nodes.convolver.buffer = null;
      loadImpulse(audioContextRef.current, nodes, 1);
    };
  }

  const contextValue = { audioContext, analyser, nodes: nodesRef.current, startAudio, initError, attemptedAutoInit, initialized };

  return (
    <AudioContextContext.Provider value={contextValue}>
      {children}
    </AudioContextContext.Provider>
  );
};