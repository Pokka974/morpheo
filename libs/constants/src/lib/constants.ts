/**
 * Shared constants used across backend and frontend
 */

/**
 * Subscription plan limits and configuration
 */
export const PLAN_LIMITS = {
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
} as const;

/**
 * API endpoint constants
 */
export const API_ENDPOINTS = {
  DREAMS: '/dreams',
  ANALYZE: '/dreams/analyze',
  DALLE: '/dalle',
  AUTH: '/auth',
  SUBSCRIPTION: '/subscription',
  HEALTH: '/health',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_REQUEST: 'Invalid request data',
  INTERNAL_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network connection error',
  DREAM_NOT_FOUND: 'Dream not found',
  USER_NOT_FOUND: 'User not found',
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  DEFAULT_PAGINATION_LIMIT: 20,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
} as const;

/**
 * Date/time constants
 */
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_DAY: 86400 * 1000,
  MILLISECONDS_PER_HOUR: 3600 * 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,
} as const;
