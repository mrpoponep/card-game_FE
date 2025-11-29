import React, { useState } from 'react';
import './ReportPlayer.css';
import { apiPost } from '../../api';

const ReportPlayer = ({ playerName, playerId, reporterId, onClose, onSubmit }) => {
    const [reportType, setReportType] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const reportTypes = [
        { value: 'Cheating', label: 'Gian lận' },
        { value: 'Toxic Behavior', label: 'Lăng mạ' },
        { value: 'Spam', label: 'Spam tin nhắn' },
        { value: 'Other', label: 'Khác' }
    ];

    const showSuccessToast = () => {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-content">
        <div class="toast-title">Tố cáo thành công!</div>
        <div class="toast-message">Cảm ơn bạn đã giúp cải thiện môi trường chơi game.</div>
      </div>
    `;
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reportType || reason.trim().length === 0) {
            setError('Vui lòng chọn loại tố cáo và nhập lý do cụ thể');
            return;
        }

        if (!reporterId) {
            setError('Không tìm thấy thông tin người tố cáo');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await apiPost('/reports', {
                reporter_id: reporterId,
                reported_id: playerId,
                type: reportType,
                reason: reason.trim()
            });

            if (response.success) {
                showSuccessToast();

                if (onSubmit) {
                    onSubmit({
                        playerId,
                        playerName,
                        reportType,
                        reason: reason.trim(),
                        timestamp: new Date().toISOString()
                    });
                }

                setTimeout(() => {
                    onClose();
                }, 500);
            } else {
                setError(response.message || 'Có lỗi xảy ra khi gửi tố cáo');
            }
        } catch (err) {
            console.error('Error submitting report:', err);
            setError(err.message || 'Không thể kết nối đến server. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="report-player-overlay">
            <div className="report-player-modal">
                <div className="report-player-header">
                    <h2>TỐ CÁO NGƯỜI CHƠI</h2>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitting}>×</button>
                </div>

                <div className="report-player-body">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="reportType">Loại tố cáo *</label>
                            <select
                                id="reportType"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                required
                                disabled={isSubmitting}
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
                            <label htmlFor="reason">Lý do cụ thể*</label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Nhập lý do tố cáo..."
                                rows="4"
                                required
                                disabled={isSubmitting}
                            />
                            <span className={`char-count ${reason.length > 0 ? 'valid' : 'invalid'}`}>
                {reason.length} ký tự
              </span>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={!reportType || reason.trim().length === 0 || isSubmitting}
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi tố cáo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportPlayer;