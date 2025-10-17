import React from 'react';
import './MatchStats.css';

const MatchStats = ({ matchData }) => {
  const {
    matchId,
    duration,
    totalRounds,
    matchType,
    timestamp,
    gameMode
  } = matchData;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="match-stats">
      <div className="match-stats-header">
        <h3>📊 Thông tin trận đấu</h3>
      </div>

      <div className="match-stats-grid">
        <div className="stat-box">
          <div className="stat-icon">🆔</div>
          <div className="stat-content">
            <span className="stat-label">Mã trận</span>
            <span className="stat-value">{matchId}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <span className="stat-label">Thời gian</span>
            <span className="stat-value">{duration ? formatDuration(duration) : '0:00'}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <span className="stat-label">Số vòng</span>
            <span className="stat-value">{totalRounds || 0}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <span className="stat-label">Chế độ</span>
            <span className="stat-value">{gameMode || matchType || 'Thường'}</span>
          </div>
        </div>

        {timestamp && (
          <div className="stat-box full-width">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <span className="stat-label">Thời điểm</span>
              <span className="stat-value">{formatDate(timestamp)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchStats;

