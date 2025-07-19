// utils/rateLimiter.ts
import { PLAN_LIMITS } from '../config/plans';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkRateLimit(userId: string) {
    // Get or create subscription
    const subscription = await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            plan: 'BASIC',
            periodStart: new Date(),
            periodEnd: new Date(
                Date.now() + PLAN_LIMITS.BASIC.windowDays * 86400 * 1000,
            ),
            requestCount: 0,
        },
        update: {},
    });

    // Handle plan changes or expired periods
    const now = new Date();
    const isNewPeriod = now > subscription.periodEnd;
    const currentPlan = subscription.plan as keyof typeof PLAN_LIMITS;

    if (isNewPeriod) {
        await prisma.subscription.update({
            where: { userId },
            data: {
                requestCount: 0,
                periodStart: now,
                periodEnd: new Date(
                    now.getTime() +
                        PLAN_LIMITS[currentPlan].windowDays * 86400 * 1000,
                ),
            },
        });
    }

    // Check remaining quota
    const limit = PLAN_LIMITS[currentPlan].monthlyRequests;
    const remaining = limit - subscription.requestCount;

    if (remaining <= 0) {
        if (remaining <= 0) {
            throw {
                status: 429, // HTTP status for "Too Many Requests"
                message: `Plan limit exceeded. ${limit} requests per ${PLAN_LIMITS[currentPlan].windowDays} days.`,
            };
        }
    }

    // Increment counter
    await prisma.subscription.update({
        where: { userId },
        data: { requestCount: { increment: 1 } },
    });

    return {
        remaining: remaining - 1, // Account for current request
        limit,
        reset: subscription.periodEnd,
        plan: currentPlan,
    };
}
