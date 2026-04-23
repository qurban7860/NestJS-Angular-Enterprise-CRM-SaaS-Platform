/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@prisma/client';
import { PLAN_KEY } from '../decorators/require-plan.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<SubscriptionPlan>(
      PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPlan || requiredPlan === SubscriptionPlan.FREE) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.orgId) {
      throw new ForbiddenException('User organization context missing');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: user.orgId },
      select: { plan: true },
    });

    if (!organization) {
      throw new ForbiddenException('Organization not found');
    }

    const planHierarchy: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PREMIUM]: 1,
      [SubscriptionPlan.ENTERPRISE]: 2,
    };

    if (planHierarchy[organization.plan] < planHierarchy[requiredPlan]) {
      throw new ForbiddenException(
        `This feature requires a ${requiredPlan} plan. Please upgrade your subscription.`,
      );
    }

    return true;
  }
}
