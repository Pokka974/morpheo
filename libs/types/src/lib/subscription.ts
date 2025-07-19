/**
 * Subscription plan types and interfaces
 */

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM'
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  requestCount: number;
  periodStart: Date | string;
  periodEnd: Date | string;
  updatedAt: Date | string;
}

/**
 * API-friendly version with string dates
 */
export interface SubscriptionAPI extends Omit<Subscription, 'periodStart' | 'periodEnd' | 'updatedAt'> {
  periodStart: string;
  periodEnd: string;
  updatedAt: string;
}

/**
 * Plan configuration interface
 */
export interface PlanConfig {
  monthlyRequests: number;
  windowDays: number;
  label: string;
  upgradeAvailable: boolean;
}

/**
 * Plan limits configuration
 */
export interface PlanLimits {
  BASIC: PlanConfig;
  PREMIUM: PlanConfig;
}

/**
 * Usage statistics
 */
export interface UsageStats {
  currentCount: number;
  limit: number;
  percentage: number;
  canUpgrade: boolean;
  daysUntilReset: number;
}