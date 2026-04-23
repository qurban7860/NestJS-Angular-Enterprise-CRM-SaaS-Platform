/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ReportsService } from '../../application/services/reports.service';
import { RequirePlan } from '../../../../core/presentation/decorators/require-plan.decorator';
import { SubscriptionPlan } from '@prisma/client';

@Controller('premium/reports')
@RequirePlan(SubscriptionPlan.PREMIUM)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.reportsService.findAll(req.user.orgId);
  }

  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.reportsService.create(req.user.orgId, req.user.id, data);
  }

  @Get(':id/run')
  async run(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.runReport(id, req.user.orgId);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.delete(id, req.user.orgId);
  }
}
