// Import from shared libraries
import { PLAN_LIMITS } from '@morpheo/constants';
import { getLimitForPlan, getUsageProgress, canUpgrade, type SubscriptionPlan } from '@morpheo/utils';

// Re-export for backward compatibility
export { PLAN_LIMITS };
export type { SubscriptionPlan };

// Create wrapper functions that don't require passing plan limits  
export function getLimitForPlanLocal(plan: SubscriptionPlan) {
    return getLimitForPlan(plan, PLAN_LIMITS);
}

export function getUsageProgressLocal(currentCount: number, plan: SubscriptionPlan) {
    const limit = PLAN_LIMITS[plan].monthlyRequests;
    return getUsageProgress(currentCount, limit);
}

export function canUpgradeLocal(currentPlan: SubscriptionPlan) {
    return canUpgrade(currentPlan, PLAN_LIMITS);
}
