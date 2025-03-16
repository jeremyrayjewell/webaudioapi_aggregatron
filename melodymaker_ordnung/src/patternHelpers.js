// patternHelpers.js

/**
 * Convert an array of frequencies into a step-based pattern
 * for scheduling (i.e. each frequency is assigned a step index).
 */
export function createPatternFromNotes(notes, stepsPerNote = 1) {
    let pattern = [];
    let currentStep = 0;
    notes.forEach((freq) => {
      pattern.push({
        step: currentStep,
        freq,
        durationInSteps: stepsPerNote,
      });
      currentStep += stepsPerNote;
    });
    return pattern;
  }
  