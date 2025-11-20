import React, { useState } from 'react';
import styles from './RechargeModal.module.css';
import { apiCreatePaymentUrl } from '../../api';

const rechargePackages = [
    { id: 1, amount: 100000, priceVND: '100.000vnd', chips: '10,000 CHIP', bonus: '+ 500 Bonus' },
    { id: 2, amount: 250000, priceVND: '250.000vnd', chips: '28,000 CHIP', bonus: '+ 3,000 Bonus' },
    { id: 3, amount: 500000, priceVND: '500.000vnd', chips: '60,000 CHIP', bonus: '+ 8,000 Bonus' },
    { id: 4, amount: 1000000, priceVND: '1.000.000vnd', chips: '150,000 CHIP', bonus: '🔥 2x First Time' },
    { id: 5, amount: 2500000, priceVND: '2.500.000vnd', chips: '400,000 CHIP', bonus: 'VIP Offer' },
    { id: 6, amount: 5000000, priceVND: '5.000.000vnd', chips: '900,000 CHIP', bonus: 'BEST VALUE!' },
];

const tabs = ['Nạp Chip', 'Lịch Sử'];

const ChipPackageCard = ({ pkg, onBuy, loading }) => {
    const isBestValue = pkg.bonus.includes('BEST VALUE');
    const isFirstTime = pkg.bonus.includes('First Time');

    return (
        <div className={`${styles.chipCard} ${isBestValue ? styles.bestValue : ''}`}>
            <div className={`${styles.topBanner} ${isBestValue ? styles.topBannerBest : styles.topBannerDefault}`}>
                {pkg.priceVND}
            </div>

            <div className={`${styles.bonusTag} ${isFirstTime ? styles.bonusFirstTime : styles.bonusDefault}`}>
                {pkg.bonus}
            </div>

            <div className={styles.emojiArea}>
                <span role="img" aria-label="poker chips" className={styles.emojiGlow}>💰</span>
            </div>

            <button className={styles.buyButton} disabled={loading} onClick={() => onBuy?.(pkg)}>
                {loading ? 'Đang tạo...' : pkg.chips}
            </button>
        </div>
    );
};

const PokerRechargeModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('Nạp Chip');
    const [loadingId, setLoadingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [fallbackUrl, setFallbackUrl] = useState('');

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

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close">
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
                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>CHỌN GÓI CHIP</h2>
                            {errorMsg && <p style={{ color: '#f87171', fontWeight: 600 }}>{errorMsg}</p>}
                            <div className={styles.grid}>
                                {rechargePackages.map((pkg) => (
                                    <ChipPackageCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        onBuy={handleBuy}
                                        loading={loadingId === pkg.id}
                                    />
                                ))}
                            </div>
                            {fallbackUrl && (
                                <div style={{ marginTop: 12 }}>
                                    <a href={fallbackUrl} target="_self" rel="noreferrer" className={styles.buyButton}>
                                        Mở VNPay thủ công
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab !== 'Nạp Chip' && (
                        <div className={styles.historyPanel}>
                            <p>Nội dung cho tab {activeTab} sẽ hiển thị ở đây.</p>
                        </div>
                    )}
                </div>

                {/* Footer close button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 16px',
                            fontWeight: 800,
                            borderRadius: 8,
                            border: '2px solid #facc15',
                            background: '#991b1b',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PokerRechargeModal;
