import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CustomRolesService } from '../../application/services/custom-roles.service';
import { FeatureQuotaGuard } from '../../../rbac/presentation/guards/feature-quota.guard';
import { PermissionsGuard } from '../../../rbac/presentation/guards/permissions.guard';
import { CheckQuota } from '../../../rbac/presentation/decorators/check-quota.decorator';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';

// ─────────────────────────────────────────────────────────────────────────────
// CustomRolesController
//
// Freemium model (replaces hard PREMIUM gate):
//   GET    /premium/roles           → open to all authenticated users
//   POST   /premium/roles           → @CheckQuota('custom_roles') — FREE ≤ 2
//   PATCH  /premium/roles/:id       → @RequirePermissions('roles:write')
//   DELETE /premium/roles/:id       → @RequirePermissions('roles:delete')
//   PATCH  /premium/roles/:id/assign/:userId → ADMIN-only role assignment
// ─────────────────────────────────────────────────────────────────────────────

@Controller('premium/roles')
export class CustomRolesController {
  constructor(private readonly rolesService: CustomRolesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.rolesService.findAll(req.user.orgId as string);
  }
  @Post()
  @UseGuards(FeatureQuotaGuard)
  @CheckQuota('custom_roles')
  create(@Req() req: any, @Body() data: any) {
    return this.rolesService.create(req.user.orgId as string, data);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:write')
  update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.rolesService.update(id, req.user.orgId as string, data);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:delete')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.rolesService.delete(id, req.user.orgId as string);
  }

  @Patch(':roleId/assign/:userId')
  assignRole(
    @Req() req: any,
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only organisation admins can assign roles to users.');
    }
    return this.rolesService.assignRoleToUser(
      roleId,
      userId,
      req.user.orgId as string,
    );
  }

  // ── Unassign role from a user: ADMIN-only ─────────────────────────────────
  @Delete('unassign/:userId')
  unassignRole(@Req() req: any, @Param('userId') userId: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only organisation admins can unassign roles.');
    }
    return this.rolesService.unassignRoleFromUser(
      userId,
      req.user.orgId as string,
    );
  }
}

