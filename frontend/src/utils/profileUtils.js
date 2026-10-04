// ═══════════════════════════════════════════════════════════════
// CENTRAL PROFILE UTILITY — Single source of truth
// Used by: Profile.js, Dashboard.js, Recommendations.js
// ═══════════════════════════════════════════════════════════════

/**
 * Standard field names as stored in BACKEND (User entity)
 * These are the ONLY fields checked for completion
 */
export const REQUIRED_PROFILE_FIELDS = [
    'fullName',      // Personal
    'email',
    'mobile',
    'age',
    'gender',
    'district',      // Address
    'category',      // Documents
    'occupation',    // Employment
    'annualIncome',
    'education',
    'maritalStatus'  // Family
];

/**
 * Calculate profile completion % from backend user data
 * @param {Object} userData - User object from GET /api/user/profile
 * @returns {Number} 0-100
 */
export const calculateProfileCompletion = (userData) => {
    if (!userData) return 0;

    const filled = REQUIRED_PROFILE_FIELDS.filter(field => {
        const value = userData[field];
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (typeof value === 'number' && value === 0 && field === 'annualIncome') return false;
        return true;
    }).length;

    return Math.round((filled / REQUIRED_PROFILE_FIELDS.length) * 100);
};

/**
 * Is profile complete enough for AI recommendations?
 */
export const isProfileComplete = (userData) => {
    return calculateProfileCompletion(userData) >= 80;
};

/**
 * Get list of missing fields (for UX hints)
 */
export const getMissingFields = (userData) => {
    if (!userData) return REQUIRED_PROFILE_FIELDS;
    return REQUIRED_PROFILE_FIELDS.filter(field => {
        const value = userData[field];
        return !value || (typeof value === 'string' && value.trim() === '');
    });
};