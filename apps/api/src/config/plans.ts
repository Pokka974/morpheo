// config/plans.ts
export const PLAN_LIMITS = {
    BASIC: {
        monthlyRequests: 10,
        windowDays: 30, // 30-day cycle
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

export type SubscriptionPlan = keyof typeof PLAN_LIMITS;

// Helpers
export function getLimitForPlan(plan: SubscriptionPlan) {
    return PLAN_LIMITS[plan];
}

export function getUsageProgress(currentCount: number, plan: SubscriptionPlan) {
    const limit = PLAN_LIMITS[plan].monthlyRequests;
    return Math.min((currentCount / limit) * 100, 100); // Never exceed 100%
}

export function canUpgrade(currentPlan: SubscriptionPlan) {
    return PLAN_LIMITS[currentPlan].upgradeAvailable;
}
