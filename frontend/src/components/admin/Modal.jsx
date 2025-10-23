import React from "react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose} aria-hidden="true">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
