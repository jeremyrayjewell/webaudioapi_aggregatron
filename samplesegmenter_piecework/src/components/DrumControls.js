import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';

function DrumControls({ parameters, onParametersChange }) {
  const [numHits, setNumHits] = useState(parameters.numHits);
  const [minGap, setMinGap] = useState(parameters.minGap);
  const [frequencyRange, setFrequencyRange] = useState([parameters.lowerFreq, parameters.upperFreq]);
  const [durationRange, setDurationRange] = useState([parameters.minDuration, parameters.maxDuration]);
  const [timeRange, setTimeRange] = useState([parameters.startTime, parameters.endTime]);

  useEffect(() => {
    setNumHits(parameters.numHits);
    setMinGap(parameters.minGap);
    setFrequencyRange([parameters.lowerFreq, parameters.upperFreq]);
    setDurationRange([parameters.minDuration, parameters.maxDuration]);
    setTimeRange([parameters.startTime, parameters.endTime]);
  }, [parameters]);

  const handleFrequencyRangeChange = (values) => {
    setFrequencyRange(values);
    onParametersChange({ lowerFreq: values[0], upperFreq: values[1] });
  };

  const handleDurationRangeChange = (values) => {
    const [min, max] = values;

    // Enforce the maximum distance of 4 seconds
    if (max - min <= 4) {
      setDurationRange(values);
      onParametersChange({ minDuration: min, maxDuration: max });
    }
  };

  const handleTimeRangeChange = (values) => {
    const [start, end] = values;

    // Enforce the maximum distance of 60 seconds
    if (end - start <= 60) {
      setTimeRange(values);
      onParametersChange({ startTime: start, endTime: end });
    }
  };

  return (
    <div className="drum-controls">
      <h2>segmentation variables</h2>

      {/* Non-Slider Options */}
      <div className="control-group horizontal">
        <div>
          <label htmlFor="silenceThreshold">silence threshold </label>
          <input
            type="number"
            id="silenceThreshold"
            value={parameters.silenceThreshold}
            onChange={(e) => onParametersChange({ silenceThreshold: parseFloat(e.target.value) })}
            step="0.0001"
            min="0.0001"
          />
        </div>
        <div>
          <label htmlFor="numHits">max hits </label>
          <input
            type="number"
            id="numHits"
            value={numHits}
            onChange={(e) => setNumHits(parseInt(e.target.value, 10))}
            min="1"
          />
        </div>
        <div>
          <label htmlFor="minGap">min gap (secs) </label>
          <input
            type="number"
            id="minGap"
            value={minGap}
            onChange={(e) => setMinGap(parseFloat(e.target.value))}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Start-End Time Range Slider */}
      <div className="control-group horizontal">
        <div className="slider-container">
          <label>sampling range (max 60 secs) </label>
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="thumb"
            trackClassName="track"
            value={timeRange}
            onChange={handleTimeRangeChange}
            min={0}
            max={300} // Adjust this max value based on your audio duration
            step={1}
            renderThumb={(props, state) => <div {...props}>{state.valueNow}s</div>}
            renderTrack={(props, state) => (
              <div
                {...props}
                className={`track ${state.index === 1 ? 'track-selected' : ''}`}
              />
            )}
          />
        </div>
        
      </div>

      {/* Frequency Range Slider */}
      <div className="control-group horizontal">
        <div className="slider-container">
          <label>frequency range (Hz) </label>
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="thumb"
            trackClassName="track"
            value={frequencyRange}
            onChange={handleFrequencyRangeChange}
            min={20}
            max={20000}
            step={10}
            renderThumb={(props, state) => <div {...props}>{state.valueNow}Hz</div>}
            renderTrack={(props, state) => (
              <div
                {...props}
                className={`track ${state.index === 1 ? 'track-selected' : ''}`}
              />
            )}
          />
        </div>
        
      </div>

      {/* Hit Duration Range Slider */}
      <div className="control-group horizontal">
        <div className="slider-container">
          <label>segment duration (secs) </label>
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="thumb"
            trackClassName="track"
            value={durationRange}
            onChange={handleDurationRangeChange}
            min={0.01}
            max={5}
            step={0.01}
            renderThumb={(props, state) => <div {...props}>{state.valueNow}s</div>}
            renderTrack={(props, state) => (
              <div
                {...props}
                className={`track ${state.index === 1 ? 'track-selected' : ''}`}
              />
            )}
          />
        </div>
        
      </div>
    </div>
  );
}

export default DrumControls;