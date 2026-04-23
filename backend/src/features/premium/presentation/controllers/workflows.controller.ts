import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { WorkflowsService } from '../../application/services/workflows.service';
import { RequirePlan } from '../../../../core/presentation/decorators/require-plan.decorator';
import { SubscriptionPlan } from '@prisma/client';

@Controller('premium/workflows')
@RequirePlan(SubscriptionPlan.PREMIUM)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.workflowsService.findAll(req.user.orgId);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    return this.workflowsService.create(req.user.orgId, data);
  }

  @Post(':id/toggle')
  async toggle(@Req() req: any, @Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.workflowsService.toggleActive(id, req.user.orgId, isActive);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.workflowsService.delete(id, req.user.orgId);
  }
}
