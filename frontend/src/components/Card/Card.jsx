import React from 'react';
import './Card.css';
import { getCardImagePath } from './cardAssets';

/**
 * Component Card sử dụng hình ảnh SVG.
 * Props:
 * - suit: 'S', 'H', 'D', 'C'
 * - rank: '2'...'9', 'T', 'J', 'Q', 'K', 'A'
 * - faceUp: boolean (true để lật ngửa, false để lật úp)
 * - size: 'normal' | 'small' | 'mini' (kích thước lá bài)
 */
function Card({ suit, rank, faceUp = true, size = 'normal' }) {
  const sizeClass = size !== 'normal' ? `card-${size}` : '';

  // 1. RENDER MẶT SAU (LÁ BÀI ÚP)
  if (!faceUp) {
    return (
      <div className={`card card-back ${sizeClass}`}>
        {/* Họa tiết mặt sau được định nghĩa trong CSS */}
        <div className="card-back-pattern"></div>
      </div>
    );
  }

  // 2. RENDER MẶT TRƯỚC (LÁ BÀI NGỬA) - Sử dụng hình SVG
  const imagePath = getCardImagePath(rank, suit);

  if (!imagePath) {
    // Fallback nếu không tìm thấy hình
    return (
      <div className={`card card-face card-error ${sizeClass}`}>
        <span>?</span>
      </div>
    );
  }

  return (
    <div className={`card card-face ${sizeClass}`}>
      <img
        src={imagePath}
        alt={`${rank} of ${suit}`}
        className="card-svg-image"
        draggable="false"
      />
    </div>
  );
}

export default Card;