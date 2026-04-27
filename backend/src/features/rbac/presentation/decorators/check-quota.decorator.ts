import { SetMetadata } from '@nestjs/common';
import { QuotaFeature } from '../../domain/quota.constants';

// ─────────────────────────────────────────────────────────────────────────────
// @CheckQuota — Route-level decorator that activates FeatureQuotaGuard.
//
// Usage:
//   @Post()
//   @CheckQuota('custom_roles')
//   async create(...) { ... }
//
// The guard reads this metadata key and enforces the QUOTA_MAP limit for the
// current organisation's subscription plan. Has no effect on GET endpoints.
// ─────────────────────────────────────────────────────────────────────────────

export const QUOTA_FEATURE_KEY = 'quotaFeature';

export const CheckQuota = (feature: QuotaFeature) =>
  SetMetadata(QUOTA_FEATURE_KEY, feature);
