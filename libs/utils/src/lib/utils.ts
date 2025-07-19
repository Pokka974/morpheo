/**
 * Shared utility functions used across backend and frontend
 */

// Define minimal types needed for utility functions
export type SubscriptionPlan = 'BASIC' | 'PREMIUM';

export interface PlanConfig {
  monthlyRequests: number;
  windowDays: number;
  label: string;
  upgradeAvailable: boolean;
}

export interface DreamAnalysisResponse {
  title: string;
  summary: string;
  emotions: string[];
  keywords: string[];
  cultural_references: Record<string, string>;
  advice: string;
  emoji: string;
  'dall-e-prompt': string;
  'midjourney-prompt': string;
}

export interface Dream {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  advice: string;
  culturalReferences: Record<string, string>;
  dallEPrompt: string;
  emotions: string[];
  keywords: string[];
  midjourneyPrompt: string;
  dalleImagePath?: string;
  summary: string;
  emoji: string;
}

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_DAY: 86400 * 1000,
  MILLISECONDS_PER_HOUR: 3600 * 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,
} as const;

/**
 * Plan-related utility functions
 */
export function getLimitForPlan(plan: SubscriptionPlan, planLimits: Record<SubscriptionPlan, PlanConfig>) {
  return planLimits[plan];
}

export function getUsageProgress(currentCount: number, limit: number) {
  return Math.min((currentCount / limit) * 100, 100);
}

export function canUpgrade(currentPlan: SubscriptionPlan, planLimits: Record<SubscriptionPlan, PlanConfig>) {
  return planLimits[currentPlan].upgradeAvailable;
}

/**
 * Date/time utility functions
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export function getTimeUntilReset(periodEnd: Date | string): number {
  const endDate = typeof periodEnd === 'string' ? new Date(periodEnd) : periodEnd;
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / TIME_CONSTANTS.MILLISECONDS_PER_DAY));
}

/**
 * String utility functions
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Array utility functions
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Validation utility functions
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Error handling utilities
 */
export function createErrorResponse(message: string, statusCode: number = 500) {
  return {
    error: 'Error',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

export function extractErrorMessage(error: unknown): string {
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

export function transformAnalysisToApiFormat(analysis: DreamAnalysisResponse): Partial<Dream> {
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
