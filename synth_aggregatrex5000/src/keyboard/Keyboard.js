import React, { useEffect, useRef, useState, useCallback } from 'react';
import { requestMIDI } from '../midi/midiHandler';
import { midiNoteToFrequency } from './utils';
import './Keyboard.scss';
import { keys } from './keys';
import { useOscillator } from '../synth/oscillator';
import { keyToFreq } from './keyMappings';

export const Keyboard = React.memo((props) => {
  const { oscillatorType, adsr, lfo, amplitude } = props;

  const { startOscillator, stopOscillator } = useOscillator();

  const oscillatorTypeRef = useRef(oscillatorType);
  const adsrRef = useRef(adsr);
  const lfoRef = useRef(lfo);
  const amplitudeRef = useRef(amplitude);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [activeFreqs, setActiveFreqs] = useState(new Set());
  const [activeKeys, setActiveKeys] = useState({});

  // Keep refs updated
  useEffect(() => {
    oscillatorTypeRef.current = oscillatorType;
  }, [oscillatorType]);

  useEffect(() => {
    adsrRef.current = adsr;
  }, [adsr]);

  useEffect(() => {
    lfoRef.current = lfo;
  }, [lfo]);

  useEffect(() => {
    amplitudeRef.current = amplitude;
  }, [amplitude]);

  const handleNoteStart = useCallback(
    (freq) => {
      console.log('[Keyboard.js] handleNoteStart called with freq:', freq);

      const numericFreq = typeof freq === 'string' ? parseFloat(freq) : freq;

      setActiveFreqs((prev) => {
        if (prev.has(numericFreq)) {
          return prev; // Already active
        }

        startOscillator(
          numericFreq,
          oscillatorTypeRef.current,
          adsrRef.current,
          lfoRef.current,
          amplitudeRef.current
        );

        const newSet = new Set(prev).add(numericFreq);
        console.log('Frequency added. Updated active frequencies:', [...newSet]);

        setActiveKeys((prevKeys) => ({ ...prevKeys, [numericFreq]: true }));

        return newSet;
      });
    },
    [startOscillator]
  );

  const handleNoteStop = useCallback(
    (freq) => {
      console.log('[Keyboard.js] handleNoteStop called with freq:', freq);
  
      const numericFreq = typeof freq === 'string' ? parseFloat(freq) : freq;
  
      setActiveFreqs((prev) => {
        if (!prev.has(numericFreq)) {
          console.warn(`Frequency ${numericFreq} is not active; ignoring stop request.`);
          return prev;
        }
  
        stopOscillator(numericFreq);
  
        const newSet = new Set(prev);
        newSet.delete(numericFreq);
        console.log('Frequency removed. Updated active frequencies:', [...newSet]);
  
        return newSet;
      });
  
      setActiveKeys((prevKeys) => {
        if (!prevKeys[numericFreq]) {
          return prevKeys; // No need to update state if the key is not active
        }
        const newKeys = { ...prevKeys };
        delete newKeys[numericFreq];
        return newKeys;
      });
    },
    [stopOscillator]
  );

  // MIDI event handling
  useEffect(() => {
    let accessRef = null;
    let cancelled = false;
    const handleMIDIMessage = ({ data }) => {
      const [status, note, velocity] = data;
      const freq = parseFloat(midiNoteToFrequency(note).toFixed(2));
      const cmd = status & 0xf0;
      if (cmd === 0x90) { // Note On (or Note Off if vel 0)
        if (velocity > 0) {
          handleNoteStart(freq);
        } else {
          handleNoteStop(freq);
        }
      } else if (cmd === 0x80) { // Note Off
        handleNoteStop(freq);
      }
    };

    (async () => {
      accessRef = await requestMIDI(handleMIDIMessage);
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
      if (accessRef?.inputs) {
        accessRef.inputs.forEach(i => (i.onmidimessage = null));
      }
    };
  }, [handleNoteStart, handleNoteStop]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      const freq = keyToFreq[e.key.toUpperCase()];
      if (freq && !activeKeys[freq]) {
        handleNoteStart(freq);
      }
    };

    const handleKeyUp = (e) => {
      const freq = keyToFreq[e.key.toUpperCase()];
      if (freq) {
        handleNoteStop(freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys, handleNoteStart, handleNoteStop]);

  // Mouse event handling on the visual keyboard
  const handleMouseDown = (freq) => {
    setIsMouseDown(true);
    handleNoteStart(freq);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    activeFreqs.forEach((freq) => handleNoteStop(freq));
  };

  const handleMouseEnter = (freq) => {
    if (isMouseDown && !activeFreqs.has(parseFloat(freq))) {
      handleNoteStart(freq);
    }
  };

  const handleMouseLeave = (freq) => {
    if (isMouseDown && activeFreqs.has(parseFloat(freq))) {
      handleNoteStop(freq);
    }
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    const keyElement = e.target;
    const keyFreq = keyElement.dataset.freq;
    if (keyFreq && !activeFreqs.has(parseFloat(keyFreq))) {
      handleNoteStart(keyFreq);
    }
  };

  // Helper to check if a note is active
  const isActiveNote = (freq) => {
    const numericFreq = typeof freq === 'string' ? parseFloat(freq) : freq;
    return activeFreqs.has(numericFreq);
  };

  // Class building for keys
  const getKeyClasses = (btn) => {
    const baseClass = `key ${btn.type}`;
    const noteClass = btn.label.match(/^[A-G](?!#)/) ? `note-${btn.label[0].toLowerCase()}` : '';
    const activeClass = isActiveNote(btn.freq)
      ? btn.type === 'natural'
        ? 'button-active-natural'
        : 'button-active-flat'
      : '';
    return `${baseClass} ${noteClass} ${activeClass}`;
  };

  return (
    <div className="keyboard" onMouseMove={handleMouseMove}>
      {keys.map((btn, idx) => (
        <div
          key={idx}
          className={getKeyClasses(btn)}
          data-freq={btn.freq}
          onMouseDown={() => handleMouseDown(btn.freq)}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => handleMouseLeave(btn.freq)}
          onMouseEnter={() => handleMouseEnter(btn.freq)}
        >
          {btn.label}
        </div>
      ))}
    </div>
  );
});
