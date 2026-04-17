import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as taskRepositoryInterface from '../../domain/repositories/task.repository.interface';

export interface DeleteTaskRequest {
  id: string;
  orgId: string;
}

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepo: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(req: DeleteTaskRequest): Promise<Result<void>> {
    const task = await this.taskRepo.findById(req.id);
    if (!task || task.orgId !== req.orgId || task.isDeleted) {
      return Result.fail('Task not found or access denied');
    }

    task.delete();
    await this.taskRepo.save(task);

    return Result.ok();
  }
}
