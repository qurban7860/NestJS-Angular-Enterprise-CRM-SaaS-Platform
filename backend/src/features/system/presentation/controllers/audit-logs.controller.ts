import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from '../../../../core/infrastructure/audit/audit.service';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { PermissionsGuard } from '../../../rbac/presentation/guards/permissions.guard';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';

@ApiTags('System')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
@Controller('system/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('system:audit' as any)
  @ApiOperation({
    summary: 'Get paginated audit logs for the organization (Admin only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  async getLogs(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.auditService.findByOrg(user.orgId, page, Math.min(limit, 100));
  }
}
