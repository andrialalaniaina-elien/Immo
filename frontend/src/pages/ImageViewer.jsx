// src/pages/ImageViewer.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./style/ImageViewer.css";

function ImageViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { images = [], currentIndex = 0 } = location.state || {};

  const [index, setIndex] = useState(currentIndex);

  if (!images.length) {
    return <p className="no-image-text">Aucune image à afficher.</p>;
  }

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="viewer-overlay">
      <button className="close-button" onClick={handleClose}>
        ✖
      </button>

      <button className="nav-button left" onClick={handlePrev}>
        ‹
      </button>

      <img
        src={images[index]}
        alt={`Image ${index + 1}`}
        className="viewer-image"
      />

      <button className="nav-button right" onClick={handleNext}>
        ›
      </button>
    </div>
  );
}

export default ImageViewer;
