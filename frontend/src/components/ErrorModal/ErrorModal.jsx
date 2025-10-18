import React from 'react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './ErrorModal.css';

export default function ErrorModal({ isOpen, onClose, message }) {
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);

  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) handleClose();
      }}
    >
      <div className={`modal-container error-modal-container ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <h2>⚠️ Thông báo</h2>
        </div>
        
        <div className="modal-content error-modal-content">
          <p className="error-message">{message || 'Đã xảy ra lỗi'}</p>
          <button className="error-ok-btn" onClick={handleClose}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
