import {
    apiGet,
    apiPost,
    apiTrackReferralClick   // ✅ API public đã fix
} from '../api.js';

/**
 * Track referral click (PUBLIC – KHÔNG THROW)
 */
export function trackReferralClick(refCode) {
    if (!refCode) {
        return Promise.resolve({ success: false, message: 'Missing refCode' });
    }
    return apiTrackReferralClick(refCode);
}

/**
 * Create new referral link (AUTH)
 */
export function createReferralLink(options = {}) {
    return apiPost('/referral/create-link', {
        campaignName: options.campaignName || 'Default Campaign',
        platform: options.platform || 'web'
    });
}

/**
 * Get referral statistics (AUTH)
 */
export function getReferralStats() {
    return apiGet('/referral/stats');
}

/**
 * Validate referral link (optional – simple check)
 */
export function validateReferralLink(refCode) {
    if (!refCode) {
        return Promise.resolve({ valid: false });
    }
    return Promise.resolve({ valid: true });
}

/**
 * Activate referral after registration (AUTH)
 */
export function activateReferral(refCode) {
    return apiPost('/referral/activate', { refCode });
}
