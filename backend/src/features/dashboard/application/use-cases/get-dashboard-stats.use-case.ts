/* eslint-disable prettier/prettier */
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../../crm/domain/repositories/crm.repository.interface';
import type { ITaskRepository } from '../../../tasks/domain/repositories/task.repository.interface';
import { DashboardStatsDto, ActivityItemDto } from '../dtos/dashboard-stats.dto';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class GetDashboardStatsUseCase implements UseCase<string, DashboardStatsDto> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(orgId: string): Promise<Result<DashboardStatsDto>> {
    const [contacts, deals, tasks] = await Promise.all([
      this.crmRepo.findContactsByOrgId(orgId),
      this.crmRepo.findDealsByOrgId(orgId),
      this.taskRepo.findByOrgId(orgId),
    ]);

    // Calculate Metrics
    const activeDeals = deals.filter(d => d.status !== 'CLOSED_LOST' && d.status !== 'CLOSED_WON');
    const totalValue = deals.reduce((sum, d) => sum + d.valueAmount, 0);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Aggregate Activity Feed
    const activity: ActivityItemDto[] = [
      ...contacts.map(c => ({
        id: c.id,
        type: 'CONTACT',
        action: 'Added new contact',
        label: `${c.firstName} ${c.lastName}`,
        timestamp: c.createdAt!,
      })),
      ...deals.map(d => ({
        id: d.id,
        type: 'DEAL',
        action: 'Created deal',
        label: d.title,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: d.createdAt!,
        metadata: { value: d.valueAmount }
      })),
      ...tasks.map(t => ({
        id: t.id,
        type: 'TASK',
        action: 'Task assigned',
        label: t.title,
        timestamp: t.createdAt!,
      }))
    ];

    // Sort by most recent and take top 10
    const recentActivity = activity
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return Result.ok<DashboardStatsDto>({
      totalContacts: contacts.length,
      activeDealsCount: activeDeals.length,
      totalDealValue: totalValue,
      taskCompletionRate: Math.round(taskCompletionRate),
      recentActivity,
    });
  }
}
