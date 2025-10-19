import React, { useEffect, useState, useCallback } from 'react';
import { apiPost, apiGet } from '../../api';
import { useAuth } from '../../hooks/AuthContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './Ranking.css';

export default function Ranking({ isOpen, onClose }) {
  // Sử dụng custom hooks cho animation
  const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 290);
  
  // Lấy thông tin user hiện tại
  const { user } = useAuth();
  
  // Xử lý phím ESC
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  
  const [rankings, setRankings] = useState([]);
  const [myRank, setMyRank] = useState(null);

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
    try {
      const data = await apiPost('/rankings/list', {});
      if (data.success) {
        setRankings(data.data);
      } else {
        console.error('Lỗi API', data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng xếp hạng', err);
    }
  };

  const fetchMyRank = async () => {
    if (!user || !user.userId) return;
    try {
      const data = await apiGet(`/rankings/${user.userId}`);
      if (data.success) {
        setMyRank(data.data);
      }
    } catch (err) {
      console.error('Không tìm thấy rank của bạn', err);
      setMyRank(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
      fetchMyRank();
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
                  <tr 
                    key={r.userId}
                    className={r.userId === user?.userId ? 'my-rank-row' : ''}
                  >
                    <td>{renderRankBadge(r.rank)}</td>
                    <td>{r.username}</td>
                    <td>{r.elo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {myRank && (
            <div className="my-rank-info">
              <span className="my-rank-label">Hạng của bạn:</span>
              {renderRankBadge(myRank.rank)}
              <span className="my-rank-label">ELO: {myRank.elo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
