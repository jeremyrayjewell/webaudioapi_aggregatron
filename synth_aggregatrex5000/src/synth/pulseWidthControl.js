export const setPulseWidth = (oscillator, width) => {
  if (oscillator.type !== 'square') return;

  // Ensure width is between 0 and 1
  const pulseWidth = Math.max(0.1, Math.min(0.9, width));

  const real = [];
  const imag = [];

  // Number of harmonics
  const numHarmonics = 10;

  for (let n = 1; n <= numHarmonics; n++) {
    if (n % 2 === 0) continue; // Only odd harmonics for square-like waves
    const harmonic = (4 / Math.PI) * (1 / n) * Math.sin(n * Math.PI * pulseWidth);
    real.push(0);
    imag.push(harmonic);
  }

  const periodicWave = oscillator.context.createPeriodicWave(
    new Float32Array(real),
    new Float32Array(imag)
  );

  oscillator.setPeriodicWave(periodicWave); // Apply the custom waveform
};