import React, { useEffect } from 'react';

function AudioProcessor({ file, onAudioProcessed, onError }) {
  useEffect(() => {
    if (!file) return;
    
    const processFile = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        onAudioProcessed(audioBuffer);
      } catch (error) {
        console.error(error);
        if (onError) onError('Error processing audio file.');
      }
    };

    processFile();
  }, [file, onAudioProcessed, onError]);

  // This component does not render any UI.
  return null;
}

export default AudioProcessor;
