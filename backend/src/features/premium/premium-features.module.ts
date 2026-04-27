import { Module } from '@nestjs/common';
import { CustomRolesService } from './application/services/custom-roles.service';
import { WorkflowsService } from './application/services/workflows.service';
import { ReportsService } from './application/services/reports.service';
import { WorkflowEngineService } from './application/services/workflow-engine.service';
import { CustomRolesController } from './presentation/controllers/custom-roles.controller';
import { WorkflowsController } from './presentation/controllers/workflows.controller';
import { ReportsController } from './presentation/controllers/reports.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [CustomRolesController, WorkflowsController, ReportsController],
  providers: [
    CustomRolesService,
    WorkflowsService,
    ReportsService,
    WorkflowEngineService,
  ],
  exports: [
    CustomRolesService,
    WorkflowsService,
    ReportsService,
    WorkflowEngineService,
  ],
})
export class PremiumFeaturesModule {}
