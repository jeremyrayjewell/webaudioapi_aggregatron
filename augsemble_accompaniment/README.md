# Augsemble

Analyze. Extract. Reconstruct.

Augsemble is a browser-based DSP portfolio project built with vanilla JavaScript and the Web Audio API. It accepts an uploaded WAV or MP3 file, estimates tempo, tonal center, and a monophonic melody line, then resynthesizes the result with oscillator voices and procedural drums.

## Features

- Client-side audio decoding with `AudioContext.decodeAudioData`
- Mono fold-down and amplitude normalization
- Energy-based BPM detection with interval histogram voting
- Chroma-style key and scale detection using Krumhansl-Schmuckler profiles
- Autocorrelation-based pitch tracking with MIDI conversion
- Melody extraction with note grouping and rhythmic quantization
- Oscillator synth voice with ADSR envelope
- Lookahead note scheduler and procedural 4/4 drums
- Canvas debug views for waveform, pitch timeline, and beat markers
- Local analysis save/load via JSON export and browser storage restore

## Architecture

- `src/audio`: decoding and preprocessing
- `src/analysis`: BPM, key, pitch, and melody extraction
- `src/synthesis`: synth voice, drums, and transport scheduler
- `src/utils`: math and MIDI helpers
- `src/app.js`: UI wiring, orchestration, and debug rendering

## Running

Serve the folder with a small static server and open it in Chrome or Edge.

- `npx serve .`
- `python -m http.server`

Then open `index.html`, upload a file, click Analyze, and use Play/Stop to audition the reconstructed result.

You can also save an analysis result to a local JSON file and reload it later without re-running audio analysis. Saved files include the analysis, visualization state, and current modulation/playback control values. In supported browsers, Augsemble opens a native save dialog so you can choose the filename and destination.

## Notes

- Melody extraction is approximate and works best on sparse or lead-dominant material.
- Tempo and key estimation prioritize clarity and readability over maximum accuracy.
- Audio playback starts only after user interaction to satisfy browser autoplay policies.
