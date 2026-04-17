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

    return Result.ok(dto);
  }
}
