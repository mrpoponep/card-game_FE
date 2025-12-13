import React, { useState, useEffect } from 'react';
import { apiGet } from '../../api';

const MatchHistoryTab = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, win, lose

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  const fetchMatchHistory = async () => {
    setLoading(true);
    try {
      // TODO: Implement API endpoint for match history
      // const response = await apiGet('/user/match-history');
      // if (response.success) {
      //   setMatches(response.data);
      // }
      
      // Mock data for now
      setMatches([]);
    } catch (error) {
      console.error('Error fetching match history:', error);
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

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'win') return match.result === 'win';
    if (filter === 'lose') return match.result === 'lose';
    return true;
  });

  return (
    <div className="match-history-tab">
      <div className="tab-header">
        <h3 className="section-title">Lịch Sử Đấu</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filter === 'win' ? 'active' : ''}`}
            onClick={() => setFilter('win')}
          >
            Thắng
          </button>
          <button 
            className={`filter-btn ${filter === 'lose' ? 'active' : ''}`}
            onClick={() => setFilter('lose')}
          >
            Thua
          </button>
        </div>
      </div>

      <div className="matches-container">
        {loading ? (
          <div className="loading-state">Đang tải...</div>
        ) : filteredMatches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <p className="empty-text">Chưa có lịch sử đấu</p>
            <p className="empty-hint">Hãy tham gia một ván đấu để xem lịch sử!</p>
          </div>
        ) : (
          <div className="matches-list">
            {filteredMatches.map((match, index) => (
              <div key={index} className={`match-card ${match.result}`}>
                <div className="match-header">
                  <span className={`match-result ${match.result}`}>
                    {match.result === 'win' ? '🏆 Thắng' : '❌ Thua'}
                  </span>
                  <span className="match-date">{formatDate(match.playedAt)}</span>
                </div>
                <div className="match-details">
                  <div className="match-info">
                    <span className="match-label">Phòng:</span>
                    <span className="match-value">{match.roomCode}</span>
                  </div>
                  <div className="match-info">
                    <span className="match-label">ELO thay đổi:</span>
                    <span className={`match-value ${match.eloChange > 0 ? 'positive' : 'negative'}`}>
                      {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                    </span>
                  </div>
                  <div className="match-info">
                    <span className="match-label">Coin thay đổi:</span>
                    <span className={`match-value ${match.coinChange > 0 ? 'positive' : 'negative'}`}>
                      {match.coinChange > 0 ? '+' : ''}{match.coinChange.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistoryTab;
