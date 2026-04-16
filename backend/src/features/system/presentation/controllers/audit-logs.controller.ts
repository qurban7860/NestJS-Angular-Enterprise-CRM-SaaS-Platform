import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from '../../../../core/infrastructure/audit/audit.service';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('System')
@ApiBearerAuth()
@Controller('system/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated audit logs for the organization (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  async getLogs(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.auditService.findByOrg(user.orgId, page, Math.min(limit, 100));
  }
}
