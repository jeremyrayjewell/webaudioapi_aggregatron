import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Import the CSS file
import ThreeBackground from './components/ThreeBackground';
import DrumSegmenter from './components/DrumSegmenter';
import DrumControls from './components/DrumControls';

function App() {
  const [showContent, setShowContent] = useState(false); // State to control visibility
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [parameters, setParameters] = useState({
    startTime: 0,
    endTime: 60,
    lowerFreq: 20,
    upperFreq: 6000,
    numHits: 15,
    minGap: 0.1,
    minDuration: 0.5,
    maxDuration: 1.75,
    silenceThreshold: 0.0001,
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Show content after 1 second
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  const handleFileChange = async (file) => {
    setError('');
    if (file && (file.type === 'audio/wav' || file.type === 'audio/mpeg' || file.type === 'audio/mp4')) {
      setFile(file);

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedAudio);
      } catch (err) {
        console.error(err);
        setError('Error processing audio file. Your browser may not support this format.');
      }
    } else {
      setError('Please upload a valid WAV, MP3, or MP4 file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedAudio);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError('Error accessing microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      <ThreeBackground />
      <div className={`fade-in ${showContent ? 'show' : ''}`}>
        <div className="wrapper">
          <div className="container">
            {/* File Upload, Drag-and-Drop, and Recording */}
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: '2px dashed #007bff',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1rem',
                cursor: 'pointer',
              }}
            >
              <p>drag and drop a wav, mp3, or mp4 file here, or click to upload</p>
              <input
                type="file"
                accept="audio/wav,audio/mpeg,audio/mp4"
                onChange={(e) => handleFileChange(e.target.files[0])}
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#007bff' }}>
                browse files
              </label>
              <div style={{ marginTop: '1rem' }}>
                {!isRecording ? (
                  <button onClick={startRecording} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    or record
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    style={{
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      backgroundColor: 'red',
                      color: 'white',
                    }}
                  >
                    stop recording
                  </button>
                )}
              </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Render DrumControls */}
            <DrumControls
              parameters={parameters}
              onParametersChange={(updatedParameters) =>
                setParameters((prev) => ({ ...prev, ...updatedParameters }))
              }
            />

            {/* Render DrumSegmenter */}
            {audioBuffer && (
              <DrumSegmenter
                audioBuffer={audioBuffer}
                parameters={parameters}
                onSegmentationComplete={(segments) => {
                  console.log('Segmentation complete:', segments);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;