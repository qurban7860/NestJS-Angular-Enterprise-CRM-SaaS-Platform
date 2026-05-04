import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as taskRepositoryInterface from '../../domain/repositories/task.repository.interface';
import { TaskResponseDto } from '../dtos/task.dto';

export interface GetTaskRequest {
  id: string;
  orgId: string;
}

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(req: GetTaskRequest): Promise<Result<TaskResponseDto>> {
    const task = await this.taskRepo.findById(req.id);
    if (!task || task.orgId !== req.orgId || task.isDeleted) {
      return Result.fail('Task not found or access denied');
    }

    const dto = new TaskResponseDto();
    dto.id = task.id;
    dto.title = task.title;
    dto.status = task.status;
    dto.priority = task.priority;
    dto.assigneeId = task.assigneeId;
    dto.contactId = task.contactId;
    dto.dealId = task.dealId;
    dto.dueDate = task.dueDate;
    dto.createdAt = task.createdAt || new Date();

    if ((task as any).assignee) {
      dto.assignee = {
        id: (task as any).assignee.id,
        firstName: (task as any).assignee.firstName,
        lastName: (task as any).assignee.lastName,
        fullName: `${(task as any).assignee.firstName} ${(task as any).assignee.lastName}`
      };
    }

    if ((task as any).contact) {
      dto.contact = {
        id: (task as any).contact.id,
        firstName: (task as any).contact.firstName,
        lastName: (task as any).contact.lastName,
        fullName: `${(task as any).contact.firstName} ${(task as any).contact.lastName}`
      };
    }

    if ((task as any).deal) {
      dto.deal = {
        id: (task as any).deal.id,
        title: (task as any).deal.title,
      };
    }

    return Result.ok(dto);
  }
}
