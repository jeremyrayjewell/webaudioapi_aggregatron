# WebAudio API Aggregatron

A collection of experimental web audio applications and synthesizer tools, built with React, Three.js, and vanilla JavaScript. Each project explores unique aspects of sound synthesis, algorithmic music, and interactive audio experiences for the web.
Made for a creative coding project entitled [Aggregatron Records](https://aggregatron.neocities.org/).

## 🚀 Projects Included

- **Synth Aggregatrex 5000** (`/synth_aggregatrex5000`):
  - Feature-rich WebAudioAPI synthesizer with touch, QWERTY, and midi-controller support and mobile optimization.
  - [Live](https://aggregatron.netlify.app/synth_aggregatrex5000/)
- **Synth Aggregatrex 6000 (3D)** (`/synth_aggregatrex6000`):
  - Three.js-powered 3D synthesizer interface for immersive sound design in WebAudioAPI.
- **Melody Maker Ordnung** (`/melodymaker_ordnung`):
  - Algorithmic melody generation and visualization tool organized by Big-O runtime complexity.
  - [Live](https://aggregatron.netlify.app/melodymaker_ordnung/)
  - [Musical Sample](https://www.youtube.com/watch?v=o1fNAHCQzuI)
- **Sample Segmenter Piecework** (`/samplesegmenter_piecework`):
  - Audio sample segmentation utility utilizing WebAuioAPI.
  - [Live](https://bright-capybara-8e9e2c.netlify.app/)
- **Preimage Collider Hash-to-Music** (`/preimage_collider_hash-to-music`):
  - Converts hash values into musical compositions using vanilla JS and WebAudioAPI for algorithmically generated wav files.
  - [Live](https://aggregatron.netlify.app/preimage_collider_hash-to-music/)
  - [Musical Sample](https://www.youtube.com/watch?v=L5yGoGJEjTU)

## 🗂️ Repository Structure

```
webaudioapi_aggregatron/
├── synth_aggregatrex5000/
├── synth_aggregatrex6000/
├── melodymaker_ordnung/
├── samplesegmenter_piecework/
├── preimage_collider_hash-to-music/
├── netlify.toml
├── README.md
└── ...
```

## 🌐 Deployment

This repo is configured for multi-app deployment on Netlify. Each project is accessible via its own subdirectory URL. See `netlify.toml` for build and routing details.

## 🛠️ Getting Started (Local Development)

1. Clone the repo:
   ```sh
   git clone https://github.com/jeremyrayjewell/webaudioapi_aggregatron.git
   cd webaudioapi_aggregatron
   ```
2. Install dependencies and run each app:
   ```sh
   cd synth_aggregatrex5000 && npm install && npm start
   # Repeat for other React apps
   ```
3. For vanilla JS app (`preimage_collider_hash-to-music`), open `index.html` in your browser.

## 📦 Build & Deploy

- To build all React apps for production:
  ```sh
  cd synth_aggregatrex5000 && npm run build
  cd synth_aggregatrex6000 && npm run build
  cd melodymaker_ordnung && npm run build
  cd samplesegmenter_piecework && npm run build
  ```
- The Netlify build process will automatically build and route all apps.

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

## 👤 Author

Jeremy Ray Jewell

---

[GitHub](https://github.com/jeremyrayjewell) | [LinkedIn](https://www.linkedin.com/in/jeremyrayjewell)
