import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); // Tự động điều chỉnh theo màn hình
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // 🎯 Tự động tính limit dựa trên chiều cao màn hình
  useEffect(() => {
    const calculateOptimalLimit = () => {
      const windowHeight = window.innerHeight;
      
      // Chiều cao các thành phần cố định:
      // - Header: ~80px
      // - Padding modal: ~48px
      // - Controls: ~70px
      // - Table header: ~50px
      // → Còn lại cho tbody
      const fixedHeight = 250; // Tổng chiều cao cố định
      const availableHeight = (windowHeight * 0.85) - fixedHeight; // 90vh - fixed
      
      // Mỗi row cao ~50px
      const rowHeight = 50;
      const optimalRows = Math.floor(availableHeight / rowHeight);
      
      // Giới hạn từ 8-25 items
      const calculatedLimit = Math.max(6, Math.min(25, optimalRows));
      
      setLimit(calculatedLimit);
      console.log(`📊 Màn hình: ${windowHeight}px → Hiển thị ${calculatedLimit} items`);
    };

    calculateOptimalLimit();
    
    // Lắng nghe resize
    window.addEventListener('resize', calculateOptimalLimit);
    return () => window.removeEventListener('resize', calculateOptimalLimit);
  }, []);

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

  const fetchRankings = async (p = page) => {
    setLoading(true);
    try {
      const payload = { page: p, limit };
      const data = await apiPost('/api/rankings/list', payload);
      if (data.success) {
        setRankings(data.data);
        setTotal(data.pagination?.totalItems ?? 0);
        setHasNext(data.pagination?.hasNext ?? false);
        setHasPrev(data.pagination?.hasPrev ?? false);
      } else {
        console.error('Lỗi API', data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng xếp hạng', err);
    } finally {
      setLoading(false);
    }
  };

  const lastFetchKeyRef = useRef(null);

  useEffect(() => {
    if (limit === 0) return; // Chờ limit được tính toán
    
    const key = `p0-l${limit}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;
    fetchRankings(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]); // Fetch lại khi limit thay đổi

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
                  <tr key={r.playerId}>
                    <td>{renderRankBadge(r.rank)}</td>
                    <td>{r.username}</td>
                    <td>{r.elo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ranking-controls">
            <div className="pagination-group">
              <button 
                onClick={() => { const np = page - 1; setPage(np); fetchRankings(np); }} 
                disabled={!hasPrev}
              >
                ⬅️
              </button>
              <span>
                {(() => {
                  const start = page * limit + 1;
                  const end = Math.min((page + 1) * limit, total);
                  return `${start}–${end}`;
                })()}
              </span>
              <button 
                onClick={() => { const np = page + 1; setPage(np); fetchRankings(np); }}
                disabled={!hasNext}
              >
                ➡️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
