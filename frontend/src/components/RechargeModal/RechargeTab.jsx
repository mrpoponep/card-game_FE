import React from 'react';
import styles from './RechargeModal.module.css';
import ChipPackageCard from './ChipPackageCard';

/**
 * Tab nạp chip - hiển thị các gói nạp tiền
 */
const RechargeTab = ({
    packages,
    onBuyPackage,
    loadingId,
    errorMsg,
    fallbackUrl
}) => {
    return (
        <div className={styles.panel}>
            <h2 className={styles.panelTitle}>CHỌN GÓI CHIP</h2>

            {/* Error Message */}
            {errorMsg && (
                <p style={{ color: '#f87171', fontWeight: 600, textAlign: 'center', marginBottom: '16px' }}>
                    {errorMsg}
                </p>
            )}

            {/* Package Grid */}
            <div className={styles.grid}>
                {packages.map((pkg) => (
                    <ChipPackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onBuy={onBuyPackage}
                        loading={loadingId === pkg.id}
                    />
                ))}
            </div>

            {/* Fallback URL */}
            {fallbackUrl && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <a
                        href={fallbackUrl}
                        target="_self"
                        rel="noreferrer"
                        className={styles.buyButton}
                        style={{ display: 'inline-block', maxWidth: '300px' }}
                    >
                        Mở VNPay thủ công
                    </a>
                </div>
            )}
        </div>
    );
};

export default RechargeTab;
