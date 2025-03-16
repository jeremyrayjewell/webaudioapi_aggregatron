export const configureFilter = (filter, type, cutoff, resonance) => {
    if (!filter) { // Error handling
        console.error("Filter node is undefined in configureFilter");
        return;
    }

    filter.type = type; // Set type
    filter.frequency.value = cutoff; // Frequency in Hz
    filter.Q.value = resonance; // Resonance (Q)

    console.log("Filter configured:", filter.type, filter.frequency.value, filter.Q.value);
};