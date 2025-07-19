"use strict";
/**
 * Shared utility functions used across backend and frontend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIME_CONSTANTS = void 0;
exports.getLimitForPlan = getLimitForPlan;
exports.getUsageProgress = getUsageProgress;
exports.canUpgrade = canUpgrade;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.getTimeUntilReset = getTimeUntilReset;
exports.capitalize = capitalize;
exports.truncate = truncate;
exports.slugify = slugify;
exports.unique = unique;
exports.groupBy = groupBy;
exports.isValidEmail = isValidEmail;
exports.isValidPassword = isValidPassword;
exports.createErrorResponse = createErrorResponse;
exports.extractErrorMessage = extractErrorMessage;
exports.transformAnalysisToApiFormat = transformAnalysisToApiFormat;
/**
 * Time constants
 */
exports.TIME_CONSTANTS = {
    MILLISECONDS_PER_DAY: 86400 * 1000,
    MILLISECONDS_PER_HOUR: 3600 * 1000,
    MILLISECONDS_PER_MINUTE: 60 * 1000,
};
/**
 * Plan-related utility functions
 */
function getLimitForPlan(plan, planLimits) {
    return planLimits[plan];
}
function getUsageProgress(currentCount, limit) {
    return Math.min((currentCount / limit) * 100, 100);
}
function canUpgrade(currentPlan, planLimits) {
    return planLimits[currentPlan].upgradeAvailable;
}
/**
 * Date/time utility functions
 */
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
}
function formatDateTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
}
function getTimeUntilReset(periodEnd) {
    const endDate = typeof periodEnd === 'string' ? new Date(periodEnd) : periodEnd;
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / exports.TIME_CONSTANTS.MILLISECONDS_PER_DAY));
}
/**
 * String utility functions
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
/**
 * Array utility functions
 */
function unique(array) {
    return [...new Set(array)];
}
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = key(item);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}
/**
 * Validation utility functions
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidPassword(password) {
    return password.length >= 8;
}
/**
 * Error handling utilities
 */
function createErrorResponse(message, statusCode = 500) {
    return {
        error: 'Error',
        message,
        statusCode,
        timestamp: new Date().toISOString(),
    };
}
function extractErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unknown error occurred';
}
/**
 * Data transformation utilities for API compatibility
 */
function transformAnalysisToApiFormat(analysis) {
    return {
        title: analysis.title,
        summary: analysis.summary,
        emotions: analysis.emotions,
        keywords: analysis.keywords,
        culturalReferences: analysis.cultural_references,
        advice: analysis.advice,
        emoji: analysis.emoji,
        dallEPrompt: analysis['dall-e-prompt'],
        midjourneyPrompt: analysis['midjourney-prompt'],
    };
}
//# sourceMappingURL=utils.js.map