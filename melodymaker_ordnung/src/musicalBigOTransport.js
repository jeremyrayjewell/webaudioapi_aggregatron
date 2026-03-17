export function stopTransportClock({
  clockIdRef,
  visualClockIdRef,
  displayedAlgoStepsRef,
  drawAlgorithmCanvas,
  drawPseudocodeCanvas,
  drawSourcePanel,
  drawDrumGrid,
}) {
  if (clockIdRef.current) {
    clearInterval(clockIdRef.current);
    clockIdRef.current = null;
  }

  if (visualClockIdRef.current) {
    clearInterval(visualClockIdRef.current);
    visualClockIdRef.current = null;
  }

  drawAlgorithmCanvas("", displayedAlgoStepsRef.current);
  drawPseudocodeCanvas();
  drawSourcePanel();
  drawDrumGrid([], -1);
}

export function startTransportClock({
  audioCtx,
  bpm,
  ticksPerBeat,
  patternByStepRef,
  rhythmPatternRef,
  algorithmStreamRef,
  algorithmStreamDoneRef,
  clockIdRef,
  visualClockIdRef,
  nextNoteTimeRef,
  scheduledStepRef,
  transportStartTimeRef,
  tickDurationRef,
  lastVisualStepRef,
  drumGains,
  playNote,
  playDrum,
  consumeAlgorithmStream,
  updateVisualsForStep,
  stopClock,
}) {
  stopClock();

  if (!audioCtx || patternByStepRef.current.length === 0) return;

  const secondsPerBeat = 60 / bpm;
  const tickDuration = secondsPerBeat / ticksPerBeat;
  const lookAheadMs = 50;
  const scheduleAheadTime = 0.35;

  scheduledStepRef.current = 0;
  transportStartTimeRef.current = audioCtx.currentTime + 0.1;
  nextNoteTimeRef.current = transportStartTimeRef.current;
  tickDurationRef.current = tickDuration;
  lastVisualStepRef.current = -1;

  const scheduleStep = (step, scheduledTime) => {
    const currentPatternLength = patternByStepRef.current.length;
    if (currentPatternLength === 0) return;
    const wrappedStep = step % currentPatternLength;
    const notesToPlay = patternByStepRef.current[wrappedStep] || [];

    notesToPlay.forEach((noteItem) => {
      playNote(noteItem.freq, scheduledTime, tickDuration * 0.9);
    });

    const drumStep = rhythmPatternRef.current[wrappedStep];
    if (drumStep) {
      playDrum(audioCtx, drumStep, 1, drumGains[drumStep], scheduledTime);
    }
  };

  const scheduler = () => {
    const currentPatternLength = patternByStepRef.current.length;
    if (algorithmStreamRef.current && !algorithmStreamDoneRef.current) {
      const remainingSteps = currentPatternLength - scheduledStepRef.current;
      if (remainingSteps < 16) {
        consumeAlgorithmStream(16, 12);
      }
    }

    if (patternByStepRef.current.length === 0) return;

    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      const currentStep = scheduledStepRef.current;
      scheduleStep(currentStep, nextNoteTimeRef.current);
      nextNoteTimeRef.current += tickDuration;
      scheduledStepRef.current = currentStep + 1;
    }
  };

  scheduler();
  clockIdRef.current = setInterval(scheduler, lookAheadMs);
  visualClockIdRef.current = setInterval(() => {
    if (!audioCtx || tickDurationRef.current <= 0) return;
    const elapsed = audioCtx.currentTime - transportStartTimeRef.current;
    if (elapsed < 0) return;

    const visualStep = Math.floor(elapsed / tickDurationRef.current);
    if (visualStep === lastVisualStepRef.current) return;

    lastVisualStepRef.current = visualStep;
    updateVisualsForStep(visualStep);
  }, 50);
}
