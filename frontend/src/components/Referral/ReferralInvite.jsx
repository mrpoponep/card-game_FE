import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useReferral from '../../hooks/useReferral';
import './ReferralInvite.css';

/**
 * Component Mời Bạn Bè & Nhận Thưởng Chip
 * Tích hợp với hệ thống Referral/Affiliate tracking
 */
const ReferralInvite = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { stats, createLink, loading, error, trackClick } = useReferral();
    const [referralLink, setReferralLink] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Fetch stats và tạo link khi component mount
    useEffect(() => {
        if (isOpen && user) {
            generateReferralLink();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user]);

    // Tạo referral link
    const generateReferralLink = async () => {
        try {
            console.log('🔗 Generating referral link...');
            const result = await createLink({
                campaignName: 'Mời Bạn Chơi Poker',
                platform: 'app'
            });

            console.log('📥 Create link result:', result);

            if (result && result.link) {
                setReferralLink(result.link.fullUrl);
                setReferralCode(result.link.code);
                console.log('✅ Link set:', result.link.fullUrl);
            } else {
                console.error('❌ No link in response:', result);
            }
        } catch (err) {
            console.error('Error generating referral link:', err);
        }
    };

    // ❌ ĐÃ XÓA trackClick khỏi copyLink
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    // Chia sẻ qua các kênh
    const shareTo = (channel) => {
        const message = `🎴 Chơi Poker online cùng mình! Đăng ký qua link này để nhận chip miễn phí nhé: ${referralLink}`;

        switch (channel) {
            case 'facebook':
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`,
                    '_blank',
                    'width=600,height=400'
                );
                break;
            case 'messenger':
                window.open(
                    `fb-messenger://share/?link=${encodeURIComponent(referralLink)}`,
                    '_blank'
                );
                break;
            case 'telegram':
                window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`,
                    '_blank'
                );
                break;
            case 'zalo':
                window.open(
                    `https://sp.zalo.me/share?url=${encodeURIComponent(referralLink)}&desc=${encodeURIComponent(message)}`,
                    '_blank'
                );
                break;
            case 'sms':
                window.location.href = `sms:?body=${encodeURIComponent(message)}`;
                break;
            default:
                alert(`Không hỗ trợ chia sẻ trực tiếp kênh ${channel} lúc này.`);
        }
    };

    if (!isOpen) return null;

    const statsData = stats?.stats || {};
    const totalClicks = statsData.totalClicks || 0;
    const totalActivations = statsData.totalActivations || 0;
    const totalRewards = statsData.totalRewards || 0;

    // Tính chip đã nhận = 10000 * số người đăng ký thành công
    const totalChips = totalActivations * 10000;

    return (
        <div className="referral-overlay" onClick={(e) => {
            if (e.target.classList.contains('referral-overlay')) {
                onClose();
            }
        }}>
            <div className="referral-container referral-redblackgold">
                {/* Close Button */}
                <button className="close-btn" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="referral-header">
                    <h2 style={{ color: '#e60000' }}>💰 Mời Bạn Bè, Nhận Thưởng Chip!</h2>
                    <p>Chia sẻ link của bạn để nhận ngay <strong>10,000 Chip</strong> cho mỗi người bạn đăng ký thành công!</p>
                </div>

                {/* Link Section */}
                <div className="referral-section">
                    <h3>🔗 Link Mời Của Bạn</h3>
                    <div className="share-input-group">
                        <input
                            type="text"
                            id="referralLink"
                            value={referralLink || 'Đang tạo link...'}
                            readOnly
                        />
                        <button
                            className={`btn btn-copy-red ${copySuccess ? 'success' : ''}`}
                            onClick={copyLink}
                            disabled={!referralLink}
                        >
                            <i className="fas fa-copy"></i>
                            {copySuccess ? 'Đã Copy! ✔️' : 'Copy Link'}
                        </button>
                    </div>
                    <p className="small-text">
                        Mã giới thiệu của bạn: <strong id="referralCode">{referralCode || '...'}</strong>
                    </p>
                </div>

                <hr />

                {/* Share Channels */}
                <div className="referral-section share-channels">
                    <h3>📲 Chia sẻ nhanh qua</h3>
                    <div className="share-buttons">
                        <button className="btn btn-facebook" onClick={() => shareTo('facebook')}>
                            <i className="fab fa-facebook-f"></i> Facebook
                        </button>
                        <button className="btn btn-messenger" onClick={() => shareTo('messenger')}>
                            <i className="fab fa-facebook-messenger"></i> Messenger
                        </button>
                        <button className="btn btn-telegram" onClick={() => shareTo('telegram')}>
                            <i className="fab fa-telegram-plane"></i> Telegram
                        </button>
                        <button className="btn btn-zalo" onClick={() => shareTo('zalo')}>
                            <i className="fas fa-comment"></i> Zalo
                        </button>
                    </div>
                </div>

                <hr />

                {/* Statistics */}
                <div className="referral-section statistics-section">
                    <h3>📈 Hiệu suất Mời Bạn</h3>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <span className="stat-value">{totalClicks.toLocaleString()}</span>
                            <span className="stat-label">Lượt Click Link</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{totalActivations.toLocaleString()}</span>
                            <span className="stat-label">Đăng ký thành công</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value chip-icon">{totalChips.toLocaleString()}</span>
                            <span className="stat-label">Chip đã nhận</span>
                        </div>
                    </div>
                </div>

                {/* Loading/Error States */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralInvite;
