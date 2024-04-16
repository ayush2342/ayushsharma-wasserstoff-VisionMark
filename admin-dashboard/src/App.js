import React, { useState } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCapture = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch('/annotate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to capture image');
      }

      const data = await response.json();
      setAnnotations(data.annotations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>VisionMark</h1>
      </header>

      <div className="capture-container">
        {!image ? (
          <input type="file" accept="image/*" onChange={handleImageChange} />
        ) : (
          <img src={URL.createObjectURL(image)} alt="Captured" className="annotation-image" />
        )}

        {image && (
          <button className="capture-button" onClick={handleCapture} disabled={loading}>
            {loading ? 'Processing...' : 'Capture'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="annotation-container">
        {annotations.map((annotation, index) => (
          <div key={index} className="annotation-item">
            <div className="boundingBox" style={annotation.boundingBox}></div>
            <span className="annotation-label">{annotation.label}</span>
          </div>
        ))}
      </div>

      <footer className="footer">
        <p>© 2024 VisionMark</p>
      </footer>
    </div>
  );
}

export default App;
