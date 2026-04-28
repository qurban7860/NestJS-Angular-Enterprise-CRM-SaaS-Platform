import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../../../core/infrastructure/prisma/prisma.service';
import { RedisService } from '../../../core/infrastructure/redis/redis.service';
import { QUOTA_MAP, QuotaFeature } from '../domain/quota.constants';

const PLAN_CACHE_TTL_SECONDS = 300;

interface QuotaCheckResult {
  allowed: boolean;
  plan: SubscriptionPlan;
  limit: number;
  currentCount: number;
}

@Injectable()
export class FeatureQuotaService {
  private readonly logger = new Logger(FeatureQuotaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkQuota(
    orgId: string,
    feature: QuotaFeature,
  ): Promise<QuotaCheckResult> {
    const plan = await this.resolveOrgPlan(orgId);
    const limit = QUOTA_MAP[feature][plan];

    if (!isFinite(limit)) {
      return { allowed: true, plan, limit, currentCount: 0 };
    }

    const currentCount = await this.countFeatureUsage(orgId, feature);
    return {
      allowed: currentCount < limit,
      plan,
      limit,
      currentCount,
    };
  }

  async resolveOrgPlan(orgId: string): Promise<SubscriptionPlan> {
    const cacheKey = `org-plan:${orgId}`;

    try {
      const cached = await this.redis.get<SubscriptionPlan>(cacheKey);
      if (cached) return cached;
    } catch {
      this.logger.warn(
        `Redis unavailable for key ${cacheKey} — falling back to DB`,
      );
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });

    const plan = org?.plan ?? SubscriptionPlan.FREE;

    try {
      await this.redis.set(cacheKey, plan, PLAN_CACHE_TTL_SECONDS);
    } catch {
      // Non-fatal — proceed without caching
    }

    return plan;
  }

  private async countFeatureUsage(
    orgId: string,
    feature: QuotaFeature,
  ): Promise<number> {
    switch (feature) {
      case 'custom_roles':
        return this.prisma.customRole.count({ where: { orgId } });

      case 'workflows':
        return this.prisma.workflowRule.count({ where: { orgId } });

      case 'reports':
        return this.prisma.customReport.count({ where: { orgId } });

      case 'contacts':
        return this.prisma.contact.count({ where: { orgId } });

      case 'deals':
        return this.prisma.deal.count({ where: { orgId } });

      case 'tasks':
        return this.prisma.task.count({ where: { orgId } });

      default: {
        const _exhaustive: never = feature;
        this.logger.error(`Unhandled quota feature: ${String(_exhaustive)}`);
        return 0;
      }
    }
  }

  async invalidateOrgPlanCache(orgId: string): Promise<void> {
    await this.redis.del(`org-plan:${orgId}`);
    this.logger.log(`Plan cache invalidated for org ${orgId}`);
  }
}
