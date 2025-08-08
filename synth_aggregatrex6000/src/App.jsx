import React, { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { SynthProvider, useSynth } from './hooks/useSynth';
import { useMIDI } from './hooks/useMIDI';
import useQwertyInput, { keyToNote } from './hooks/useQwertyInput';
import ThreeCanvas from './three/ThreeCanvas';
import midiDebugger from './utils/midiDebugger';

const SynthController = () => {
  const synth = useSynth();
  const [activeNotes, setActiveNotes] = useState(new Set());
  const midiActivityRef = useRef({ count: 0, lastTime: Date.now() });
  const handleNoteOn = useCallback((note, velocity) => {
    try {
      const now = Date.now();
      const timeDiff = now - midiActivityRef.current.lastTime;
      midiActivityRef.current.count++;
      midiActivityRef.current.lastTime = now;

      // Enhanced performance monitoring
      if (timeDiff < 5 && midiActivityRef.current.count > 20) {
        console.warn(`Extreme MIDI input detected: ${midiActivityRef.current.count} messages in ${timeDiff}ms - activating emergency throttling`);
        // Skip processing every other note during extreme load
        if (midiActivityRef.current.count % 2 === 0) {
          return;
        }
      } else if (timeDiff < 10 && midiActivityRef.current.count > 10) {
        console.log(`Rapid MIDI input detected: ${midiActivityRef.current.count} messages in ${timeDiff}ms`);
      }

      // Ensure audio context is running before processing
      if (synth && synth.audioContext && synth.audioContext.state !== 'running') {
        console.log("Audio context not running, attempting resume before note processing");
        synth.audioContext.resume().catch(e => {
          console.error("Failed to resume audio context:", e);
        });
      }

      setTimeout(() => {
        if (Date.now() - midiActivityRef.current.lastTime >= 500) {
          midiActivityRef.current.count = 0;
        }
      }, 500);

      synth.noteOn(note, velocity);
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.add(note);
        return newSet;
      });
      midiDebugger.noteOn(note, velocity);
    } catch (e) {
      console.error(`Error in handleNoteOn for note ${note}:`, e);
    }
  }, [synth]);

  const handleNoteOff = useCallback((note) => {
    try {
      synth.noteOff(note);
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
      midiDebugger.noteOff(note);
    } catch (e) {
      console.error(`Error in handleNoteOff for note ${note}:`, e);
    }
  }, [synth]);

  const clearAllNotes = useCallback(() => {
    console.log("Clear all notes triggered in App.jsx");
    try {
      if (synth && typeof synth.allNotesOff === 'function') {
        synth.allNotesOff();
      }
      setActiveNotes(new Set());
      midiDebugger.clearAll();
    } catch (e) {
      console.error("Error in clearAllNotes:", e);
    }
  }, [synth]);  const { clearAllNotes: midiPanic } = useMIDI(handleNoteOn, handleNoteOff);
  useQwertyInput(handleNoteOn, handleNoteOff);
  useEffect(() => {
    const resumeAudioContext = async () => {
      if (!synth) {
        console.warn("Synth not available yet");
        return;
      }

      if (!synth.audioContext) {
        console.warn("Audio context not initialized yet");
        return;
      }

      if (synth.audioContext.state !== 'running') {
        console.log("Attempting to resume audio context...");
        try {
          await synth.audioContext.resume();
          if (synth.audioContext.state === 'running') {
            console.log("Audio context resumed successfully");
          } else {
            console.warn(`Audio context in unexpected state: ${synth.audioContext.state}`);
          }
        } catch (e) {
          console.error("Error resuming audio context:", e);
        }
      }
    };

    // More aggressive audio context resume for better MIDI responsiveness
    const handleFirstInteraction = async (event) => {
      console.log("First interaction detected, attempting to resume audio context");
      if (synth && synth.audioContext) {
        try {
          await synth.audioContext.resume();
          console.log("Audio context resumed successfully on first interaction");
          // Remove listeners only after successful resume
          window.removeEventListener('mousedown', handleFirstInteraction);
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('keydown', handleFirstInteraction);
          // Ensure handleNoteOn will work after context is resumed
          if (event.type === 'keydown' && keyToNote[event.key]) {
            handleNoteOn(keyToNote[event.key], 127);
          }
        } catch (e) {
          console.error("Failed to resume audio context on first interaction:", e);
        }
      }
    };

    const setupSafetyChecks = () => {
      const safetyInterval = setInterval(() => {
        if (activeNotes.size > 0 && synth && 
            ((synth.voiceManager && synth.voiceManager.activeVoices.size === 0) ||
             (synth.activeVoices && synth.activeVoices.size === 0))) {
          console.warn("Safety check: Note count mismatch detected, clearing all notes");
          clearAllNotes();
        }
      }, 10000);

      window.addEventListener('synth-panic', () => {
        console.log("Panic event received from voice debugger");
        clearAllNotes();
      });

      return safetyInterval;
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        console.log("Escape key pressed - clearing all notes");
        clearAllNotes();
        if (midiPanic) midiPanic();
      }
    };

    const handleBlur = () => {
      console.log("Window blur - clearing all notes");
      clearAllNotes();
    };

    // Set up listeners for first interaction
    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    
    // Keep the original listeners for ongoing functionality
    window.addEventListener('mousedown', resumeAudioContext);
    window.addEventListener('touchstart', resumeAudioContext);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);

    const safetyInterval = setupSafetyChecks();

    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('mousedown', resumeAudioContext);
      window.removeEventListener('touchstart', resumeAudioContext);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      clearInterval(safetyInterval);
    };
  }, [synth, activeNotes, clearAllNotes, midiPanic]);

  return (
    <ThreeCanvas
      onNoteOn={handleNoteOn}
      onNoteOff={handleNoteOff}
      activeNotes={activeNotes}
    />
  );
};

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setAppReady(true);
    });
  }, []);

  if (!appReady) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
      }}>
        <h1 style={{ color: '#ffffff' }}>Loading Synthesizer...</h1>
      </div>
    );
  }
  return (
    <React.StrictMode>
      <SynthProvider>
        <SynthController />
      </SynthProvider>
    </React.StrictMode>
  );
};

export default App;
