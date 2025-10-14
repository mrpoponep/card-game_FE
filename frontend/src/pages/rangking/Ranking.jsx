import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiPost } from '../../api';
import './Ranking.css';

export default function Ranking({ isOpen, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // Track animation mở
  const [rankings, setRankings] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 10; // mặc định 10, không cần chọn
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
  const closeTimeoutRef = useRef(null);
  const openTimeoutRef = useRef(null);

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

  // Reset isClosing và hủy timeout khi popup được mở lại
  useEffect(() => {
    if (isOpen) {
      // Hủy timeout đóng nếu có
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      // Hủy timeout mở cũ nếu có
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      
      // Reset tất cả states về ban đầu
      setIsClosing(false);
      setIsAnimating(true);
      
      // Sau 290ms (animation mở xong), cho phép đóng
      openTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        openTimeoutRef.current = null;
      }, 290);
    }
  }, [isOpen]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  // Xử lý đóng popup với animation - dùng useCallback
  const handleClose = useCallback(() => {
    if (isClosing || isAnimating) return; // Không đóng nếu đang animating mở hoặc đang đóng
    
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
      closeTimeoutRef.current = null;
      onClose();
    }, 290); // Khớp với thời gian animation
  }, [isClosing, isAnimating, onClose]);

  useEffect(() => {
    const key = `p0-l${limit}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;
    fetchRankings(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý sự kiện ESC để đóng popup
  useEffect(() => {
    if (!isOpen || isClosing || isAnimating) return; // Không xử lý nếu đang đóng hoặc đang mở
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault(); // Ngăn hành động mặc định
        e.stopPropagation(); // Ngăn event bubble lên
        
        setIsClosing(true);
        closeTimeoutRef.current = setTimeout(() => {
          setIsClosing(false);
          closeTimeoutRef.current = null;
          onClose();
        }, 290);
      }
    };

    // Chặn cả keyup để tránh event trigger sau khi đóng
    const preventKeyup = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keyup', preventKeyup);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keyup', preventKeyup);
    };
  }, [isOpen, isClosing, isAnimating, onClose]);

  // Đóng popup khi click vào overlay
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('ranking-overlay')) {
      handleClose();
    }
  }, [handleClose]);

  // Nếu không mở và không đang đóng thì không render
  if (!isOpen && !isClosing && !isAnimating) return null;

  return (
    <div 
      className={`ranking-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`ranking-modal ${isClosing ? 'closing' : ''}`}>
        <button className="close-btn-top" onClick={handleClose}>✕</button>
        
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
