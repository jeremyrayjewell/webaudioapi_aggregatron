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
  