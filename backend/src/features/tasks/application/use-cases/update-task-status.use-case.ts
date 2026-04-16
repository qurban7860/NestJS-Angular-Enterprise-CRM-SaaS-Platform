import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskResponseDto } from '../dtos/task.dto';
import { TaskStatus } from '../../domain/entities/task.entity';
import { Injectable, Inject } from '@nestjs/common';

export interface UpdateTaskStatusRequest {
  taskId: string;
  orgId: string;
  status: TaskStatus;
}

@Injectable()
export class UpdateTaskStatusUseCase implements UseCase<UpdateTaskStatusRequest, TaskResponseDto> {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(request: UpdateTaskStatusRequest): Promise<Result<TaskResponseDto>> {
    const task = await this.taskRepo.findById(request.taskId);

    if (!task) {
      return Result.fail<TaskResponseDto>("Task not found");
    }

    if (task.orgId !== request.orgId) {
      return Result.fail<TaskResponseDto>("Unauthorized to modify this task");
    }

    task.updateStatus(request.status);

    await this.taskRepo.save(task);

    return Result.ok<TaskResponseDto>({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt!,
    });
  }
}
