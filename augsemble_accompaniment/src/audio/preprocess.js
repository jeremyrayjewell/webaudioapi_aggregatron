export function audioBufferToMono(audioBuffer) {
  const { numberOfChannels, length } = audioBuffer;
  const mono = new Float32Array(length);

  for (let channel = 0; channel < numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      mono[index] += channelData[index] / numberOfChannels;
    }
  }

  return mono;
}

export function normalizeAudio(signal) {
  let peak = 0;
  for (let index = 0; index < signal.length; index += 1) {
    peak = Math.max(peak, Math.abs(signal[index]));
  }

  if (!peak) return signal.slice();

  const normalized = new Float32Array(signal.length);
  const scale = 1 / peak;
  for (let index = 0; index < signal.length; index += 1) {
    normalized[index] = signal[index] * scale;
  }
  return normalized;
}

export function prepareSignal(audioBuffer) {
  return normalizeAudio(audioBufferToMono(audioBuffer));
}

export function audioBufferSegmentToMono(audioBuffer, startSeconds, durationSeconds) {
  const safeStart = Math.max(0, startSeconds);
  const safeDuration = Math.max(1, durationSeconds);
  const startSample = Math.min(audioBuffer.length, Math.floor(safeStart * audioBuffer.sampleRate));
  const endSample = Math.min(audioBuffer.length, startSample + Math.floor(safeDuration * audioBuffer.sampleRate));
  const segmentLength = Math.max(0, endSample - startSample);
  const mono = new Float32Array(segmentLength);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let index = 0; index < segmentLength; index += 1) {
      mono[index] += channelData[startSample + index] / audioBuffer.numberOfChannels;
    }
  }

  return mono;
}

export function prepareSignalSegment(audioBuffer, startSeconds, durationSeconds) {
  return normalizeAudio(audioBufferSegmentToMono(audioBuffer, startSeconds, durationSeconds));
}

export function sliceSignalByTime(signal, sampleRate, startSeconds, durationSeconds) {
  const safeStart = Math.max(0, startSeconds);
  const safeDuration = Math.max(1, durationSeconds);
  const startSample = Math.min(signal.length, Math.floor(safeStart * sampleRate));
  const endSample = Math.min(signal.length, startSample + Math.floor(safeDuration * sampleRate));
  return signal.slice(startSample, endSample);
}
