import React, { useState } from 'react';
import styles from './RechargeModal.module.css';

const rechargePackages = [
    { id: 1, priceVND: '100.000vnd', chips: '10,000 CHIP', bonus: '+ 500 Bonus' },
    { id: 2, priceVND: '250.000vnd', chips: '28,000 CHIP', bonus: '+ 3,000 Bonus' },
    { id: 3, priceVND: '500.000vnd', chips: '60,000 CHIP', bonus: '+ 8,000 Bonus' },
    { id: 4, priceVND: '1.000.000vnd', chips: '150,000 CHIP', bonus: '🔥 2x First Time' },
    { id: 5, priceVND: '2.500.000vnd', chips: '400,000 CHIP', bonus: 'VIP Offer' },
    { id: 6, priceVND: '5.000.000vnd', chips: '900,000 CHIP', bonus: 'BEST VALUE!' },
];

const tabs = ['Nạp Chip', 'Lịch Sử'];

const ChipPackageCard = ({ pkg }) => {
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

            <button className={styles.buyButton}>{pkg.chips}</button>
        </div>
    );
};

const PokerRechargeModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('Nạp Chip');

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
                            <div className={styles.grid}>
                                {rechargePackages.map((pkg) => (
                                    <ChipPackageCard key={pkg.id} pkg={pkg} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'Nạp Chip' && (
                        <div className={styles.historyPanel}>
                            <p>Nội dung cho tab {activeTab} sẽ hiển thị ở đây.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PokerRechargeModal;
