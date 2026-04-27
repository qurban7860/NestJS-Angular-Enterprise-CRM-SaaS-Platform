import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReportsService } from '../../application/services/reports.service';
import { FeatureQuotaGuard } from '../../../rbac/presentation/guards/feature-quota.guard';
import { PermissionsGuard } from '../../../rbac/presentation/guards/permissions.guard';
import { CheckQuota } from '../../../rbac/presentation/decorators/check-quota.decorator';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';

// ─────────────────────────────────────────────────────────────────────────────
// ReportsController
//
// Freemium model:
//   GET    /premium/reports         → open (read is always free)
//   POST   /premium/reports         → @CheckQuota('reports') — FREE ≤ 1
//   GET    /premium/reports/:id/run → @RequirePermissions('reports:read')
//   DELETE /premium/reports/:id     → @RequirePermissions('reports:delete')
// ─────────────────────────────────────────────────────────────────────────────

@Controller('premium/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ── List all reports for the org ─────────────────────────────────────────
  @Get()
  findAll(@Req() req: any) {
    return this.reportsService.findAll(req.user.orgId as string);
  }

  // ── Create: quota-gated (FREE ≤ 1, PREMIUM/ENTERPRISE unlimited) ─────────
  @Post()
  @UseGuards(FeatureQuotaGuard)
  @CheckQuota('reports')
  create(@Req() req: any, @Body() data: any) {
    return this.reportsService.create(
      req.user.orgId as string,
      req.user.id as string,
      data,
    );
  }

  // ── Run a saved report: requires reports:read permission ─────────────────
  @Get(':id/run')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('reports:read')
  run(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.runReport(id, req.user.orgId as string);
  }

  // ── Delete report: requires reports:delete permission ────────────────────
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('reports:delete')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.delete(id, req.user.orgId as string);
  }
}

