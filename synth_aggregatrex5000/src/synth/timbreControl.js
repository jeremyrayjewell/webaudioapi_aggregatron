// Generalized timbre shaping for basic waveforms.
// timbre: 0..1
// Strategy:
//  - sine: crossfade sine -> mildly bright (add 3rd & 5th partials) -> richer (add 7th, 9th)
//  - square: map to duty cycle (0.1..0.9)
//  - triangle: skew harmonics by boosting higher odd partials with timbre
//  - sawtooth: progressively emphasize upper harmonics
// Returns nothing; mutates oscillator via setPeriodicWave.

export function applyTimbre(oscillator, type, timbre) {
  if (!oscillator || typeof oscillator.context?.createPeriodicWave !== 'function') return;
  const t = Math.min(1, Math.max(0, timbre));

  // Special case: use native if timbre near 0 for performance
  if (t === 0) {
    oscillator.type = type; // revert to native simple wave
    return;
  }

  const ctx = oscillator.context;
  // We'll build arrays for harmonics; length N+1 where index 0 ignored.
  const harmonics = 32; // compromise for brightness vs CPU
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);

  if (type === 'sine') {
    // Begin pure sine, then add a few odd partials scaled by t
    real[1] = 0; imag[1] = 1; // fundamental
    const partials = [3,5,7,9];
    partials.forEach((n, i) => {
      const weight = Math.pow(t, 0.6) * (1 / n) * (1 - i * 0.15);
      imag[n] = weight;
    });
  } else if (type === 'square') {
    // Duty cycle mapping 0.1..0.9
    const duty = 0.1 + t * 0.8;
    for (let n = 1; n < harmonics; n += 2) {
      // Fourier series for pulse of width duty
      imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
    }
  } else if (type === 'triangle') {
    // Triangle odd harmonics with 1/n^2 amplitude, shape boosts higher ones
    for (let n = 1; n < harmonics; n += 2) {
      const base = 1 / (n * n);
      const boost = 1 + t * (n / harmonics) * 4; // emphasize higher partials
      // Alternate sign
      const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
      imag[n] = sign * base * boost;
    }
  } else if (type === 'sawtooth' || type === 'saw') {
    // Saw has all harmonics with 1/n; timbre pushes more energy to highs
    for (let n = 1; n < harmonics; n++) {
      const base = 1 / n;
      const tilt = Math.pow(n / harmonics, t); // more tilt as t grows
      imag[n] = base * (0.5 + 0.5 * tilt);
    }
  } else {
    // Unknown type: bail out to native
    oscillator.type = type;
    return;
  }

  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  oscillator.setPeriodicWave(wave);
}
