import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/images');
      setImages(response.data);
    } catch (err) {
      setError('An error occurred while fetching images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Image List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {images.map((image, index) => (
          <li key={index}>
            <img src={`data:image/jpeg;base64,${image}`} alt={`Image ${index}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageList;
