import React from 'react';
import styles from './RechargeModal.module.css';

/**
 * Component hiển thị một gói chip để mua
 */
const ChipPackageCard = ({ pkg, onBuy, loading }) => {
    const isBestValue = pkg.bonusText?.includes('BEST');
    const isHot = pkg.bonusText?.includes('🔥');

    return (
        <div className={`${styles.chipCard} ${isBestValue ? styles.bestValue : ''}`}>
            {/* Banner giá */}
            <div className={`${styles.topBanner} ${isBestValue ? styles.topBannerBest : styles.topBannerDefault}`}>
                {pkg.priceVND}
            </div>

            {/* Bonus tag */}
            {pkg.bonusText && (
                <div className={`${styles.bonusTag} ${isHot ? styles.bonusHot : styles.bonusDefault}`}>
                    {pkg.bonusText}
                </div>
            )}

            {/* Icon chip */}
            <div className={styles.emojiArea}>
                <span role="img" aria-label="poker chips" className={styles.emojiGlow}>💰</span>
            </div>

            {/* Hiển thị số chip */}
            <div className={styles.chipInfo}>
                <div className={styles.baseChips}>{pkg.base} CHIP</div>
                {pkg.bonusPercent > 0 && (
                    <div className={styles.bonusChips}>+ {pkg.bonus} Bonus</div>
                )}
                <div className={styles.totalChips}>= {pkg.total} CHIP</div>
            </div>

            {/* Button mua */}
            <button
                className={styles.buyButton}
                disabled={loading}
                onClick={() => onBuy?.(pkg)}
                aria-label={`Mua gói ${pkg.priceVND}`}
            >
                {loading ? 'Đang tạo...' : 'MUA NGAY'}
            </button>
        </div>
    );
};

export default ChipPackageCard;
