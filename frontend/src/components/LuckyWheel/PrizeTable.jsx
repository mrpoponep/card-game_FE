import React from 'react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './PrizeTable.css';

const PrizeTable = ({ isOpen, onClose, prizes }) => {
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);

  if (!shouldRender) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`modal-container prize-table-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>×</button>
        
        <div className="modal-header">
          <h2>📊 Tỷ Lệ Giải Thưởng</h2>
        </div>

        <div className="modal-content">
          <div className="prize-table-info">
            <p className="prize-table-description">
              Mỗi lần quay có cơ hội nhận được các giải thưởng sau với tỷ lệ tương ứng:
            </p>
            
            <div className="prize-grid">
              {prizes.map(prize => (
                <div key={prize.id} className="prize-card">
                  <div className="prize-card-color" style={{ background: prize.color }}></div>
                  <div className="prize-card-info">
                    <div className="prize-card-amount">{prize.label} Coin</div>
                    <div className="prize-card-probability">Tỷ lệ: {prize.probability}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="prize-table-note">
              <h4>💡 Lưu ý:</h4>
              <ul>
                <li>Chi phí mỗi lần quay: <strong>100 💎 Gems</strong></li>
                <li>Bạn có thể chọn hệ số nhân (x1 đến x100) để quay nhiều lần cùng lúc</li>
                <li>Tổng phần thưởng = Giải thưởng × Hệ số nhân</li>
                <li>Giải thưởng được cộng trực tiếp vào Coin của bạn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeTable;