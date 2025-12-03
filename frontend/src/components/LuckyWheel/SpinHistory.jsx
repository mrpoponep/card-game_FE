import React, { useState, useEffect } from 'react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { apiGet } from '../../api';
import './SpinHistory.css';

const SpinHistory = ({ isOpen, onClose }) => {
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/lucky-wheel/history?limit=50');
      if (response.success) {
        setHistory(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch spin history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!shouldRender) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`modal-container spin-history-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>×</button>
        
        <div className="modal-header">
          <h2>📜 Lịch Sử Quay</h2>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="history-loading">Đang tải...</div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <p>Chưa có lịch sử quay</p>
              <p className="history-empty-hint">Hãy thử quay vòng may mắn ngay!</p>
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Hệ số</th>
                    <th>Gems tiêu</th>
                    <th>Giải trúng</th>
                    <th>Tổng thưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDate(item.spin_time)}</td>
                      <td>x{item.multiplier}</td>
                      <td className="gems-spent">-{item.gems_spent?.toLocaleString()} 💎</td>
                      <td className="prize-amount">{item.prize_amount?.toLocaleString()}</td>
                      <td className="total-win">+{item.total_win?.toLocaleString()} 🪙</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinHistory;
