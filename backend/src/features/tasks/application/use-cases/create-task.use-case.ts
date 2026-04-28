import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { CreateTaskDto, TaskResponseDto } from '../dtos/task.dto';
import { Task, TaskPriority } from '../../domain/entities/task.entity';
import { Injectable, Inject } from '@nestjs/common';
import { NotificationsGateway } from '../../../notifications/infrastructure/gateways/notifications.gateway';

@Injectable()
export class CreateTaskUseCase implements UseCase<CreateTaskDto, TaskResponseDto> {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async execute(request: CreateTaskDto): Promise<Result<TaskResponseDto>> {
    const taskOrError = Task.create({
      title: request.title,
      description: request.description,
      priority: (request.priority as TaskPriority) ?? 'MEDIUM',
      status: 'TODO',
      orgId: request.orgId,
      assigneeId: request.assigneeId,
      creatorId: request.creatorId,
      dueDate: request.dueDate,
      contactId: request.contactId,
      dealId: request.dealId,
      tags: [],
      checklist: request.checklist || [],
      version: 0,
      isDeleted: false,
    });

    if (taskOrError.isFailure) {
      return Result.fail<TaskResponseDto>(taskOrError.error!);
    }

    const task = taskOrError.getValue();
    await this.taskRepo.save(task);

    // Emit Real-time Notification if assigned to someone else
    if (task.assigneeId && task.assigneeId !== task.creatorId) {
      this.notificationsGateway.sendToUser(task.assigneeId, 'notification', {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        type: 'TASK_ASSIGNED',
        data: { taskId: task.id }
      });
    }

    return Result.ok<TaskResponseDto>({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      contactId: task.contactId,
      dealId: task.dealId,
      checklist: task.checklist,
      createdAt: task.createdAt!,
    });
  }
}
