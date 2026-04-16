import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskResponseDto } from '../dtos/task.dto';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ListTasksUseCase implements UseCase<string, TaskResponseDto[]> {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(orgId: string): Promise<Result<TaskResponseDto[]>> {
    const tasks = await this.taskRepo.findByOrgId(orgId);
    
    return Result.ok<TaskResponseDto[]>(
      tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt!,
      }))
    );
  }
}
