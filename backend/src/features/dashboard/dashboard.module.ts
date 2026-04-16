import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { CrmModule } from '../crm/crm.module';
import { TasksModule } from '../tasks/tasks.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CrmModule, TasksModule],
  controllers: [DashboardController],
  providers: [GetDashboardStatsUseCase],
})
export class DashboardModule {}
