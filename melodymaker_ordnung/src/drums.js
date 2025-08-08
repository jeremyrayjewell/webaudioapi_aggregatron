
export const DRUM_SOUNDS = {
    kick:   { freq:  60,  decay: 0.3,  waveform: "sine",   distortion: 0, reverb: 0, delay: 0 },
    snare:  { freq: 180,  decay: 0.2,  waveform: "square", distortion: 0, reverb: 0, delay: 0 },
    hihat:  { freq: 4500, decay: 0.03, waveform: "square", distortion: 0, reverb: 0, delay: 0 },
    tomLow: { freq: 120,  decay: 0.4,  waveform: "sine",   distortion: 0, reverb: 0, delay: 0 },
    tomMid: { freq: 160,  decay: 0.4,  waveform: "sine",   distortion: 0, reverb: 0, delay: 0 },
    tomHigh:{ freq: 220,  decay: 0.4,  waveform: "sine",   distortion: 0, reverb: 0, delay: 0 },
    clap:   { freq: 800,  decay: 0.05, waveform: "noise",  distortion: 0, reverb: 0, delay: 0 },
    ride:   { freq: 2200, decay: 0.5,  waveform: "square", distortion: 0, reverb: 0, delay: 0 },
    crash:  { freq: 4000, decay: 0.8,  waveform: "noise",  distortion: 0, reverb: 0, delay: 0 },
  };

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
  

  export function playDrum(audioCtx, drumType, volume = 1, gain = 1) {
    if (!audioCtx) return;
    const soundDef = DRUM_SOUNDS[drumType];
    if (!soundDef) return; 
  

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.type = (soundDef.waveform === "noise") ? "square" : soundDef.waveform;
    oscillator.frequency.value = soundDef.freq;
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    const now = audioCtx.currentTime;
    const decayTime = soundDef.decay || 0.1;
  
    gainNode.gain.setValueAtTime(volume * gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
  
    oscillator.start(now);
    oscillator.stop(now + decayTime);
  }
  export const DRUM_PATTERN_FAMILIES = {
    simple: ["simple1", "simple2", "simple3", "simple4"],
    funk: ["funk1", "funk2", "funk3", "funk4"],
    jazz: ["jazz1", "jazz2", "jazz3", "jazz4"],
    rock: ["rock1", "rock2", "rock3", "rock4"],
    reggae: ["reggae1", "reggae2", "reggae3", "reggae4"],
    house: ["house1", "house2", "house3", "house4"],
    ambient: ["ambient1", "ambient2", "ambient3", "ambient4"],
    waltz: ["waltz1", "waltz2", "waltz3", "waltz4"],
    breakbeat: ["breakbeat1", "breakbeat2", "breakbeat3", "breakbeat4"],
    electronic: ["electronic1", "electronic2", "electronic3", "electronic4"],
    latin: ["latin1", "latin2", "latin3", "latin4"],
    hiphop: ["hiphop1", "hiphop2", "hiphop3", "hiphop4"],
    minimal: ["minimal1", "minimal2", "minimal3", "minimal4"],
    techno: ["techno1", "techno2", "techno3", "techno4"],
    dubstep: ["dubstep1", "dubstep2", "dubstep3", "dubstep4"],
    trap: ["trap1", "trap2", "trap3", "trap4"]
  };

  export function getBasePattern(variation) {
    if (/[a-z]+\d+$/.test(variation)) {
      return variation.replace(/\d+$/, '');
    }
    return variation;
  }


  export function generateDrumPattern(patternLength, variation = "simple1", algoData = null) {
    let pattern = Array(patternLength).fill(null);
    
    const basePattern = getBasePattern(variation);
    const variationNum = parseInt(variation.match(/\d+$/)?.[0] || "1");
  
    switch (basePattern) {
      case "simple":
        if (variationNum === 1) {
          pattern = pattern.map((_, i) => {
            if (i % 4 === 0) return "kick";
            if (i % 4 === 2) return "snare";
            return "hihat";
          });
        } else if (variationNum === 2) {
          pattern = pattern.map((_, i) => {
            if (i % 4 === 0 || i % 8 === 6) return "kick";
            if (i % 4 === 2) return "snare";
            return "hihat";
          });
        } else if (variationNum === 3) {
          pattern = pattern.map((_, i) => {
            if (i % 4 === 0) return "kick";
            if (i % 8 === 2) return "snare";
            if (i % 8 === 6) return "clap";
            return "hihat";
          });
        } else {
          pattern = pattern.map((_, i) => {
            if (i % 4 === 0) return "kick";
            if (i % 4 === 2) return "snare";
            if (i % 16 === 7) return "tomLow";
            if (i % 16 === 15) return "tomMid";
            return "hihat";
          });
        }
        break;      case "rock":
        if (variationNum === 1) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            if (mod16 === 0 || mod16 === 4 || mod16 === 8 || mod16 === 12) return "kick";
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "snare";
            if (mod16 === 0) return "crash";
            if (mod16 === 7) return "ride";
            if (mod16 === 10) return "clap";
            return "hihat";
          });
        } else if (variationNum === 2) {
          pattern = pattern.map((_, i) => {
            const mod8 = i % 8;
            if (mod8 === 0 || mod8 === 2 || mod8 === 6) return "kick";
            if (mod8 === 4) return "snare";
            
            const mod32 = i % 32;
            if (mod32 === 28) return "tomHigh";
            if (mod32 === 29) return "tomMid";
            if (mod32 === 30) return "tomLow";
            if (mod32 === 31) return "kick";
            
            if (mod32 === 0) return "crash";
            if (mod32 === 16) return "crash"; 
            if (mod8 === 7) return "ride";
            
            return "hihat";
          });
        } else if (variationNum === 3) {
          pattern = pattern.map((_, i) => {
            const mod7 = i % 7; 
            const mod28 = i % 28; 
            
            if (mod7 === 0) return "kick";
            if (mod7 === 3) return "snare";
            
            if (mod28 === 19) return "tomHigh";
            if (mod28 === 20) return "tomMid";  
            if (mod28 === 21) return "tomLow";
            
            if (mod28 === 0) return "crash";
            if (mod28 === 14) return "ride";
            if (mod28 === 24) return "clap"; 
            
            if (mod28 === 6 || mod28 === 13) return "ride";
            
            return "hihat";
          });
        } else {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            
            if (mod16 % 4 === 0) return "kick";
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            if (mod16 === 4) return "clap"; 
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "ride";
            if (mod16 === 0) return "crash"; 
            
            
            if (mod16 === 13) return "tomHigh";
            if (mod16 === 14) return "tomMid";
            if (mod16 === 15) return "tomLow";
            
            return "hihat";
          });
        }
        break;
    case "funk":
        if (variationNum === 1) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            if (mod16 === 0 || mod16 === 6 || mod16 === 10) return "kick";
            if (mod16 === 4 || mod16 === 12) return "snare";
            if (mod16 === 7 || mod16 === 15) return "snare"; 
            if (mod16 === 8) return "tomLow";
            if (mod16 === 9) return "tomMid";
            if (mod16 === 14) return "clap";
            if (mod16 === 2) return "ride"; 
            if (i % 64 === 0) return "crash";
            return "hihat";
          });
        } else if (variationNum === 2) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64; 
            
            if (mod16 === 0 || mod16 === 3 || mod16 === 10) return "kick";
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            if (mod16 === 6) return "tomLow";
            if (mod16 === 7) return "tomMid";
            if (mod16 === 15) return "tomHigh";
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 2 || mod16 === 10) return "ride";
            if (mod16 === 13) return "clap";
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            if (mod16 === 0 || mod16 === 5 || mod16 === 9 || mod16 === 11) return "kick";
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            if (mod16 === 4 && mod32 >= 16) return "clap"; 
            
            if (mod16 === 2 || mod16 === 10) return "ride";
            
            if (mod16 === 7) return "tomHigh";
            if (mod16 === 15) return "tomMid";
            if (mod32 === 22) return "tomLow";
            
            if (mod32 === 0) return "crash";
            
            return "hihat";
          });
        } else {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            if (mod16 === 0 || mod16 === 7 || mod16 === 10 || mod16 === 13) return "kick";
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            if (mod64 === 30) return "tomHigh";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 32) return "tomLow";
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 2 || mod16 === 9) return "ride";
            
            if (mod64 === 20 || mod64 === 52) return "clap";
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        }
        break;
        
  case "funky": 
        return generateDrumPattern(patternLength, "funk1", algoData);
        break;
  
      case "random":
        const allDrums = Object.keys(DRUM_SOUNDS);
        pattern = pattern.map(() => {
          const randType = allDrums[Math.floor(Math.random() * allDrums.length)];
          return randType;
        });
        break;      case "breakbeat":
        if (variationNum === 1) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            if (mod32 === 14) return "tomHigh";
            if (mod32 === 22) return "tomMid";
            if (mod32 === 30) return "tomLow";
            
            if (mod32 === 4) return "clap"; 
            
            if (mod32 === 0) return "crash";  
            if (mod32 === 18) return "ride"; 
            
            return "hihat";
          });
        } else if (variationNum === 2) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            
            if (mod16 === 4 || mod16 === 12 || mod16 === 14) return "snare";
            
            if (mod32 === 22) return "tomHigh";
            if (mod32 === 23) return "tomMid";
            if (mod32 === 24) return "tomLow";
            
            if (mod32 === 28) return "clap";
            
            if (mod32 === 0) return "crash"; 
            if (mod32 === 16) return "ride"; 
            
            return "hihat";
          });
        } else if (variationNum === 3) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            if (mod16 === 0 || mod16 === 6 || mod16 === 10) return "kick";
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            if (mod16 === 14) return "snare"; 
            
            if (mod32 === 22) return "tomHigh";
            if (mod32 === 23) return "tomMid";
            if (mod32 === 24) return "tomLow";
            
            if (mod32 === 20) return "clap";
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 5) return "ride"; 
            
            return "hihat";
          });
        } else {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            if (mod16 === 0 || mod16 === 8 || mod16 === 10) return "kick";
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            if (mod16 === 14) return "tomMid";
            if (mod64 === 30) return "tomHigh";
            if (mod64 === 62) return "tomLow";
            
            if (mod64 === 36) return "clap";
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 40) return "ride"; 
            
            if (i % 2 === 0) return "hihat";
            return null;
          });
        }
        break;
        
      case "jazz":
        if (variationNum === 1) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            if (mod16 === 0 || mod16 === 4 || mod16 === 8 || mod16 === 12) return "ride"; 
            if (mod16 === 4 || mod16 === 12) return "kick"; 
            if (mod16 === 8) return "snare"; 
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat"; 
            
            if (mod32 === 22) return "tomLow";
            if (mod32 === 18) return "tomMid";
            if (mod32 === 30) return "tomHigh"; 
            
            if (mod32 === 0) return "crash"; 
            
            if (mod32 === 26) return "clap";
            
            return "ride"; 
          });
        } else if (variationNum === 2) {
          pattern = pattern.map((_, i) => {
            const mod12 = i % 12; 
            const mod48 = i % 48; 
            
            if (mod12 === 0 || mod12 === 6) return "ride";
            if (mod12 === 3 || mod12 === 9) return "kick";
            if (mod12 === 6) return "snare";
            
            if (mod48 === 16) return "tomHigh";
            if (mod48 === 28) return "tomMid";
            if (mod48 === 40) return "tomLow";
            
            if (mod48 === 0) return "crash";
            if (mod48 === 33) return "clap";
            
            if (mod12 === 1 || mod12 === 7) return "hihat";
            
            return "ride"; 
          });
        } else if (variationNum === 3) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64; 
            
            if (mod16 === 0 || mod16 === 4 || mod16 === 9 || mod16 === 13) return "ride";
            if (mod16 === 4 || mod16 === 12) return "snare"; 
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "kick"; 
            
            if (mod64 === 23) return "tomHigh";
            if (mod64 === 24) return "tomMid";
            if (mod64 === 25) return "tomLow";
            if (mod64 === 26) return "tomLow";
            
            if (mod16 === 1 || mod16 === 5 || mod16 === 9 || mod16 === 13) return "hihat";
            
            if (mod64 === 0) return "crash";
            
            if (mod64 === 38) return "clap";
            
            return "ride"; 
          });
        } else {
          pattern = pattern.map((_, i) => {
            const mod8 = i % 8;
            const mod32 = i % 32;
            
            if (mod8 === 0 || mod8 === 4) return "hihat"; 
            if (mod8 === 2 || mod8 === 6) return "snare"; 
            if (mod8 === 1 || mod8 === 5) return "kick"; 
            
            if (mod32 === 0) return "crash"; 
            if (mod8 === 3 || mod8 === 7) return "ride"; 
            
            if (mod32 === 14) return "tomHigh";
            if (mod32 === 22) return "tomMid";
            if (mod32 === 30) return "tomLow";
            
            if (mod32 === 18) return "clap";
            
            return "ride"; 
          });
        }
        break;
          case "electronic":
        if (variationNum === 1) {
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            if (mod16 % 4 === 0) return "kick";
            
            if (mod16 === 4 || mod16 === 12) return "clap";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 8) return "ride"; 
            
            
            if (mod32 === 28) return "tomHigh";
            if (mod32 === 29) return "tomMid";
            if (mod32 === 30) return "tomLow";
            
            
            if (mod16 % 2 === 1) return "hihat";
            
            
            if (mod32 === 22) return "snare";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64; 
            
            
            if (mod16 === 0 || mod16 === 10 || mod16 === 11) return "kick";
            
            
            if (mod16 === 4) return "snare";
            if (mod16 === 12) return "clap";
            
            
            if (mod64 === 14) return "tomLow";
            if (mod64 === 15) return "tomMid";
            if (mod64 === 31) return "tomHigh";
            if (mod64 === 47) return "tomMid";
            if (mod64 === 48) return "tomLow";
            
            
            if (mod64 === 0) return "crash";
            if (mod16 === 6 || mod16 === 14) return "ride";
            
            
            if (mod16 === 2 || mod16 === 7 || mod16 === 11 || mod16 === 13) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod64 === 26) return "tomHigh";
            if (mod64 === 27) return "tomMid";
            if (mod64 === 28) return "tomLow";
            if (mod64 === 29) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 8 || mod16 === 15) return "ride";
            if (mod64 === 23 || mod64 === 55) return "clap";
            
            
            if (i % 2 === 0) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 8) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 9) return "ride"; 
            
            
            if (mod64 === 15) return "tomLow";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 47) return "tomHigh";
            
            
            if (mod64 === 24 || mod64 === 56) return "clap";
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        }
        break;      case "latin":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 6 || mod16 === 12) return "kick";
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod16 === 2 || mod16 === 10) return "tomHigh";
            if (mod16 === 5 || mod16 === 13) return "tomMid";
            if (mod16 === 7 || mod16 === 15) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 8) return "ride"; 
            
            
            if (mod16 === 1 || mod16 === 9) return "clap";
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 6 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod16 === 2 || mod16 === 8 || mod16 === 14) return "tomHigh";
            if (mod16 === 3 || mod16 === 11) return "tomMid";
            if (mod16 === 5 || mod16 === 13) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 9) return "ride"; 
            
            
            if (mod16 === 1 || mod16 === 9) return "clap";
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 9) return "kick";
            
            
            if (mod16 === 4 || mod16 === 13) return "snare";
            
            
            if (mod32 === 7 || mod32 === 23) return "tomLow";
            if (mod32 === 15) return "tomMid";
            if (mod32 === 31) return "tomHigh";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 11) return "ride"; 
            
            
            if (mod32 === 5 || mod32 === 21) return "clap";
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod12 = i % 12; 
            const mod48 = i % 48; 
            
            
            if (mod12 === 0 || mod12 === 3 || mod12 === 6 || mod12 === 8 || mod12 === 10) return "kick";
            
            
            if (mod12 === 4) return "snare";
            
            
            if (mod12 === 2 || mod12 === 9) return "tomHigh";
            if (mod12 === 5) return "tomMid";
            if (mod12 === 7) return "tomLow";
            
            
            if (mod48 === 0) return "crash"; 
            if (mod12 === 1 || mod12 === 11) return "ride"; 
            
            
            if (mod48 === 18 || mod48 === 42) return "clap";
            
            
            if (mod12 % 2 === 0) return "hihat";
            return null;
          });
        }
        break;
          case "hiphop":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod16 === 4) return "clap";
            
            
            if (mod64 === 30) return "tomHigh";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 32) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 48) return "ride"; 
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            if (mod16 === 12) return "clap"; 
            
            
            if (mod32 === 15) return "tomLow";
            if (mod32 === 31) return "tomMid";
            if (mod32 === 23) return "tomHigh";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod32 === 26) return "ride"; 
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 7 || mod16 === 13) return "kick";
            
            
            if (mod16 === 4) return "snare";
            if (mod16 === 12) return "clap"; 
            
            
            if (mod64 === 0) return "crash";
            if (mod64 === 32) return "ride";
            
            
            if (mod64 === 27) return "tomHigh";
            if (mod64 === 28) return "tomMid";
            if (mod64 === 29) return "tomLow";
            if (mod64 === 30) return "tomLow";
            
            
            return "hihat"; 
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 9) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            if (mod32 === 20) return "clap"; 
            
            
            if (mod32 === 15) return "tomLow";
            if (mod32 === 23) return "tomMid";
            if (mod32 === 31) return "tomHigh";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 10) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        }
        break;      case "minimal":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod32 = i % 32;
            const mod64 = i % 64;
            
            
            if (mod32 === 0) return "kick";
            
            
            if (mod32 === 16) return "clap";
            
            
            if (mod64 === 8) return "ride";
            if (mod64 === 40) return "crash";
            
            
            if (mod32 === 4 || mod32 === 20) return "hihat";
            
            
            if (mod64 === 28) return "tomHigh";
            if (mod64 === 44) return "tomMid";
            if (mod64 === 60) return "tomLow";
            
            
            if (mod64 === 24) return "snare";
            
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod32 = i % 32;
            const mod64 = i % 64;
            
            
            if (mod32 === 0 || mod32 === 16) return "kick";
            if (mod32 === 8 || mod32 === 24) return "clap";
            
            
            if (mod32 === 4 || mod32 === 12 || mod32 === 20 || mod32 === 28) return "hihat";
            
            
            if (mod64 === 15) return "tomLow";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 47) return "tomHigh";
            
            
            if (mod64 === 0) return "crash";
            if (mod64 === 24) return "ride";
            
            
            if (mod64 === 40) return "snare";
            
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 11) return "kick";
            
            
            if (mod16 === 8) return "clap";
            if (mod64 === 24) return "snare";
            
            
            if (mod16 === 4 || mod16 === 7 || mod16 === 13) return "hihat";
            
            
            if (mod64 === 22) return "tomHigh";
            if (mod64 === 38) return "tomMid";
            if (mod64 === 54) return "tomLow";
            
            
            if (mod64 === 0) return "crash";
            if (mod64 === 32) return "ride";
            
            return null;
          });        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            const mod64 = i % 64;
            
            
            if (mod16 === 0) return "kick";
            
            
            if (mod32 === 9) return "clap";
            if (mod64 === 32) return "snare";
            
            
            if (mod16 === 4 || mod16 === 12) return "hihat";
            
            
            if (mod16 === 15) return "ride";
            
            
            if (mod64 === 24) return "tomHigh";
            if (mod64 === 40) return "tomMid";
            if (mod64 === 56) return "tomLow";
            
            
            if (mod64 === 0) return "crash";
              return null;
          });
        }
        break;
      case "techno":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 % 4 === 0) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare"; 
            
            
            if (mod64 === 27) return "tomHigh";
            if (mod64 === 28) return "tomMid";
            if (mod64 === 29) return "tomLow";
            
            
            if (mod64 === 16 || mod64 === 48) return "ride";
            
            
            if (mod64 === 0) return "crash";
            
            
            if (mod16 % 2 === 1) return "hihat";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 % 4 === 0) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare";
            
            
            if (mod32 === 30) return "tomHigh";
            if (mod32 === 31) return "tomMid";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 10) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 4 || mod16 === 8 || mod16 === 11) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare";
            
            
            if (mod64 === 15) return "tomLow";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 47) return "tomHigh";
            if (mod64 === 63) return "tomMid"; 
            
            
            if (mod64 === 0 || mod64 === 32) return "crash"; 
            if (mod16 === 9) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 4 || mod16 === 8 || mod16 === 12) return "kick";
            
            
            if (mod16 === 4) return "clap"; 
            if (mod16 === 12) return "snare";
            
            
            if (mod32 === 14) return "tomHigh";
            if (mod32 === 15) return "tomMid";
            if (mod32 === 30) return "tomLow";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 10) return "ride"; 
            
            
            if (mod16 === 1 || mod16 === 3 || mod16 === 5 || mod16 === 9 || mod16 === 13 || mod16 === 15) return "hihat";
            return null;
          });
        }
        break;
          case "dubstep":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 12) return "kick";
            if (mod16 === 8) return "snare";
            
            
            if (mod64 === 28) return "clap"; 
            
            
            if (mod64 === 30) return "tomHigh";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 32) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 40) return "ride"; 
            
            
            if (mod16 % 2 === 1 && mod16 !== 7 && mod16 !== 15) return "hihat";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 6 || mod16 === 11) return "kick";
            
            
            if (mod16 === 4) return "snare";
            if (mod16 === 12) return "clap"; 
            
            
            if (mod32 === 7) return "tomHigh";
            if (mod32 === 15) return "tomMid";
            if (mod32 === 23) return "tomLow";
            if (mod32 === 31) return "tomLow";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 10) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 9) return "kick";
            
            
            if (mod16 === 8) return "snare"; 
            if (mod64 === 56) return "clap"; 
            
            
            if (mod64 === 14) return "tomLow";
            if (mod64 === 30) return "tomMid";
            if (mod64 === 46) return "tomHigh";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 24) return "ride"; 
            
            
            if (mod16 === 4 || mod16 === 12) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 7 || mod16 === 11) return "kick";
            
            
            if (mod16 === 4) return "snare";
            if (mod16 === 12) return "clap"; 
            
            
            if (mod64 === 22) return "tomHigh";
            if (mod64 === 23) return "tomMid";
            if (mod64 === 24) return "tomLow";
            if (mod64 === 25) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 10) return "ride"; 
            
            
            if ([1, 3, 5, 9, 13, 15].includes(mod16)) return "hihat";
            return null;
          });
        }
        break;
          case "trap":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare"; 
            
            
            if (mod32 === 14) return "tomHigh";
            if (mod32 === 15) return "tomMid";
            if (mod32 === 30) return "tomLow";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod32 === 24) return "ride"; 
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 7 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare"; 
            
            
            if (mod64 === 31) return "tomHigh";
            if (mod64 === 47) return "tomMid";
            if (mod64 === 63) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 32) return "ride"; 
            
            
            return "hihat"; 
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 5 || mod16 === 11) return "kick";
            
            
            if (mod16 === 8) return "clap";
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod32 === 22) return "tomHigh";
            if (mod32 === 23) return "tomMid";
            if (mod32 === 24) return "tomLow";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod32 === 16) return "ride"; 
            
            
            if (mod16 % 2 === 0) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 6 || mod16 === 10 || mod16 === 13) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare"; 
            
            
            if (mod64 === 22) return "tomHigh";
            if (mod64 === 38) return "tomMid";
            if (mod64 === 54) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 9) return "ride"; 
            
            
            if (mod16 % 2 === 1) return "hihat";
            return null;
          });
        }
        break;
          case "reggae":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 8) return "kick"; 
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod32 === 20) return "clap";
            
            
            if (mod32 === 30) return "tomHigh";
            if (mod32 === 31) return "tomMid";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod32 === 16) return "ride"; 
            
            
            if (mod16 % 2 === 1) return "hihat"; 
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod64 === 24) return "clap"; 
            
            
            if (mod64 === 30) return "tomHigh";
            if (mod64 === 46) return "tomMid";
            if (mod64 === 62) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 32) return "ride"; 
            
            
            if (mod16 % 2 === 1) return "hihat"; 
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 7 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4) return "snare";
            if (mod16 === 12) return "clap"; 
            
            
            if (mod64 === 15) return "tomHigh";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 47) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 9) return "ride"; 
            
            
            if (mod16 % 2 === 1) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 10) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "snare";
            
            
            if (mod32 === 22) return "clap";
            
            
            if (mod16 === 9) return "tomLow"; 
            if (mod32 === 23) return "tomMid";
            if (mod32 === 31) return "tomHigh";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 15) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 14) return "hihat";
            return null;
          });
        }
        break;
          case "house":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 % 4 === 0) return "kick";
            
            
            if (mod16 === 4 || mod16 === 12) return "clap";
            
            
            if (mod64 === 28) return "snare";
            
            
            if (mod64 === 30) return "tomHigh";
            if (mod64 === 31) return "tomMid";
            if (mod64 === 32) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod64 === 16 || mod64 === 48) return "ride"; 
            
            
            if (i % 4 === 2) return "hihat";
            if (i % 2 === 1) return "hihat"; 
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 % 4 === 0) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare";
            
            
            if (mod64 === 22) return "tomHigh";
            if (mod64 === 38) return "tomMid";
            if (mod64 === 54) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 10) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod32 = i % 32;
            
            
            if (mod16 === 0 || mod16 === 4 || mod16 === 9 || mod16 === 12) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare";
            
            
            if (mod32 === 7) return "tomLow";
            if (mod32 === 23) return "tomMid";
            if (mod32 === 31) return "tomHigh";
            
            
            if (mod32 === 0) return "crash"; 
            if (mod16 === 9) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 14) return "hihat";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod16 = i % 16;
            const mod64 = i % 64;
            
            
            if (mod16 === 0 || mod16 === 6 || mod16 === 11) return "kick";
            
            
            if (mod16 === 4) return "clap";
            if (mod16 === 12) return "snare";
            
            
            if (mod64 === 22) return "tomHigh";
            if (mod64 === 23) return "tomMid";
            if (mod64 === 24) return "tomLow";
            
            
            if (mod64 === 0) return "crash"; 
            if (mod16 === 8) return "ride"; 
            
            
            if (mod16 === 2 || mod16 === 6 || mod16 === 10 || mod16 === 13 || mod16 === 15) return "hihat";
            return null;
          });
        }
        break;
          case "ambient":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod32 = i % 32;
            const mod64 = i % 64;
            
            
            if (mod32 === 0) return "kick";
            
            
            if (mod32 === 8 || mod32 === 24) return "ride";
            
            
            if (mod32 === 16) return "tomLow";
            if (mod64 === 40) return "tomMid";
            if (mod64 === 56) return "tomHigh";
            
            
            if (mod64 === 20) return "snare";
            
            
            if (mod64 === 12) return "clap";
            
            
            if (mod64 === 36 || mod64 === 52) return "hihat";
            
            
            if (mod64 === 0) return "crash";
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod32 = i % 32;
            const mod64 = i % 64;
            
            
            if (mod32 === 0) return "kick";
            
            
            if (mod32 === 16) return "tomLow";
            if (mod64 === 48) return "tomMid";
            if (mod64 === 56) return "tomHigh";
            
            
            if (mod32 === 8 || mod32 === 24) return "ride";
            
            
            if (mod64 === 32) return "snare";
            
            
            if (mod64 === 16) return "clap";
            
            
            if (mod32 === 12 || mod32 === 28) return "hihat";
            
            
            if (mod64 === 0) return "crash";
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod24 = i % 24;
            const mod48 = i % 48;
            
            
            if (mod24 === 0) return "kick";
            
            
            if (mod24 === 12) return "tomLow";
            if (mod24 === 18) return "tomMid";
            if (mod48 === 30) return "tomHigh";
            
            
            if (mod24 === 6) return "ride";
            
            
            if (mod48 === 36) return "snare";
            
            
            if (mod48 === 42) return "clap";
            
            
            if (mod48 === 9 || mod48 === 33) return "hihat";
            
            
            if (mod48 === 0) return "crash";
            return null;
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod48 = i % 48;
            const mod96 = i % 96;
            
            
            if (mod48 === 0) return "kick";
            
            
            if (mod48 === 24) return "tomLow";
            if (mod96 === 36) return "tomMid";
            if (mod96 === 60) return "tomHigh";
            
            
            if (mod48 === 12 || mod48 === 36) return "ride";
            
            
            if (mod96 === 72) return "snare";
            
            
            if (mod96 === 84) return "clap";
            
            
            if (mod96 === 48 || mod96 === 90) return "hihat";
            
            
            if (mod48 === 18) return "crash";
            return null;
          });
        }
        break;
          case "waltz":
        if (variationNum === 1) {
          
          pattern = pattern.map((_, i) => {
            const mod3 = i % 3;
            const mod12 = i % 12; 
            const mod24 = i % 24; 
            
            
            if (mod3 === 0) return "kick";
            
            
            if (mod3 === 1 || mod3 === 2) return "hihat";
            
            
            if (mod12 === 3) return "snare";
            
            
            if (mod24 === 12) return "clap";
            
            
            if (mod24 === 20) return "tomHigh";
            if (mod24 === 22) return "tomMid";
            if (mod24 === 23) return "tomLow";
            
            
            if (mod24 === 0) return "crash"; 
            if (mod12 === 6) return "ride"; 
            
            return null;
          });
        } else if (variationNum === 2) {
          
          pattern = pattern.map((_, i) => {
            const mod3 = i % 3;
            const mod12 = i % 12; 
            const mod24 = i % 24; 
            
            
            if (mod3 === 0) return "kick";
            
            
            if (mod3 === 1) return "hihat";
            
            
            if (mod3 === 2) return "snare";
            
            
            if (mod24 === 18) return "tomHigh";
            if (mod24 === 21) return "tomMid";
            if (mod24 === 22) return "tomLow";
            
            
            if (mod24 === 15) return "clap";
            
            
            if (mod24 === 0) return "crash"; 
            if (mod12 === 6) return "ride"; 
            
            return null;
          });
        } else if (variationNum === 3) {
          
          pattern = pattern.map((_, i) => {
            const mod12 = i % 12; 
            const mod24 = i % 24; 
            
            
            if (mod12 === 0 || mod12 === 6) return "kick";
            
            
            if (mod12 === 3 || mod12 === 9) return "snare";
            
            
            if (mod24 === 15) return "clap";
            
            
            if (mod24 === 17) return "tomHigh";
            if (mod24 === 19) return "tomMid";
            if (mod24 === 21) return "tomLow";
            
            
            if (mod24 === 0) return "crash"; 
            
            
            return "ride";
          });
        } else {
          
          pattern = pattern.map((_, i) => {
            const mod6 = i % 6; 
            const mod24 = i % 24; 
            
            
            if (mod6 === 0) return "kick";
            
            
            if (mod6 === 3) return "snare";
            
            
            if (mod6 === 1 || mod6 === 4) return "tomHigh";
            if (mod6 === 5) return "tomLow";
            
            
            if (mod24 === 9 || mod24 === 21) return "clap";
            
            
            if (mod6 === 2) return "hihat";
            
            
            if (mod24 === 0) return "crash"; 
            if (mod24 === 12) return "ride"; 
            
            return null;
          });
        }
        break;

      case "drumless":
        
        pattern = Array(patternLength).fill(null);
        break;    
  
      default:
        
        pattern = Array(patternLength).fill(null);
        break;
    }
  
    
    
    
    
    
  
    return pattern;
  }
  