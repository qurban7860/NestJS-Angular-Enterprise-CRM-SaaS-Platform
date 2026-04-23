/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { WorkflowTrigger, WorkflowActionType } from '@prisma/client';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('deal.stage_changed')
  async handleDealStageChanged(payload: {
    dealId: string;
    orgId: string;
    newStage: string;
  }) {
    this.logger.log(
      `Processing workflow for deal ${payload.dealId} stage change to ${payload.newStage}`,
    );

    // Find active rules for this trigger
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const rules = await this.prisma.workflowRule.findMany({
      where: {
        orgId: payload.orgId,
        trigger: WorkflowTrigger.DEAL_STAGE_CHANGED,
        isActive: true,
      },
      include: { actions: true },
    });

    for (const rule of rules) {
      // Evaluate conditions (simplified)
      // rule.conditions might be { "stage": "CLOSED_WON" }
      const conditions = rule.conditions as any;
      if (conditions.stage && conditions.stage !== payload.newStage) {
        continue;
      }

      await this.executeActions(rule.actions, payload);
    }
  }

  private async executeActions(actions: any[], context: any) {
    for (const action of actions) {
      switch (action.type) {
        case WorkflowActionType.CREATE_TASK:
          await this.prisma.task.create({
            data: {
              title: action.config.taskTitle || 'Workflow Generated Task',
              orgId: context.orgId,
              creatorId: 'SYSTEM', // Or a dedicated system user ID
              dealId: context.dealId,
              status: 'TODO',
            },
          });
          break;

        case WorkflowActionType.SEND_NOTIFICATION:
          this.logger.log(
            `Workflow: Sending notification ${action.config.message}`,
          );
          // Integration with NotificationsService would go here
          break;

        case WorkflowActionType.EXTERNAL_WEBHOOK:
          this.logger.log(
            `Workflow: Triggering webhook to ${action.config.url}`,
          );
          break;
      }
    }
  }
}
