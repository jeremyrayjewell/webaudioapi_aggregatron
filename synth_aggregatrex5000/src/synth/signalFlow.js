export const setupSignalFlow = (nodes, analyser, audioDestination) => {

  // Error handling
    if (!nodes.filter || !nodes.master || !analyser || !audioDestination) {
        console.error("Some audio nodes are undefined:", nodes);
        return;
    }

  // The filter will receive input from oscillators created later.
  // We route filter -> preGain -> waveshaper -> distortionWet
  // and also filter -> distortionDry (for mix) then both go to compressor -> master
  if (nodes.preGain && nodes.waveshaper && nodes.distortionWet && nodes.distortionDry && nodes.compressor) {
    // Safety: initialize waveshaper curve if not set
    if (!nodes.waveshaper.curve) {
      const curve = new Float32Array(2);
      curve[0] = -1; curve[1] = 1;
      nodes.waveshaper.curve = curve;
    }
    nodes.filter.connect(nodes.preGain);
    nodes.preGain.connect(nodes.waveshaper);
    nodes.waveshaper.connect(nodes.distortionWet);
    // Dry path
    nodes.filter.connect(nodes.distortionDry);
    // Merge wet + dry into compressor
    nodes.distortionWet.connect(nodes.compressor);
    nodes.distortionDry.connect(nodes.compressor);
    // Compressor to master
    nodes.compressor.connect(nodes.master);
    console.log('[signalFlow] Distortion + compressor chain connected');
  } else {
    // Fallback: direct filter to master
    nodes.filter.connect(nodes.master);
    console.warn('[signalFlow] Distortion chain unavailable, using direct filter->master path');
  }

  // Connect effects in parallel. ALL audio must go through master before destination
  nodes.reverbGain.connect(nodes.convolver);
  nodes.convolver.connect(nodes.master);
  console.log('[signalFlow] Reverb chain connected: reverbGain -> convolver -> master');
    
    // First connect all effects to master
    nodes.delay.connect(nodes.feedback);
    nodes.feedback.connect(nodes.delay);
    nodes.delay.connect(nodes.master);

    // Then connect master through analyser to destination
    nodes.master.connect(analyser);
    analyser.connect(audioDestination);
    console.log('Signal flow setup complete with filter chain.');
};