import { Module } from '@nestjs/common';
import { FeatureQuotaService } from './application/feature-quota.service';
import { FeatureQuotaGuard } from './presentation/guards/feature-quota.guard';
import { PermissionsGuard } from './presentation/guards/permissions.guard';

@Module({
  providers: [FeatureQuotaService, FeatureQuotaGuard, PermissionsGuard],
  exports: [FeatureQuotaService, FeatureQuotaGuard, PermissionsGuard],
})
export class RbacModule {}
