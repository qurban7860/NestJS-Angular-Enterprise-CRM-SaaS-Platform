import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';

export const PLAN_KEY = 'requiredPlan';
export const RequirePlan = (plan: SubscriptionPlan) =>
  SetMetadata(PLAN_KEY, plan);
