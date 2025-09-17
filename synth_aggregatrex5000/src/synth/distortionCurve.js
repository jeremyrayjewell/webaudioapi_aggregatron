// Generates a waveshaper curve for distortion.
// drive: 0..1 (we internally map to a harsher amount)
export function makeDistortionCurve(drive = 0.5, samples = 2048) {
  const k = drive * 100; // scale for intensity
  const curve = new Float32Array(samples);
  // removed unused _deg
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1; // -1..1
    // Arctangent style shaping (soft clipping)
    curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
  }
  return curve;
}

export function applyDistortionCurve(waveshaper, drive) {
  if (!waveshaper) return;
  waveshaper.curve = makeDistortionCurve(drive);
  waveshaper.oversample = '4x';
}
