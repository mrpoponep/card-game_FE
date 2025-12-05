import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PaymentResult.css';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refetchUserData } = useAuth();
    const [countdown, setCountdown] = useState(8);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    const txnRef = searchParams.get('txnRef');
    const responseCode = searchParams.get('responseCode');
    const message = searchParams.get('message');

    const isSuccess = status === 'success';

    useEffect(() => {
        // Kiểm tra nếu user chưa login (session mất sau redirect từ VNPay)
        if (!user) {
            setShowLoginPrompt(true);
            // Không auto redirect, để user tự đăng nhập
            return;
        }

        // Refresh user balance if payment successful
        if (isSuccess) {
            refetchUserData?.();
        }

        // Countdown and auto redirect
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSuccess, navigate, refetchUserData, user]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoLogin = () => {
        navigate('/login');
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                <div className={`result-icon ${isSuccess ? 'success' : 'failed'}`}>
                    {isSuccess ? (
                        <svg viewBox="0 0 52 52" className="checkmark">
                            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 52 52" className="crossmark">
                            <circle className="crossmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="crossmark-cross" fill="none" d="M16 16 l20 20 M36 16 l-20 20" />
                        </svg>
                    )}
                </div>

                <h1 className={`result-title ${isSuccess ? 'success' : 'failed'}`}>
                    {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
                </h1>

                <p className="result-message">{message || 'Đã xảy ra lỗi'}</p>

                <div className="result-details">
                    {amount && (
                        <div className="detail-row">
                            <span className="detail-label">Số tiền:</span>
                            <span className="detail-value amount">
                                {Number(amount).toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                    )}
                    {txnRef && (
                        <div className="detail-row">
                            <span className="detail-label">Mã giao dịch:</span>
                            <span className="detail-value">{txnRef}</span>
                        </div>
                    )}
                    {responseCode && (
                        <div className="detail-row">
                            <span className="detail-label">Mã phản hồi:</span>
                            <span className="detail-value">{responseCode}</span>
                        </div>
                    )}
                </div>

                <div className="result-actions">
                    {showLoginPrompt ? (
                        <button className="btn-home" onClick={handleGoLogin}>
                            Đăng Nhập
                        </button>
                    ) : (
                        <button className="btn-home" onClick={handleGoHome}>
                            Về Trang Chủ ({countdown}s)
                        </button>
                    )}
                </div>

                {isSuccess && (
                    <div className="success-note">
                        <p>✨ Số dư của bạn đã được cập nhật!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;
