/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskResponseDto } from '../dtos/task.dto';
import { Task } from '../../domain/entities/task.entity';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ListTasksUseCase implements UseCase<{ orgId: string; filters?: any }, TaskResponseDto[]> {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(request: { orgId: string; filters?: any }): Promise<Result<TaskResponseDto[]>> {
    let tasks: Task[];

    if (request.filters?.assigneeId) {
      tasks = await this.taskRepo.findByAssigneeId(request.orgId, request.filters.assigneeId);
    } else if (request.filters?.contactId) {
      tasks = await this.taskRepo.findByContactId(request.orgId, request.filters.contactId);
    } else if (request.filters?.dealId) {
      tasks = await this.taskRepo.findByDealId(request.orgId, request.filters.dealId);
    } else {
      tasks = await this.taskRepo.findByOrgId(request.orgId);
    }
    
    return Result.ok<TaskResponseDto[]>(
      tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        contactId: task.contactId,
        dealId: task.dealId,
        dueDate: task.dueDate,
        assignee: (task as any).assignee ? {
          id: (task as any).assignee.id,
          firstName: (task as any).assignee.firstName,
          lastName: (task as any).assignee.lastName,
          fullName: `${(task as any).assignee.firstName} ${(task as any).assignee.lastName}`
        } : undefined,
        contact: (task as any).contact ? {
          id: (task as any).contact.id,
          firstName: (task as any).contact.firstName,
          lastName: (task as any).contact.lastName,
          fullName: `${(task as any).contact.firstName} ${(task as any).contact.lastName}`
        } : undefined,
        deal: (task as any).deal ? {
          id: (task as any).deal.id,
          title: (task as any).deal.title,
        } : undefined,
        createdAt: task.createdAt!,
      }))
    );
  }
}
