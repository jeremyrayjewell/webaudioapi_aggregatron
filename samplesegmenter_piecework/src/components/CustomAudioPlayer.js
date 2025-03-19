import React, { useRef, useState } from 'react';

const CustomAudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false); // Reset the button to "Play" when the audio ends
  };

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} src={src} onEnded={handleAudioEnd} />
      <button onClick={togglePlay}>
        {isPlaying ? '⏸' : '⏵'}
      </button>
    </div>
  );
};

export default CustomAudioPlayer;