import React from "react";
import "./SidePanel.css";

const SidePanel = ({ isOpen, onClose, children, size = "small" }) => {
  return (
    <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose}>
      <div
        className={`panel ${size === "large" ? "large" : "small"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <div className="cbar bar1"></div>
          <div className="cbar bar2"></div>
        </button>
        {children}
      </div>
    </div>
  );
};

export default SidePanel;
