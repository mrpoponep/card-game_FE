import React from 'react';
import './Card.css';

// Map suit từ server (S, H, D, C) sang CSS class và ký tự Unicode
const suitMap = {
  'S': { symbol: '♠', class: 'spades' },   // Bích
  'H': { symbol: '♥', class: 'hearts' },   // Cơ
  'D': { symbol: '♦', class: 'diamonds' }, // Rô
  'C': { symbol: '♣', class: 'clubs' },    // Chuồn
};

// Map rank từ server (T, J, Q, K, A) sang giá trị hiển thị
const rankMap = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  'T': '10', // Hiển thị 10 thay vì T
  'J': 'J',
  'Q': 'Q',
  'K': 'K',
  'A': 'A',
};

/**
 * Component Card được vẽ bằng CSS.
 * Props:
 * - suit: 'S', 'H', 'D', 'C'
 * - rank: '2'...'9', 'T', 'J', 'Q', 'K', 'A'
 * - faceUp: boolean (true để lật ngửa, false để lật úp)
 */
function Card({ suit, rank, faceUp = true }) {
  
  // 1. RENDER MẶT SAU (LÁ BÀI ÚP)
  if (!faceUp) {
    return (
      <div className="card card-back">
        {/* Họa tiết mặt sau được định nghĩa trong CSS */}
        <div className="card-back-pattern"></div>
      </div>
    );
  }

  // 2. RENDER MẶT TRƯỚC (LÁ BÀI NGỬA)
  const displayRank = rankMap[rank] || rank;
  const suitInfo = suitMap[suit] || { symbol: '?', class: 'default' };
  const cardClass = suitInfo.class; // hearts, diamonds, spades, clubs

  return (
    <div className={`card card-face ${cardClass}`}>
      
      {/* Góc trên bên trái */}
      <div className="card-corner top-left">
        <div className="card-rank">{displayRank}</div>
        <div className="card-suit-small">{suitInfo.symbol}</div>
      </div>
      
      {/* Họa tiết chính giữa */}
      <div className="card-pattern-center">
         {/* Để đơn giản và đẹp mắt, chúng ta sẽ hiển thị 1 ký tự lớn ở giữa
           cho tất cả các lá bài (bao gồm cả J, Q, K, A và số).
           Tạo layout 10 con cơ (♥) bằng CSS rất phức tạp.
         */}
         <div className="card-pattern-symbol main">{suitInfo.symbol}</div>
      </div>

      {/* Góc dưới bên phải (xoay 180 độ) */}
      <div className="card-corner bottom-right">
        <div className="card-rank">{displayRank}</div>
        <div className="card-suit-small">{suitInfo.symbol}</div>
      </div>
    </div>
  );
}

export default Card;