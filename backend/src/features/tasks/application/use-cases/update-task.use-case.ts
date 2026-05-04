/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as taskRepositoryInterface from '../../domain/repositories/task.repository.interface';
import { TaskResponseDto } from '../dtos/task.dto';

export interface UpdateTaskRequest {
  id: string;
  orgId: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: Date | null;
  contactId?: string | null;
  dealId?: string | null;
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(req: UpdateTaskRequest): Promise<Result<TaskResponseDto>> {
    const task = await this.taskRepo.findById(req.id);
    if (!task || task.orgId !== req.orgId || task.isDeleted) {
      return Result.fail('Task not found or access denied');
    }

    task.update({
      title: req.title,
      description: req.description,
      status: req.status as any,
      priority: req.priority as any,
      assigneeId: req.assigneeId,
      dueDate: req.dueDate,
      contactId: req.contactId,
      dealId: req.dealId,
    });

    await this.taskRepo.save(task);

    // Fetch the task with relations
    const savedTask = await this.taskRepo.findById(task.id);
    if (!savedTask) return Result.fail<TaskResponseDto>("Failed to retrieve updated task");

    const dto = new TaskResponseDto();
    dto.id = savedTask.id;
    dto.title = savedTask.title;
    dto.status = savedTask.status;
    dto.priority = savedTask.priority;
    dto.assigneeId = savedTask.assigneeId;
    dto.contactId = savedTask.contactId;
    dto.dealId = savedTask.dealId;
    dto.dueDate = savedTask.dueDate;
    dto.createdAt = savedTask.createdAt || new Date();

    if ((savedTask as any).assignee) {
      dto.assignee = {
        id: (savedTask as any).assignee.id,
        firstName: (savedTask as any).assignee.firstName,
        lastName: (savedTask as any).assignee.lastName,
        fullName: `${(savedTask as any).assignee.firstName} ${(savedTask as any).assignee.lastName}`
      };
    }

    if ((savedTask as any).contact) {
      dto.contact = {
        id: (savedTask as any).contact.id,
        firstName: (savedTask as any).contact.firstName,
        lastName: (savedTask as any).contact.lastName,
        fullName: `${(savedTask as any).contact.firstName} ${(savedTask as any).contact.lastName}`
      };
    }

    if ((savedTask as any).deal) {
      dto.deal = {
        id: (savedTask as any).deal.id,
        title: (savedTask as any).deal.title,
      };
    }

    return Result.ok(dto);
  }
}
