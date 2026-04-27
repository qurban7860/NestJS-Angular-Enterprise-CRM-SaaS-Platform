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
import { WorkflowsService } from '../../application/services/workflows.service';
import { FeatureQuotaGuard } from '../../../rbac/presentation/guards/feature-quota.guard';
import { PermissionsGuard } from '../../../rbac/presentation/guards/permissions.guard';
import { CheckQuota } from '../../../rbac/presentation/decorators/check-quota.decorator';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';

// ─────────────────────────────────────────────────────────────────────────────
// WorkflowsController
//
// Freemium model:
//   GET    /premium/workflows            → open (read is always free)
//   POST   /premium/workflows            → @CheckQuota('workflows') — FREE ≤ 1
//   POST   /premium/workflows/:id/toggle → @RequirePermissions('workflows:write')
//   DELETE /premium/workflows/:id        → @RequirePermissions('workflows:delete')
// ─────────────────────────────────────────────────────────────────────────────

@Controller('premium/workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  // ── List all workflow rules for the org ──────────────────────────────────
  @Get()
  findAll(@Req() req: any) {
    return this.workflowsService.findAll(req.user.orgId as string);
  }

  // ── Create: quota-gated (FREE ≤ 1, PREMIUM/ENTERPRISE unlimited) ─────────
  @Post()
  @UseGuards(FeatureQuotaGuard)
  @CheckQuota('workflows')
  create(@Req() req: any, @Body() data: any) {
    return this.workflowsService.create(req.user.orgId as string, data);
  }

  // ── Toggle active state: requires workflows:write permission ─────────────
  @Post(':id/toggle')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('workflows:write')
  toggle(
    @Req() req: any,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.workflowsService.toggleActive(
      id,
      req.user.orgId as string,
      isActive,
    );
  }

  // ── Delete rule: requires workflows:delete permission ────────────────────
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('workflows:delete')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.workflowsService.delete(id, req.user.orgId as string);
  }
}
