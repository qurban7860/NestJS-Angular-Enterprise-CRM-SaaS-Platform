import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS } from './plan-limits.config';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkLimit(orgId: string, feature: keyof typeof PLAN_LIMITS.FREE) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });

    if (!org) return;

    const limits = PLAN_LIMITS[org.plan];
    const limitValue = limits[feature];

    if (typeof limitValue === 'boolean') {
      if (!limitValue) {
        throw new ForbiddenException(
          `Feature ${feature} is not available on the ${org.plan} plan.`,
        );
      }
      return;
    }

    // Handle numeric limits
    let currentCount = 0;
    switch (feature) {
      case 'maxUsers':
        currentCount = await this.prisma.user.count({
          where: { orgId, isActive: true },
        });
        break;
      case 'maxContacts':
        currentCount = await this.prisma.contact.count({
          where: { orgId, isDeleted: false },
        });
        break;
      case 'maxDeals':
        currentCount = await this.prisma.deal.count({
          where: { orgId, isDeleted: false },
        });
        break;
      case 'maxTasks':
        currentCount = await this.prisma.task.count({
          where: { orgId, isDeleted: false },
        });
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    if (currentCount >= (limitValue as number)) {
      throw new ForbiddenException(
        `Limit reached: You have ${currentCount}/${limitValue} ${feature.replace('max', '')} on the ${org.plan} plan. Please upgrade.`,
      );
    }
  }

  async getLimits(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });

    if (!org) return PLAN_LIMITS[SubscriptionPlan.FREE];

    return PLAN_LIMITS[org.plan];
  }
}
