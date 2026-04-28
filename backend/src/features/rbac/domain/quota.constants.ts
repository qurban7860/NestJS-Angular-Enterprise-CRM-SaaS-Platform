import { SubscriptionPlan } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// QUOTA MAP — Single source of truth for all freemium feature limits.
// Extend here to add new gated features; guards read this at runtime.
// ─────────────────────────────────────────────────────────────────────────────

export const QUOTA_MAP = {
  custom_roles: {
    [SubscriptionPlan.FREE]: 2,
    [SubscriptionPlan.PREMIUM]: Infinity,
    [SubscriptionPlan.ENTERPRISE]: Infinity,
  },
  workflows: {
    [SubscriptionPlan.FREE]: 1,
    [SubscriptionPlan.PREMIUM]: Infinity,
    [SubscriptionPlan.ENTERPRISE]: Infinity,
  },
  reports: {
    [SubscriptionPlan.FREE]: 1,
    [SubscriptionPlan.PREMIUM]: Infinity,
    [SubscriptionPlan.ENTERPRISE]: Infinity,
  },
  contacts: {
    [SubscriptionPlan.FREE]: 50,
    [SubscriptionPlan.PREMIUM]: 5000,
    [SubscriptionPlan.ENTERPRISE]: Infinity,
  },
  deals: {
    [SubscriptionPlan.FREE]: 10,
    [SubscriptionPlan.PREMIUM]: 1000,
    [SubscriptionPlan.ENTERPRISE]: Infinity,
  },
  tasks: {
    [SubscriptionPlan.FREE]: 20,
    [SubscriptionPlan.PREMIUM]: 2000,
    [SubscriptionPlan.ENTERPRISE]: Infinity,
  },
} as const satisfies Record<string, Record<SubscriptionPlan, number>>;

export type QuotaFeature = keyof typeof QUOTA_MAP;

// ─────────────────────────────────────────────────────────────────────────────
// QUOTA_EXCEEDED_ERROR — Typed contract shared with the Angular client.
// The frontend error interceptor parses this shape to open the upgrade modal.
// ─────────────────────────────────────────────────────────────────────────────
export interface QuotaExceededPayload {
  statusCode: 402;
  error: 'QuotaExceeded';
  feature: QuotaFeature;
  limit: number;
  currentCount: number;
  plan: SubscriptionPlan;
  upgradeUrl: string;
}
