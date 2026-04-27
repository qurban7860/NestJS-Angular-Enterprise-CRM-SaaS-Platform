import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureQuotaService } from '../../application/feature-quota.service';
import {
  QUOTA_FEATURE_KEY,
} from '../decorators/check-quota.decorator';
import { QuotaExceededPayload, QuotaFeature } from '../../domain/quota.constants';

// ─────────────────────────────────────────────────────────────────────────────
// FeatureQuotaGuard
//
// Sits at position 4 in the global pipeline (after JwtAuthGuard, PlanGuard).
// Only activates on routes decorated with @CheckQuota('feature_key').
// PREMIUM/ENTERPRISE orgs bypass all DB count queries (< 1ms overhead).
// FREE orgs receive a typed 402 response when their quota is exhausted.
//
// Registration:
//   @UseGuards(FeatureQuotaGuard)  → route-level (recommended)
//   Never register as APP_GUARD — it must remain opt-in per endpoint.
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class FeatureQuotaGuard implements CanActivate {
  private readonly logger = new Logger(FeatureQuotaGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly quotaService: FeatureQuotaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ── 1. Read decorator metadata ─────────────────────────────────────────
    const feature = this.reflector.getAllAndOverride<QuotaFeature | undefined>(
      QUOTA_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Guard is a no-op when @CheckQuota is absent
    if (!feature) return true;

    // ── 2. Extract authenticated user context ──────────────────────────────
    const request = context.switchToHttp().getRequest<{
      user: { orgId: string; id: string; role: string };
    }>();
    const { orgId } = request.user;

    // ── 3. Evaluate quota ──────────────────────────────────────────────────
    const result = await this.quotaService.checkQuota(orgId, feature);

    if (result.allowed) return true;

    // ── 4. Build typed 402 payload ─────────────────────────────────────────
    this.logger.warn(
      `Quota exceeded: org=${orgId} feature=${feature} ` +
      `count=${result.currentCount}/${result.limit} plan=${result.plan}`,
    );

    const payload: QuotaExceededPayload = {
      statusCode: 402,
      error: 'QuotaExceeded',
      feature,
      limit: result.limit,
      currentCount: result.currentCount,
      plan: result.plan,
      upgradeUrl: '/billing/upgrade',
    };

    throw new HttpException(payload, HttpStatus.PAYMENT_REQUIRED);
  }
}
