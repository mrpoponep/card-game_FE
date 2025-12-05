import React from 'react';
import styles from './RechargeModal.module.css';

/**
 * Component hiển thị một giao dịch trong lịch sử
 */
const TransactionCard = ({ transaction }) => {
    const statusConfig = {
        SUCCESS: { label: '✅ Thành công', className: 'success', icon: '✓' },
        FAILED: { label: '❌ Thất bại', className: 'failed', icon: '✗' },
        PENDING: { label: '⏳ Đang xử lý', className: 'pending', icon: '⟳' }
    };

    const status = statusConfig[transaction.status] || {
        label: transaction.status,
        className: '',
        icon: '?'
    };

    // Format date & time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        return { dateStr, timeStr };
    };

    const { dateStr, timeStr } = formatDateTime(transaction.time);

    return (
        <div className={styles.transactionCard}>
            {/* Header - Status và thời gian */}
            <div className={styles.txHeader}>
                <span className={`${styles.txStatus} ${styles[status.className]}`}>
                    {status.label}
                </span>
                <span className={styles.txDate}>{dateStr} {timeStr}</span>
            </div>

            {/* Body - Info gọn */}
            <div className={styles.txBody}>
                {/* Amount - HIGHLIGHT */}
                <div className={styles.txAmount}>
                    <span className={styles.txLabel}>Số tiền</span>
                    <span className={styles.txValue}>
                        {Number(transaction.amount).toLocaleString('vi-VN')} CHIP
                    </span>
                </div>

                {/* Transaction Reference */}
                {transaction.txn_ref && (
                    <div className={styles.txInfo}>
                        <span className={styles.txLabel}>Mã GD</span>
                        <span className={styles.txValueSmall}>{transaction.txn_ref}</span>
                    </div>
                )}

                {/* Order Info */}
                {transaction.order_info && (
                    <div className={styles.txInfo}>
                        <span className={styles.txLabel}>Ghi chú</span>
                        <span className={styles.txValueSmall}>{transaction.order_info}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionCard;
