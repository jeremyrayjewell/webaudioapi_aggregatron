# AggregaVox Web Vocoder

AggregaVox is a realtime browser vocoder built with the Web Audio API.

It takes microphone input, analyzes it in multiple bands, and uses that energy to shape an internal carrier synth in realtime.

## Features

- Realtime vocoder
- Internal carrier synth
- Carrier note quantization
- Headset mode
- Live spectrometer
- Retro panel UI

## Files

- `index.html` - markup
- `styles.css` - styling
- `app.js` - audio engine and UI logic

## Notes

- No build step
- No framework
- Best with a close mic or headset
- Headphones help reduce bleed
