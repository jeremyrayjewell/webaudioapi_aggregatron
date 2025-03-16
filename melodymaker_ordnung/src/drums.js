// drums.js

// A dictionary describing multiple drum types with frequency, decay, and waveform
// You can tweak values or add new drum types as you like.
export const DRUM_SOUNDS = {
    kick:   { freq:  60,  decay: 0.3,  waveform: "sine"    },
    snare:  { freq: 180,  decay: 0.2,  waveform: "square"  },
    hihat:  { freq: 4500, decay: 0.03, waveform: "square"  },
    tomLow: { freq: 120,  decay: 0.4,  waveform: "sine"    },
    tomMid: { freq: 160,  decay: 0.4,  waveform: "sine"    },
    tomHigh:{ freq: 220,  decay: 0.4,  waveform: "sine"    },
    clap:   { freq: 800,  decay: 0.05, waveform: "noise"   },
    ride:   { freq: 2200, decay: 0.5,  waveform: "square"  },
    crash:  { freq: 4000, decay: 0.8,  waveform: "noise"   },
  };
  
  // This array defines the vertical order for the drum grid visualization
  export const DRUM_TYPES = [
    "kick", 
    "snare",
    "hihat",
    "tomLow",
    "tomMid",
    "tomHigh",
    "clap",
    "ride",
    "crash",
  ];
  
  //-----------------------------------------------------------------------
  // playDrum: Use oscillator + quick decay for a basic percussive effect.
  // volume = 1 is a default multiplier
  // gain   = 1 is your user-defined multiplier (from the new UI controls)
  //-----------------------------------------------------------------------
  export function playDrum(audioCtx, drumType, volume = 1, gain = 1) {
    if (!audioCtx) return;
    const soundDef = DRUM_SOUNDS[drumType];
    if (!soundDef) return; // unknown drum
  
    // For "noise," we’re faking it with a square wave. 
    // Real noise requires a noise buffer approach, but for simplicity:
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.type = (soundDef.waveform === "noise") ? "square" : soundDef.waveform;
    oscillator.frequency.value = soundDef.freq;
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    const now = audioCtx.currentTime;
    const decayTime = soundDef.decay || 0.1;
  
    // Combine the per-hit volume * user-specified gain
    gainNode.gain.setValueAtTime(volume * gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
  
    oscillator.start(now);
    oscillator.stop(now + decayTime);
  }
  
  //-----------------------------------------------------------------------
  // generateDrumPattern: returns an array of length `patternLength`
  // with each entry either a drumType string or null.
  //
  // "variation" can be "simple", "rock", "funky", "random", etc.
  // Optionally use `algoData` if you want to tie the drum pattern
  // more closely to the melody or algorithm steps.
  //-----------------------------------------------------------------------
  export function generateDrumPattern(patternLength, variation = "simple", algoData = null) {
    let pattern = Array(patternLength).fill(null);
  
    switch (variation) {
      case "simple":
        // Kick on multiples of 4, snare on 2 mod 4, hihat on the rest
        pattern = pattern.map((_, i) => {
          if (i % 4 === 0) return "kick";
          if (i % 4 === 2) return "snare";
          return "hihat";
        });
        break;
  
      case "rock":
        // Kick on beats 0 & 2, snare on 1 & 3, hihat on every step, crash at the start
        pattern = pattern.map((_, i) => {
          const mod4 = i % 4;
          if (mod4 === 0 || mod4 === 2) return "kick";
          if (mod4 === 1 || mod4 === 3) return "snare";
          return null;
        });
        pattern = pattern.map((drum) => drum || "hihat");
        // Crash on first step
        if (patternLength > 0) pattern[0] = "crash";
        break;
  
      case "funky":
        // Kick on 0 mod 4, random fill for other beats
        pattern = pattern.map((_, i) => {
          if (i % 4 === 0) return "kick";
          const randomList = ["snare", "hihat", "tomLow", "tomMid", "clap"];
          return randomList[Math.floor(Math.random() * randomList.length)];
        });
        break;
  
      case "random":
        // Pure random from all drum types
        const allDrums = Object.keys(DRUM_SOUNDS);
        pattern = pattern.map(() => {
          const randType = allDrums[Math.floor(Math.random() * allDrums.length)];
          return randType;
        });
        break;

      case "breakbeat":
        // Breakbeat pattern
        pattern = pattern.map((_, i) => {
          if (i % 8 === 0) return "kick";
          if (i % 8 === 4) return "snare";
          return "hihat";
        });
        break;

      case "drumless":
        // No drums
        pattern = Array(patternLength).fill(null);
        break;    
  
      default:
        // fallback => no drums
        pattern = Array(patternLength).fill(null);
        break;
    }
  
    // Example: If you want to tie it to the algoData:
    // if (algoData && algoData.notes) {
    //   // e.g., if note freq > 600 => put "crash"
    //   // or check algoData.steps[i].includes("left") => "tomLow"
    // }
  
    return pattern;
  }
  