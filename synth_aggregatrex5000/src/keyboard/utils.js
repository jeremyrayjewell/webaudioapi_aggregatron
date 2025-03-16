export const midiNoteToFrequency = (note) => {
    const baseFreq = 440; // Frequency of A4
    const freq = baseFreq * Math.pow(2, (note - 69) / 12);
    return Math.round(freq * 100) / 100; 
  };
  