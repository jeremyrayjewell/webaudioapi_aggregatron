export const configureFilter = (filter, type, cutoff, resonance) => {
    if (!filter) {
        console.error('Filter node is undefined in configureFilter');
        return;
    }

    // Gracefully handle a UI 'none' option by using 'allpass'
    const appliedType = type === 'none' ? 'allpass' : type;
    try {
        filter.type = appliedType;
    } catch (e) {
        console.warn(`Unsupported filter type '${appliedType}', defaulting to 'lowpass'`);
        filter.type = 'lowpass';
    }

    // Clamp cutoff within valid range
    const safeCutoff = Math.min(Math.max(cutoff, 20), 20000);
    filter.frequency.setValueAtTime(safeCutoff, filter.context.currentTime);
    filter.Q.setValueAtTime(Math.max(0, resonance), filter.context.currentTime);

    console.log('Filter configured:', { type: filter.type, frequency: safeCutoff, Q: filter.Q.value });
};