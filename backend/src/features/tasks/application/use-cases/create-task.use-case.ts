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
      version: 0,
      isDeleted: false,
    });

    if (taskOrError.isFailure) {
      return Result.fail<TaskResponseDto>(taskOrError.error!);
    }

    const task = taskOrError.getValue();
    await this.taskRepo.save(task);

    // Fetch the task with relations
    const savedTask = await this.taskRepo.findById(task.id);
    if (!savedTask) return Result.fail<TaskResponseDto>("Failed to retrieve created task");

    // Emit Real-time Notification if assigned to someone else
    if (savedTask.assigneeId && savedTask.assigneeId !== savedTask.creatorId) {
      this.notificationsGateway.sendToUser(savedTask.assigneeId, 'notification', {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${savedTask.title}`,
        type: 'TASK_ASSIGNED',
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
