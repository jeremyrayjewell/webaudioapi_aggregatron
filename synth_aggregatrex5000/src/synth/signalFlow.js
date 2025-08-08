export const setupSignalFlow = (nodes, analyser, audioDestination) => {

  // Error handling
    if (!nodes.filter || !nodes.master || !analyser || !audioDestination) {
        console.error("Some audio nodes are undefined:", nodes);
        return;
    }

    // The filter will receive input from oscillators created later
    nodes.filter.connect(nodes.master);

    // Connect effects in parallel. ALL audio must go through master before destination
    nodes.reverbGain.connect(nodes.convolver);
    nodes.convolver.connect(nodes.master);
    
    // First connect all effects to master
    nodes.delay.connect(nodes.feedback);
    nodes.feedback.connect(nodes.delay);
    nodes.delay.connect(nodes.master);

    // Then connect master through analyser to destination
    nodes.master.connect(analyser);
    analyser.connect(audioDestination);
    console.log('Signal flow setup complete with filter chain.');
};