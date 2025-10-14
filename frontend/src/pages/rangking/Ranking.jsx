import React, { useEffect, useState, useRef } from 'react';
import { apiPost } from '../../api';
import './Ranking.css';

export default function Ranking({ isOpen, onClose }) {
  // Nếu không mở thì không render gì cả
  if (!isOpen) return null;
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

  // Xử lý sự kiện ESC để đóng popup
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Đóng popup khi click vào overlay
  const handleOverlayClick = (e) => {
    if (e.target.className === 'ranking-overlay') {
      onClose();
    }
  };

  return (
    <div className="ranking-overlay" onClick={handleOverlayClick}>
      <div className="ranking-modal">
        <button className="close-btn-top" onClick={onClose}>✕</button>
        
        <div className="ranking-header">
          <h2>🏆 Bảng xếp hạng</h2>
        </div>
        
        <div className="ranking-content">
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
