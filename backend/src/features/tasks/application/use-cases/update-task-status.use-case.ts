import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskResponseDto } from '../dtos/task.dto';
import { TaskStatus } from '../../domain/entities/task.entity';
import { Injectable, Inject } from '@nestjs/common';
import { NotificationsGateway } from '../../../notifications/infrastructure/gateways/notifications.gateway';

export interface UpdateTaskStatusRequest {
  taskId: string;
  orgId: string;
  status: TaskStatus;
}

@Injectable()
export class UpdateTaskStatusUseCase implements UseCase<UpdateTaskStatusRequest, TaskResponseDto> {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
    private readonly notificationsGateway: NotificationsGateway,
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

    // Fetch the task with relations
    const savedTask = await this.taskRepo.findById(task.id);
    if (!savedTask) return Result.fail<TaskResponseDto>("Failed to retrieve updated task");

    // Notify creator if task is completed by someone else
    if (request.status === 'DONE' && savedTask.creatorId !== savedTask.assigneeId) {
      this.notificationsGateway.sendToUser(savedTask.creatorId, 'notification', {
        title: 'Task Completed',
        message: `Task "${savedTask.title}" has been marked as completed.`,
        type: 'TASK_COMPLETED',
        data: { taskId: savedTask.id }
      });
    }

    return Result.ok<TaskResponseDto>({
      id: savedTask.id,
      title: savedTask.title,
      status: savedTask.status,
      priority: savedTask.priority,
      assigneeId: savedTask.assigneeId,
      contactId: savedTask.contactId,
      dealId: savedTask.dealId,
      dueDate: savedTask.dueDate,
      assignee: (savedTask as any).assignee ? {
        id: (savedTask as any).assignee.id,
        firstName: (savedTask as any).assignee.firstName,
        lastName: (savedTask as any).assignee.lastName,
        fullName: `${(savedTask as any).assignee.firstName} ${(savedTask as any).assignee.lastName}`
      } : undefined,
      contact: (savedTask as any).contact ? {
        id: (savedTask as any).contact.id,
        firstName: (savedTask as any).contact.firstName,
        lastName: (savedTask as any).contact.lastName,
        fullName: `${(savedTask as any).contact.firstName} ${(savedTask as any).contact.lastName}`
      } : undefined,
      deal: (savedTask as any).deal ? {
        id: (savedTask as any).deal.id,
        title: (savedTask as any).deal.title,
      } : undefined,
      createdAt: savedTask.createdAt!,
    });
  }
}
