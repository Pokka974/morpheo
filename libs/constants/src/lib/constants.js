"use strict";
/**
 * Shared constants used across backend and frontend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIME_CONSTANTS = exports.UI_CONSTANTS = exports.ERROR_MESSAGES = exports.API_ENDPOINTS = exports.PLAN_LIMITS = void 0;
/**
 * Subscription plan limits and configuration
 */
exports.PLAN_LIMITS = {
    BASIC: {
        monthlyRequests: 10,
        windowDays: 30,
        label: 'Free',
        upgradeAvailable: true,
    },
    PREMIUM: {
        monthlyRequests: 1000,
        windowDays: 30,
        label: 'Premium',
        upgradeAvailable: false,
    },
};
/**
 * API endpoint constants
 */
exports.API_ENDPOINTS = {
    DREAMS: '/dreams',
    ANALYZE: '/dreams/analyze',
    DALLE: '/dalle',
    AUTH: '/auth',
    SUBSCRIPTION: '/subscription',
    HEALTH: '/health',
};
/**
 * Error messages
 */
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    INVALID_REQUEST: 'Invalid request data',
    INTERNAL_ERROR: 'Internal server error',
    NETWORK_ERROR: 'Network connection error',
    DREAM_NOT_FOUND: 'Dream not found',
    USER_NOT_FOUND: 'User not found',
};
/**
 * UI constants
 */
exports.UI_CONSTANTS = {
    DEFAULT_PAGINATION_LIMIT: 20,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 3000,
};
/**
 * Date/time constants
 */
exports.TIME_CONSTANTS = {
    MILLISECONDS_PER_DAY: 86400 * 1000,
    MILLISECONDS_PER_HOUR: 3600 * 1000,
    MILLISECONDS_PER_MINUTE: 60 * 1000,
};
//# sourceMappingURL=constants.js.map