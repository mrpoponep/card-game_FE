import React, { useState, useCallback } from 'react';
import styles from './RechargeModal.module.css';
import { apiCreatePaymentUrl, apiGetTransactionHistory } from '../../api';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import RechargeTab from './RechargeTab';
import HistoryTab from './HistoryTab';

// 🎯 Tính toán bonus dựa trên amount
const calculateChips = (amount) => {
    const bonusRate = {
        100000: 0.05,   // 5% bonus
        250000: 0.05,   // 5% bonus
        500000: 0.10,   // 10% bonus
        1000000: 0.20,  // 20% bonus
        2500000: 0.25,  // 25% bonus - VIP
        5000000: 0.30,  // 30% bonus - BEST VALUE
    };

    const rate = bonusRate[amount] || 0;
    const baseChips = amount;
    const bonusChips = Math.floor(amount * rate);
    const totalChips = baseChips + bonusChips;

    return {
        base: baseChips.toLocaleString('vi-VN'),
        bonus: bonusChips.toLocaleString('vi-VN'),
        total: totalChips.toLocaleString('vi-VN'),
        bonusPercent: Math.round(rate * 100)
    };
};

// 📦 Danh sách gói nạp tiền
const rechargePackages = [
    {
        id: 1,
        amount: 100000,
        priceVND: '100.000₫',
        ...calculateChips(100000),
        bonusText: '+5%'
    },
    {
        id: 2,
        amount: 250000,
        priceVND: '250.000₫',
        ...calculateChips(250000),
        bonusText: '+5%'
    },
    {
        id: 3,
        amount: 500000,
        priceVND: '500.000₫',
        ...calculateChips(500000),
        bonusText: '+10%'
    },
    {
        id: 4,
        amount: 1000000,
        priceVND: '1.000.000₫',
        ...calculateChips(1000000),
        bonusText: '🔥 +20%'
    },
    {
        id: 5,
        amount: 2500000,
        priceVND: '2.500.000₫',
        ...calculateChips(2500000),
        bonusText: 'VIP +25%'
    },
    {
        id: 6,
        amount: 5000000,
        priceVND: '5.000.000₫',
        ...calculateChips(5000000),
        bonusText: 'BEST +30%'
    },
];

const tabs = ['Nạp Chip', 'Lịch Sử'];

const PokerRechargeModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('Nạp Chip');
    const [loadingId, setLoadingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [fallbackUrl, setFallbackUrl] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Sử dụng custom hooks cho animation
    const { isClosing, isAnimating, handleClose, shouldRender } = useModalAnimation(isOpen, onClose, 300);

    // Xử lý phím ESC
    useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);

    const handleOverlayClick = useCallback((e) => {
        if (e.target.classList.contains(styles.overlay)) {
            handleClose();
        }
    }, [handleClose, styles.overlay]);

    // 🆕 Fetch transaction history
    const fetchTransactionHistory = useCallback(async () => {
        setLoadingHistory(true);
        setErrorMsg(null);
        try {
            const data = await apiGetTransactionHistory();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            setErrorMsg('Không thể tải lịch sử giao dịch');
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    // Load history khi chuyển sang tab "Lịch Sử"
    React.useEffect(() => {
        if (isOpen && activeTab === 'Lịch Sử') {
            fetchTransactionHistory();
        }
    }, [isOpen, activeTab, fetchTransactionHistory]);

    async function handleBuy(pkg) {
        setErrorMsg(null);
        setLoadingId(pkg.id);
        try {
            const data = await apiCreatePaymentUrl({
                amount: pkg.amount,
                orderDescription: `Nap goi ${pkg.amount}`,
                bankCode: 'NCB',
                orderType: 'other',
                language: 'vn',
            });

            console.log('Payment response raw:', JSON.stringify(data));

            const paymentUrl = typeof data?.paymentUrl === 'string'
                ? data.paymentUrl
                : data?.paymentUrl?.paymentUrl;

            if (!paymentUrl || typeof paymentUrl !== 'string' || !/^https?:\/\//.test(paymentUrl)) {
                setErrorMsg('URL thanh toán không hợp lệ');
                console.error('Invalid payment URL:', paymentUrl);
                return;
            }

            console.log('Redirecting to:', paymentUrl);

            // Thử điều hướng mạnh
            try {
                window.location.assign(paymentUrl);
            } catch {
                window.open(paymentUrl, '_self');
            }

            // Fallback nếu trình duyệt chặn
            setFallbackUrl(paymentUrl);
        } catch (e) {
            console.error('Payment error:', e);
            setErrorMsg(e?.message || 'Lỗi kết nối server');
        } finally {
            setLoadingId(null);
        }
    }

    if (!shouldRender) return null;

    return (
        <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleOverlayClick}>
            <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`}>
                <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
                    &times;
                </button>

                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>NẠP CHIP</h1>
                </div>

                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className={styles.content}>
                    {activeTab === 'Nạp Chip' && (
                        <RechargeTab
                            packages={rechargePackages}
                            onBuyPackage={handleBuy}
                            loadingId={loadingId}
                            errorMsg={errorMsg}
                            fallbackUrl={fallbackUrl}
                        />
                    )}

                    {activeTab === 'Lịch Sử' && (
                        <HistoryTab
                            transactions={transactions}
                            loading={loadingHistory}
                            error={errorMsg}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PokerRechargeModal;
