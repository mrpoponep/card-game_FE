import { useState, useCallback } from 'react';
import { trackReferralClick, createReferralLink, getReferralStats } from '../services/referral.js';

/**
 * Custom hook để quản lý Referral/Affiliate System
 */
const useReferral = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch referral statistics
     * @param {boolean} silent - Không hiển thị loading state (cho auto-refresh)
     */
    const fetchStats = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);

        try {
            const data = await getReferralStats();
            if (data && data.success) {
                setStats(data);
            } else {
                setError(data?.message || 'Không thể tải thống kê');
            }
        } catch (err) {
            console.error('Error fetching referral stats:', err);
            if (!silent) {
                setError(err.message || 'Lỗi kết nối server');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    /**
     * Create new referral link
     * @param {object} options - { campaignName, platform }
     */
    const createLink = useCallback(async (options) => {
        setLoading(true);
        setError(null);

        try {
            const data = await createReferralLink(options);
            if (data && data.success) {
                // Auto refresh stats after creating link
                await fetchStats(true);
                return data;
            } else {
                setError(data?.message || 'Không thể tạo link');
                return null;
            }
        } catch (err) {
            console.error('Error creating referral link:', err);
            setError(err.message || 'Lỗi kết nối server');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    /**
     * Track referral click (no auth required)
     * @param {string} refCode - Referral code
     */
    const trackClick = useCallback(async (refCode) => {
        try {
            const data = await trackReferralClick(refCode);
            return data && data.success;
        } catch (err) {
            console.error('Error tracking click:', err);
            return false;
        }
    }, []);

    return {
        stats,
        loading,
        error,
        fetchStats,
        createLink,
        trackClick
    };
};

export default useReferral;
