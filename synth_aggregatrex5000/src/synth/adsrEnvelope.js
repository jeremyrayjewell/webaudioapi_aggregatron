export const applyADSR = (gainNode, adsr, amplitude, audioContext) => {
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(amplitude, now + adsr.attack);
  gainNode.gain.linearRampToValueAtTime(adsr.sustain * amplitude, now + adsr.attack + adsr.decay);
};