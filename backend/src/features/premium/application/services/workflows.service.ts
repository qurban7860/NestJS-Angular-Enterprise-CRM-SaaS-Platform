/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { WorkflowTrigger, WorkflowActionType } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.workflowRule.findMany({
      where: { orgId },
      include: { actions: true },
    });
  }

  create(
    orgId: string,
    data: {
      name: string;
      trigger: WorkflowTrigger;
      conditions?: any;
      actions: { type: WorkflowActionType; config: any; order: number }[];
    },
  ) {
    const { actions, ...ruleData } = data;
    return this.prisma.workflowRule.create({
      data: {
        ...ruleData,
        orgId,
        actions: {
          create: actions,
        },
      },
      include: { actions: true },
    });
  }

  async toggleActive(id: string, orgId: string, isActive: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rule = await this.prisma.workflowRule.findFirst({
      where: { id, orgId },
    });
    if (!rule) throw new NotFoundException('Workflow rule not found');

    return this.prisma.workflowRule.update({
      where: { id },
      data: { isActive },
    });
  }

  async delete(id: string, orgId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rule = await this.prisma.workflowRule.findFirst({
      where: { id, orgId },
    });
    if (!rule) throw new NotFoundException('Workflow rule not found');

    return this.prisma.workflowRule.delete({ where: { id } });
  }
}
