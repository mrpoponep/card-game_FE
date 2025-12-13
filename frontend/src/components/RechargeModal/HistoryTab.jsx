import React from 'react';
import styles from './RechargeModal.module.css';
import TransactionCard from './TransactionCard';

/**
 * Tab lịch sử - hiển thị danh sách giao dịch
 */
const HistoryTab = ({
    transactions,
    loading,
    error
}) => {
    return (
        <div className={styles.historyPanel}>
            <h2 className={styles.panelTitle}>LỊCH SỬ GIAO DỊCH</h2>

            {/* Loading State */}
            {loading && (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải...</p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className={styles.emptyState}>
                    <p>⚠️</p>
                    <span style={{ color: '#f87171' }}>{error}</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && transactions.length === 0 && (
                <div className={styles.emptyState}>
                    <p>🎰</p>
                    <span>Chưa có giao dịch nào</span>
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>
                        Hãy nạp chip để bắt đầu chơi!
                    </span>
                </div>
            )}

            {/* Transaction List */}
            {!loading && !error && transactions.length > 0 && (
                <div className={styles.transactionList}>
                    {transactions.map((tx) => (
                        <TransactionCard
                            key={tx.tx_id}
                            transaction={tx}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryTab;
