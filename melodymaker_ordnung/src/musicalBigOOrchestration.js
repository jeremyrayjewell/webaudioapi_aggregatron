import { createPatternFromNotes } from "./patternHelpers.js";

export function rebuildPlaybackBuffers({
  algorithmNotesRef,
  patternByStepRef,
  rhythmPatternRef,
  algoStepsRef,
  drumVariation,
  generateDrumPattern,
}) {
  const pattern = createPatternFromNotes(algorithmNotesRef.current, 1);
  patternByStepRef.current = Array.from({ length: pattern.length }, () => []);
  pattern.forEach((noteItem) => {
    if (noteItem && noteItem.freq != null) {
      patternByStepRef.current[noteItem.step].push(noteItem);
    }
  });
  rhythmPatternRef.current = generateDrumPattern(
    pattern.length,
    drumVariation,
    { notes: algorithmNotesRef.current, steps: algoStepsRef.current }
  );
}

export function consumeAlgorithmStream({
  algorithmStreamRef,
  algorithmStreamDoneRef,
  algorithmNotesRef,
  algoStepsRef,
  rebuildPlaybackBuffers,
  minimumNotes = 1,
  maxChunks = 8,
}) {
  if (!algorithmStreamRef.current || algorithmStreamDoneRef.current) return false;

  let chunksConsumed = 0;
  let notesAdded = 0;
  let changed = false;

  while (chunksConsumed < maxChunks && notesAdded < minimumNotes) {
    const nextChunk = algorithmStreamRef.current.next();
    if (nextChunk.done) {
      algorithmStreamDoneRef.current = true;
      break;
    }

    const chunk = nextChunk.value || {};
    if (Array.isArray(chunk.notes) && chunk.notes.length > 0) {
      algorithmNotesRef.current.push(...chunk.notes);
      notesAdded += chunk.notes.length;
      changed = true;
    }
    if (Array.isArray(chunk.steps) && chunk.steps.length > 0) {
      algoStepsRef.current.push(...chunk.steps);
      changed = true;
    }
    chunksConsumed++;
  }

  if (changed) {
    rebuildPlaybackBuffers();
  }

  return changed;
}

export function setupAlgorithmSession({
  algorithmEntry,
  algorithmData,
  stopClock,
  displayedAlgoStepsRef,
  currentAlgorithmEntryRef,
  currentAlgoRef,
  algoStepsRef,
  algorithmNotesRef,
  algorithmStreamRef,
  algorithmStreamDoneRef,
  setActiveVerificationLines,
  describeAlgorithmEntry,
  stepRef,
  consumeAlgorithmStream,
  rebuildPlaybackBuffers,
  drawPseudocodeCanvas,
  drawSourcePanel,
  drawAlgorithmCanvas,
  drawDrumGrid,
  drawAudioCanvas,
  rhythmPatternRef,
  startClock,
}) {
  stopClock();
  displayedAlgoStepsRef.current = [];
  drawPseudocodeCanvas();
  drawSourcePanel();
  drawAlgorithmCanvas("", []);

  setTimeout(() => {
    currentAlgorithmEntryRef.current = algorithmEntry;
    currentAlgoRef.current = algorithmEntry.meta;
    algoStepsRef.current = [...(algorithmData.steps || [])];
    algorithmNotesRef.current = [...(algorithmData.notes || [])];
    algorithmStreamRef.current = algorithmData.stream || null;
    algorithmStreamDoneRef.current = !algorithmData.stream;
    setActiveVerificationLines(describeAlgorithmEntry(algorithmEntry));
    stepRef.current = 0;

    if (algorithmStreamRef.current) {
      consumeAlgorithmStream(24, 24);
    } else {
      rebuildPlaybackBuffers();
    }

    drawPseudocodeCanvas();
    drawSourcePanel();
    drawAlgorithmCanvas("", []);
    drawDrumGrid(rhythmPatternRef.current, -1);
    drawAudioCanvas([]);

    requestAnimationFrame(() => {
      startClock();
    });
  }, 100);
}

export function stopPlaybackSession({
  currentAlgorithmEntryRef,
  currentAlgoRef,
  stopClock,
  algorithmNotesRef,
  algorithmStreamRef,
  algorithmStreamDoneRef,
  patternByStepRef,
  rhythmPatternRef,
  algoStepsRef,
  displayedAlgoStepsRef,
  setActiveVerificationLines,
  describeAlgorithmEntry,
  drawAudioCanvas,
  drawPseudocodeCanvas,
  drawSourcePanel,
  drawAlgorithmCanvas,
  drawDrumGrid,
}) {
  currentAlgorithmEntryRef.current = null;
  currentAlgoRef.current = null;
  stopClock();
  algorithmNotesRef.current = [];
  algorithmStreamRef.current = null;
  algorithmStreamDoneRef.current = true;
  patternByStepRef.current = [];
  rhythmPatternRef.current = [];
  algoStepsRef.current = [];
  displayedAlgoStepsRef.current = [];
  setActiveVerificationLines(describeAlgorithmEntry(null));
  drawAudioCanvas([]);
  drawPseudocodeCanvas();
  drawSourcePanel();
  drawAlgorithmCanvas("", []);
  drawDrumGrid([], -1);
}
