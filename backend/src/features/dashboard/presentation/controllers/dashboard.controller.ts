import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';
import { DashboardStatsDto } from '../../application/dtos/dashboard-stats.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getStatsUseCase: GetDashboardStatsUseCase) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  async getStats(@CurrentUser() user: any) {
    const result = await this.getStatsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }
}
