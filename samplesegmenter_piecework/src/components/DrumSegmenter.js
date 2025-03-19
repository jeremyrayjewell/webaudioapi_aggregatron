import React, { useEffect, useState, useRef } from 'react';
import { trimLeadingSilence, detectNonSilenceSegments, removeDuplicateSegments, extractAudioSegment } from '../utils/audioUtils';
import { audioBufferToWav } from '../utils/fileUtils';
import CustomAudioPlayer from './CustomAudioPlayer.js';

function DrumSegmenter({ audioBuffer, parameters, onSegmentationComplete }) {
  const [segments, setSegments] = useState([]);
  const [wavFiles, setWavFiles] = useState([]);
  const audioRefs = useRef([]); // Store refs for all audio elements

  useEffect(() => {
    if (!audioBuffer) return;

    // Reset state when a new audioBuffer is uploaded
    setSegments([]);
    setWavFiles([]);

    const processAudio = async () => {
      const { startTime, endTime, numHits, silenceThreshold, minDuration, maxDuration } = parameters;

      console.log('Starting audio processing...');
      console.log('Parameters:', parameters);

      // Step 1: Trim leading silence
      const trimmedBuffer = trimLeadingSilence(audioBuffer, silenceThreshold);
      console.log('Trimmed Buffer Duration:', trimmedBuffer.duration);

      // Step 2: Dynamically set endTime to the full duration of the trimmed buffer if not specified
      const effectiveEndTime = endTime || trimmedBuffer.duration;
      console.log('Effective End Time:', effectiveEndTime);

      // Step 3: Extract the portion of the audio within the specified time range
      const limitedBuffer = extractAudioSegment(trimmedBuffer, startTime, effectiveEndTime);
      console.log('Limited Buffer Duration:', limitedBuffer.duration);

      // Step 4: Apply band-pass filtering
      const filteredBuffer = await applyBandPassFilter(limitedBuffer, parameters.lowerFreq, parameters.upperFreq);
      console.log('Filtered Buffer Duration:', filteredBuffer.duration);

      // Step 5: Detect segments from the filtered audio
      let detectedSegments = detectNonSilenceSegments(filteredBuffer, {
        threshold: silenceThreshold,
        minDuration: minDuration,
        maxDuration: maxDuration,
      });
      console.log('Detected Segments (before removing duplicates):', detectedSegments);

      // Step 6: Remove duplicate or overlapping segments
      detectedSegments = removeDuplicateSegments(detectedSegments, filteredBuffer, parameters.minGap);
      console.log('Detected Segments (after removing duplicates):', detectedSegments);

      // Step 7: Adjust segmentation based on user parameters
      if (numHits && detectedSegments.length > numHits) {
        detectedSegments = detectedSegments.slice(0, numHits);
      }
      console.log('Detected Segments (after applying numHits limit):', detectedSegments);

      setSegments(detectedSegments);

      // Step 8: Convert each segment to a WAV Blob
      const wavs = detectedSegments.map((segment) => {
        const segmentBuffer = extractAudioSegment(filteredBuffer, segment.start, segment.end);
        const wavBlob = audioBufferToWav(segmentBuffer);
        return {
          blob: wavBlob,
          url: URL.createObjectURL(wavBlob), // Create a Blob URL for playback
        };
      });
      setWavFiles(wavs);

      if (onSegmentationComplete) {
        onSegmentationComplete(detectedSegments);
      }

      console.log('Audio processing complete.');
    };

    processAudio();
  }, [audioBuffer, parameters, onSegmentationComplete]);

   const applyBandPassFilter = async (audioBuffer, lowerFreq, upperFreq) => {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
  
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
  
    const bandPassFilter = offlineContext.createBiquadFilter();
    bandPassFilter.type = 'bandpass';
    bandPassFilter.frequency.value = (lowerFreq + upperFreq) / 2;
    bandPassFilter.Q.value = (upperFreq - lowerFreq) / (lowerFreq + upperFreq);
  
    source.connect(bandPassFilter);
    bandPassFilter.connect(offlineContext.destination);
  
    source.start(0);
    const filteredBuffer = await offlineContext.startRendering();
    return filteredBuffer;
  };

  // Reset playback state for all audio elements
  useEffect(() => {
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0; // Reset playback position
      }
    });
  }, [segments]);

  return (
    <div className="drum-segmenter">
      <h2>segments</h2>
      
      {segments.length > 0 ? (
        <ul>
          {segments.map((segment, index) => (
            <li key={index}>
              <div className="hit-index">
                <strong>hit {index + 1} </strong> 
                start {segment.start.toFixed(2)}s, end {segment.end.toFixed(2)}s
              </div>
              {wavFiles[index] && (
  <>
    <div className="segment-container">
      {/* Custom Audio Player */}
      <CustomAudioPlayer src={wavFiles[index].url} />
  
      {/* Download Button */}
      <button
        onClick={() => {
          const { blob } = wavFiles[index];
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `hit-${index + 1}.wav`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }}
      >
        download hit {index + 1}
      </button>
    </div>
  </>
)}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'red' }}>processing...</p>
      )}
    </div>
  );
}

export default DrumSegmenter;