/**
 * Extracts a segment from an AudioBuffer between startTime and endTime (in seconds)
 * and returns a new AudioBuffer containing just that segment.
 *
 * @param {AudioBuffer} audioBuffer - The source AudioBuffer.
 * @param {number} startTime - The start time (in seconds) for the segment.
 * @param {number} endTime - The end time (in seconds) for the segment.
 * @returns {AudioBuffer} - A new AudioBuffer with the segment.
 */
export function extractAudioSegment(audioBuffer, startTime, endTime) {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.max(0, Math.floor(startTime * sampleRate)); // Ensure startSample is not negative
  const endSample = Math.min(audioBuffer.length, Math.floor(endTime * sampleRate)); // Ensure endSample is within bounds
  const frameCount = endSample - startSample;
  const numberOfChannels = audioBuffer.numberOfChannels;

  // Create a new AudioBuffer for the segment.
  const segmentBuffer = new AudioBuffer({
    length: frameCount,
    numberOfChannels: numberOfChannels,
    sampleRate: sampleRate,
  });

  // Copy data from each channel.
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel).subarray(startSample, endSample); // Use subarray for better performance
    segmentBuffer.copyToChannel(channelData, channel, 0);
  }

  return segmentBuffer;
}

/**
 * Trims leading silence from an AudioBuffer.
 *
 * @param {AudioBuffer} audioBuffer - The source AudioBuffer.
 * @param {number} [threshold=0.01] - The amplitude threshold for detecting silence.
 * @returns {AudioBuffer} - A new AudioBuffer without leading silence.
 */
export function trimLeadingSilence(audioBuffer, threshold = 0.01) {
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0); // Use the first channel for simplicity
  let firstNonSilentSample = 0;

  // Find the first non-silent sample
  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) > threshold) {
      firstNonSilentSample = i;
      break;
    }
  }

  // Calculate the start time in seconds
  const startTime = firstNonSilentSample / sampleRate;

  // Extract the portion of the audio without leading silence
  return extractAudioSegment(audioBuffer, startTime, audioBuffer.duration);
}

/**
 * Detects non-silent segments in an AudioBuffer.
 * This function identifies regions of the audio where the amplitude exceeds a threshold.
 *
 * @param {AudioBuffer} audioBuffer - The source AudioBuffer.
 * @param {number} [threshold=0.01] - The amplitude threshold for detecting non-silence.
 * @returns {Array} - An array of segments with start and end times (in seconds).
 */
export function detectNonSilenceSegments(audioBuffer, { threshold = 0.02, minDuration = 0.05, maxDuration = 2 }) {
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  const segments = [];
  let isSilent = true;
  let startSample = null;

  const minSamples = Math.floor(minDuration * sampleRate); // Minimum number of samples for minDuration
  const step = Math.floor(sampleRate / 250); // Check every 4ms (adjust as needed)
  
  console.log('Detecting non-silent segments...');
  console.log('Threshold:', threshold);
  console.log('Min Duration:', minDuration);
  console.log('Max Duration:', maxDuration);

  for (let i = 0; i < channelData.length; i += step) {
    const amplitude = Math.abs(channelData[i]);

    if (isSilent && amplitude > threshold) {
      // Transition from silent to non-silent
      isSilent = false;
      startSample = i;
      console.log(`Non-silent region started at sample ${startSample}`);
    } else if (!isSilent && amplitude <= threshold) {
      // Transition from non-silent to silent
      const endSample = i;
      const duration = (endSample - startSample) / sampleRate;

      console.log(`Non-silent region ended at sample ${endSample}, duration: ${duration}s`);

      if ((endSample - startSample) >= minSamples && duration <= maxDuration) {
        segments.push({
          start: startSample / sampleRate,
          end: endSample / sampleRate,
        });
        console.log(`Segment added: start=${startSample / sampleRate}s, end=${endSample / sampleRate}s`);
      }

      // Reset state
      isSilent = true;
      startSample = null;
    }
  }

  // Handle case where audio ends in a non-silent state
  if (!isSilent && startSample !== null) {
    const endSample = channelData.length;
    const duration = (endSample - startSample) / sampleRate;

    if ((endSample - startSample) >= minSamples && duration <= maxDuration) {
      segments.push({
        start: startSample / sampleRate,
        end: endSample / sampleRate,
      });
      console.log(`Final segment added: start=${startSample / sampleRate}s, end=${endSample / sampleRate}s`);
    }
  }

  console.log('Detected segments:', segments);
  return segments;
}
/**
 * Removes duplicate or overlapping segments from an array of detected segments.
 *
 * @param {Array} segments - An array of segments with start and end times (in seconds).
 * @param {AudioBuffer} audioBuffer - The source AudioBuffer for reference.
 * @param {number} [minGap=0.1] - The minimum gap (in seconds) between segments to consider them distinct.
 * @returns {Array} - A filtered array of segments.
 */
export function removeDuplicateSegments(segments, audioBuffer, minGap = 0.1) {
  const sampleRate = audioBuffer.sampleRate;
  const minGapSamples = Math.floor(minGap * sampleRate);

  return segments.filter((segment, index, array) => {
    if (index === 0) return true; // Keep the first segment
    const prevSegment = array[index - 1];
    const gap = (segment.start * sampleRate) - (prevSegment.end * sampleRate);
    return gap >= minGapSamples;
  });
}