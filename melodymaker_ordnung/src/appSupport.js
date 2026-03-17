export function getViewportFlags(viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024) {
  return {
    isMobile: viewportWidth < 666,
    isSmallMobile: viewportWidth < 415,
  };
}

export function createAudioSetup(audioContextClass) {
  if (!audioContextClass) {
    return { audioCtx: null, analyser: null };
  }

  const audioCtx = new audioContextClass();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.8;
  analyser.connect(audioCtx.destination);

  return { audioCtx, analyser };
}
