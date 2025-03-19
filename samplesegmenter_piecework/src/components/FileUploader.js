import React from 'react';

function FileUploader({ onFileSelected, onError }) {
  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'audio/wav') {
      onFileSelected(selectedFile);
    } else {
      if (onError) onError('Please upload a valid WAV file.');
    }
  };

  return (
    <div className="file-uploader">
      <input type="file" accept="audio/wav" onChange={handleChange} />
    </div>
  );
}

export default FileUploader;
