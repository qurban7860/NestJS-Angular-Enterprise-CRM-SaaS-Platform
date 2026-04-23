import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CustomRolesService } from '../../application/services/custom-roles.service';
import { RequirePlan } from '../../../../core/presentation/decorators/require-plan.decorator';
import { SubscriptionPlan } from '@prisma/client';

@Controller('premium/roles')
@RequirePlan(SubscriptionPlan.PREMIUM)
export class CustomRolesController {
  constructor(private readonly rolesService: CustomRolesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.rolesService.findAll(req.user.orgId);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    return this.rolesService.create(req.user.orgId, data);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.rolesService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.rolesService.delete(id, req.user.orgId);
  }
}
