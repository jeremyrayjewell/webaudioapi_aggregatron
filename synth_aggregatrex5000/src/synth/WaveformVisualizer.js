import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './waveformVisualizer.scss';

const WaveformVisualizer = ({ analyser }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const drawWaveform = () => {
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'black';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'lime';

        canvasCtx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

        requestAnimationFrame(draw);
      };

      draw();
    };

    drawWaveform();
  }, [analyser]);

  return <canvas ref={canvasRef} className="waveform-visualizer" />;
};

WaveformVisualizer.propTypes = {
  analyser: PropTypes.instanceOf(AnalyserNode).isRequired,
};

export default WaveformVisualizer;