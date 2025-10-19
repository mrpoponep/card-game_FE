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
  const limit = 10; // mặc định 10, không cần chọn
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

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
    const key = `p0-l${limit}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;
    fetchRankings(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        
        <div className="modal-content">
          {loading && <div className="loading">Đang tải...</div>}
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
                  <td>{r.rank}</td>
                  <td>{r.username}</td>
                  <td>{r.elo}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ranking-controls">
            <div className="pagination-group">
              <button 
                onClick={() => { const np = page - 1; setPage(np); fetchRankings(np); }} 
                disabled={!hasPrev}
              >
                ⬅️
              </button>
              <span>Trang {page + 1}</span>
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
