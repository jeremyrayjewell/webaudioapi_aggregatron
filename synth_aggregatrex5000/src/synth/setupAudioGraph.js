// src/synth/setupAudioGraph.js
export const setupAudioGraph = (ctx) => {
  const nodes = {
    master: ctx.createGain(),
    reverbGain: ctx.createGain(),
    filter: ctx.createBiquadFilter(),
    delay: ctx.createDelay(),
    feedback: ctx.createGain(),
    panner: ctx.createStereoPanner(),
    osc1: ctx.createOscillator(),  //  Make sure osc1 is created here!
    gain1: ctx.createGain(),
    convolver: ctx.createConvolver(),
    analyser: ctx.createAnalyser(),
  };

  // Check for undefined nodes
  if (!nodes.master || !nodes.filter || !nodes.osc1) {
    console.error("Critical audio nodes are undefined:", nodes);
  }

  // Configure filter
  nodes.filter.type = 'lowpass';
  nodes.filter.frequency.value = 20000;
  nodes.filter.Q.value = 0;

  // Other default settings
  nodes.master.gain.value = 0.8;
  nodes.reverbGain.gain.value = 0.3;
  nodes.feedback.gain.value = 0.4;


  return nodes;
};