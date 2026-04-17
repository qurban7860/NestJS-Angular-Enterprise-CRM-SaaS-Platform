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
  assigneeId?: string;
  dueDate?: Date | null;
  contactId?: string;
  dealId?: string;
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

    return Result.ok(dto);
  }
}
