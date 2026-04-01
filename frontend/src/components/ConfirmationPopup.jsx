import React from "react";
import "./style/ConfirmationPopup.css";

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <div className="popup-buttons">
          <button className="popup-btn confirm" onClick={onConfirm}>
            Oui
          </button>
          <button className="popup-btn cancel" onClick={onCancel}>
            Non
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
