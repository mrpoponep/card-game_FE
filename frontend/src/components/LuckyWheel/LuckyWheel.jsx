import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../api';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import PrizeTable from './PrizeTable';
import SpinHistory from './SpinHistory';
import './LuckyWheel.css';

const LuckyWheel = ({ isOpen, onClose }) => {
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  const { user, updateUser } = useAuth();
  const [multiplier, setMultiplier] = useState(1);
  const [showPrizeTable, setShowPrizeTable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  // Cấu hình giải thưởng với tỷ lệ
  const prizes = [
    { id: 1, amount: 1000, probability: 30, color: '#FF6B6B', label: '1,000' },
    { id: 2, amount: 2000, probability: 20, color: '#4ECDC4', label: '2,000' },
    { id: 3, amount: 3000, probability: 15, color: '#45B7D1', label: '3,000' },
    { id: 4, amount: 5000, probability: 12, color: '#96CEB4', label: '5,000' },
    { id: 5, amount: 10000, probability: 10, color: '#FFEAA7', label: '10,000' },
    { id: 6, amount: 20000, probability: 7, color: '#DFE6E9', label: '20,000' },
    { id: 7, amount: 50000, probability: 5, color: '#74B9FF', label: '50,000' },
    { id: 8, amount: 100000, probability: 1, color: '#FFD700', label: '100,000' }
  ];

  const COST_PER_SPIN = 100;

  const quickMultipliers = [1, 5, 10, 50, 100];

  // Tính tổng gems cần
  const totalCost = COST_PER_SPIN * multiplier;
  const canSpin = user?.gems >= totalCost && !isSpinning;
  
  // Tính hệ số nhân tối đa dựa trên gems hiện có
  const maxMultiplier = Math.min(100, Math.floor((user?.gems || 0) / COST_PER_SPIN));

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setMultiplier(1);
      setResult(null);
      setRotation(-67.5);
    }
  }, [isOpen]);

  // Lấy thông tin gems khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchUserGems = async () => {
        try {
          const response = await apiGet('/lucky-wheel/gems');
          if (response.success) {
            updateUser({ gems: response.gems });
          }
        } catch (error) {
          console.error('Failed to fetch user gems:', error);
        }
      };
      fetchUserGems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSpin = async () => {
    if (!canSpin) return;

    setIsSpinning(true);
    setResult(null);

    try {
      // Gửi request lên server
      const response = await apiPost('/lucky-wheel/spin', {
        multiplier: multiplier
      });

      if (response.success) {
        const { prizeAmount, totalWin, prizeBreakdown } = response.data;
        
        updateUser({ balance: user.balance + totalWin });

        // Tìm prize index để tính góc quay
        const prizeIndex = prizes.findIndex(p => p.amount === prizeAmount);
        
        if (prizeIndex !== -1) {
          // Tính góc quay đến vị trí giải thưởng
          const degreesPerSlice = 360 / prizes.length;
          const targetDegree = prizeIndex * degreesPerSlice;
          
          // Quay nhiều vòng + góc đích (ít nhất 5 vòng)
          // Giải ở dưới so với mũi tên bên phải (trừ 180 để quay đúng vị trí)
          const spins = 5 + Math.floor(Math.random() * 3); // 5-7 vòng
          const finalRotation = rotation + spins * 360 + (360 - targetDegree) - (rotation % 360) - 67.5;
          
          setRotation(finalRotation);
          // Đợi animation xong rồi hiển thị kết quả
          setTimeout(async () => {
            setResult({
              prizeAmount,
              totalWin,
              multiplier,
              prizeBreakdown
            });
            
            // Cập nhật gems sau khi animation xong
            try {
              const gemsResponse = await apiGet('/lucky-wheel/gems');
              if (gemsResponse.success) {
                updateUser({ gems: gemsResponse.gems });
              }
            } catch (error) {
              console.error('Failed to refresh gems:', error);
            }
            
            setIsSpinning(false);
          }, 4000); // Animation 4s
        }
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert(error.message || 'Không thể quay. Vui lòng thử lại!');
      setIsSpinning(false);
    }
  };

  const handleMultiplierChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setMultiplier(Math.max(1, Math.min(100, value)));
  };

  if (!shouldRender) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`modal-container lucky-wheel-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>×</button>
        
        <div className="modal-header">
          <h2>🎡 Vòng Quay May Mắn</h2>
        </div>

        <div className="modal-content">
          {/* Thông tin user */}
          <div className="lucky-wheel-user-info">
            <div className="user-gems">
              💎 Gems: <span className="gems-amount">{user?.gems?.toLocaleString()}</span>
            </div>
            <div className="spin-cost">
              Chi phí: <span className="cost-amount">{totalCost.toLocaleString()} 💎</span>
            </div>
          </div>

          {/* Layout ngang: Vòng quay trái, Controls phải */}
          <div className="wheel-layout">
            {/* Vòng quay */}
            <div className="wheel-section">
              <div className="wheel-container">
            <div className="wheel-pointer">▼</div>
            <div 
              ref={wheelRef}
              className="wheel"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
              }}
            >
              {prizes.map((prize, index) => {
                const degreesPerSlice = 360 / prizes.length;
                const rotation = index * degreesPerSlice;
                
                return (
                  <div
                    key={prize.id}
                    className="wheel-slice"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      backgroundColor: prize.color
                    }}
                  >
                    <div className="slice-content">
                      <div className="prize-label">{prize.label}</div>
                      <div className="prize-probability">{prize.probability}%</div>
                    </div>
                  </div>
                );
              })}
              <div className="wheel-center">
                <div className="wheel-center-text">SPIN</div>
              </div>
            </div>
              </div>
            </div>

            {/* Controls bên phải */}
            <div className="controls-section">
              {/* Chọn hệ số */}
              <div className="multiplier-section">
            <label className="multiplier-label">Hệ số nhân:</label>
            <div className="multiplier-controls">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max="100"
                value={multiplier}
                onChange={handleMultiplierChange}
                className="multiplier-input"
                disabled={isSpinning}
              />
              <div className="quick-multipliers">
                <div className="quick-row">
                  <button
                    onClick={() => setMultiplier(1)}
                    className={`quick-btn ${multiplier === 1 ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setMultiplier(5)}
                    className={`quick-btn ${multiplier === 5 ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    5
                  </button>
                  <button
                    onClick={() => setMultiplier(10)}
                    className={`quick-btn ${multiplier === 10 ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    10
                  </button>
                </div>
                <div className="quick-row">
                  <button
                    onClick={() => setMultiplier(50)}
                    className={`quick-btn ${multiplier === 50 ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    50
                  </button>
                  <button
                    onClick={() => setMultiplier(100)}
                    className={`quick-btn ${multiplier === 100 ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    100
                  </button>
                  <button
                    onClick={() => setMultiplier(maxMultiplier)}
                    className={`quick-btn quick-btn-max ${multiplier === maxMultiplier ? 'active' : ''}`}
                    disabled={isSpinning || maxMultiplier === 0}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nút quay */}
          <button
            className={`spin-button ${!canSpin ? 'disabled' : ''}`}
            onClick={handleSpin}
            disabled={!canSpin}
          >
            {isSpinning ? '🎡 Đang quay...' : '🎰 Quay Ngay!'}
          </button>

              {!canSpin && !isSpinning && (
                <p className="insufficient-gems">❌ Không đủ gems để quay!</p>
              )}
            </div>
          </div>
        </div>

        {/* Nút hướng dẫn và lịch sử - góc dưới phải */}
        <div className="modal-bottom-buttons">
          <button className="modal-help-btn" onClick={() => setShowPrizeTable(true)} title="Xem tỷ lệ giải thưởng">
            <span>❓</span>
            <span className="btn-text">Tỷ lệ</span>
          </button>
          <button className="modal-history-btn" onClick={() => setShowHistory(true)} title="Xem lịch sử quay">
            <span>📜</span>
            <span className="btn-text">Lịch sử</span>
          </button>
        </div>

        {/* Kết quả */}
        {result && (
          <div className="result-popup">
            <div className="result-content">
              <h3>🎉 Chúc Mừng!</h3>
              
              {result.multiplier === 1 ? (
                // Hiển thị đơn giản cho 1 lần quay
                <>
                  <p className="result-prize">
                    Giải: <span className="prize-highlight">{result.prizeAmount.toLocaleString()} Coin</span>
                  </p>
                  <p className="result-total">
                    Tổng thưởng: <span className="total-highlight">{result.totalWin.toLocaleString()} Coin</span>
                  </p>
                </>
              ) : (
                // Hiển thị chi tiết cho nhiều lần quay
                <>
                  <p className="result-multiplier">Quay {result.multiplier} lần</p>
                  <div className="prize-breakdown">
                    {Object.entries(result.prizeBreakdown || {})
                      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                      .map(([amount, count]) => (
                        <div key={amount} className="prize-breakdown-item">
                          <span className="breakdown-amount">{parseInt(amount).toLocaleString()}</span>
                          <span className="breakdown-times">× {count} lần</span>
                          <span className="breakdown-total">= {(parseInt(amount) * count).toLocaleString()}</span>
                        </div>
                      ))
                    }
                  </div>
                  <p className="result-total">
                    Tổng thưởng: <span className="total-highlight">{result.totalWin.toLocaleString()} Coin</span>
                  </p>
                </>
              )}
              
              <button 
                className="result-ok-btn"
                onClick={() => setResult(null)}
              >
                Tuyệt vời!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Prize Table Modal */}
      <PrizeTable 
        isOpen={showPrizeTable} 
        onClose={() => setShowPrizeTable(false)}
        prizes={prizes}
      />

      {/* Spin History Modal */}
      <SpinHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};

export default LuckyWheel;
