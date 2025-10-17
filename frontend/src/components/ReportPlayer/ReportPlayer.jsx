import React, { useState } from 'react';
import './ReportPlayer.css';

const ReportPlayer = ({ playerName, playerId, onClose, onSubmit }) => {
  const [reportType, setReportType] = useState('');
  const [reason, setReason] = useState('');

  const reportTypes = [
    { value: 'cheating', label: 'Gian lận' },
    { value: 'abusive', label: 'Lăng mạ' },
    { value: 'spam', label: 'Spam tin nhắn' },
    { value: 'other', label: 'Khác' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reportType && reason.trim().length >= 10) {
      onSubmit({
        playerId,
        playerName,
        reportType,
        reason: reason.trim(),
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="report-player-overlay">
      <div className="report-player-modal">
        <div className="report-player-header">
          <h2>TỐ CÁO NGƯỜI CHƠI</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="report-player-body">
          <div className="player-info">
            <span className="info-label">Người chơi:</span>
            <span className="player-name">{playerName}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reportType">Loại tố cáo *</label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
              >
                <option value="">-- Chọn loại tố cáo --</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Lý do *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do tố cáo chi tiết (tối thiểu 10 ký tự)..."
                rows="4"
                required
                minLength="10"
              />
              <span className={`char-count ${reason.length >= 10 ? 'valid' : 'invalid'}`}>
                {reason.length} / 10 ký tự
              </span>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={!reportType || reason.trim().length < 10}
              >
                Gửi tố cáo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportPlayer;
