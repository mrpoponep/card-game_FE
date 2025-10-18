import React, { useEffect, useState, useCallback } from 'react';
import { apiPost } from '../../api';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './Ranking.css';

export default function Ranking({ isOpen, onClose }) {
  // Sử dụng custom hooks cho animation
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  
  // Xử lý phím ESC
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper: Render rank badge theo tier
  const renderRankBadge = (rawRank) => {
    const rank = Number(rawRank);
    if (!Number.isFinite(rank)) return <span className="rank-badge tier-default">{String(rawRank)}</span>;

    let cls = 'tier-default';
    let icon = '';
    if (rank === 1) { cls = 'rank-1'; icon = '🥇'; }
    else if (rank === 2) { cls = 'rank-2'; icon = '🥈'; }
    else if (rank === 3) { cls = 'rank-3'; icon = '🥉'; }
    else if (rank >= 4 && rank <= 10) { cls = 'tier-4-10'; icon = '⭐'; }
    else if (rank >= 11 && rank <= 30) { cls = 'tier-11-30'; icon = '🎖️'; }
    else if (rank >= 31 && rank <= 50) { cls = 'tier-31-50'; icon = '🔰'; }
    else if (rank >= 51 && rank <= 100) { cls = 'tier-51-100'; icon = '🔹'; }

    return (
      <span className={`rank-badge ${cls}`} aria-label={`Hạng ${rank}`}>
        {icon && <span className="rank-icon" aria-hidden="true">{icon}</span>}
        <span className="rank-number">{rank}</span>
      </span>
    );
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data = await apiPost('/api/rankings/list', {});
      if (data.success) {
        setRankings(data.data);
      } else {
        console.error('Lỗi API', data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng xếp hạng', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Đóng popup khi click vào overlay
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('ranking-overlay')) {
      handleClose();
    }
  }, [handleClose]);

  // Nếu không cần render thì return null
  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <h2>🏆 Bảng xếp hạng</h2>
        </div>
        
        <div className="modal-content ranking-flex-content">
          <div className="ranking-table-flexarea">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Người chơi</th>
                  <th>ELO</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map(r => (
                  <tr key={r.userId}>
                    <td>{renderRankBadge(r.rank)}</td>
                    <td>{r.username}</td>
                    <td>{r.elo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <div className="loading">Đang tải top 100...</div>}
        </div>
      </div>
    </div>
  );
}
