export const setupSignalFlow = (nodes, analyser, audioDestination) => {

  // Error handling
    if (!nodes.osc1 || !nodes.gain1 || !nodes.filter || !analyser || !audioDestination) {
        console.error("Some audio nodes are undefined:", nodes);
        return;
    }

    // Connect the oscillator path, ALWAYS through the filter, then to analyser
    nodes.osc1.connect(nodes.gain1);
    nodes.gain1.connect(nodes.filter); // Always connect through the filter
    nodes.filter.connect(analyser);
    analyser.connect(nodes.master);

    // Connect effects in parallel. ALL audio must go through master before destination
    nodes.reverbGain.connect(nodes.convolver);
    nodes.convolver.connect(nodes.master);

    nodes.delay.connect(nodes.feedback);
    nodes.feedback.connect(nodes.delay);
    nodes.delay.connect(nodes.master);

    // Other effects, also connect to master
    nodes.master.connect(audioDestination);
    console.log('Signal flow setup complete with filter chain.');
};