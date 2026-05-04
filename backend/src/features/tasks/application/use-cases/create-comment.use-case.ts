import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskCommentRepository } from '../../domain/repositories/task-comment.repository.interface';
import { TaskComment } from '../../domain/entities/task-comment.entity';
import { CreateCommentDto, CommentResponseDto } from '../dtos/comment.dto';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';

import { NotificationService } from '../../../notifications/application/services/notification.service';

@Injectable()
export class CreateTaskCommentUseCase implements UseCase<any, CommentResponseDto> {
  constructor(
    @Inject('ITaskCommentRepository') private readonly commentRepo: ITaskCommentRepository,
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(request: { taskId: string; authorId: string; content: string }): Promise<Result<CommentResponseDto>> {
    // 1. Check if task exists
    const task = await this.taskRepo.findById(request.taskId);
    if (!task) return Result.fail<CommentResponseDto>("Task not found");

    // 2. Create comment
    const commentOrError = TaskComment.create({
      taskId: request.taskId,
      authorId: request.authorId,
      content: request.content,
    });

    if (commentOrError.isFailure) {
      return Result.fail<CommentResponseDto>(commentOrError.error!);
    }

    const comment = commentOrError.getValue();
    await this.commentRepo.save(comment);

    const authorId = String(request.authorId);
    const assigneeId = task.assigneeId ? String(task.assigneeId) : null;
    const creatorId = task.creatorId ? String(task.creatorId) : null;

    // Notify assignee if someone else commented
    if (assigneeId && assigneeId !== authorId) {
      await this.notificationService.notify({
        recipientId: assigneeId,
        type: 'COMMENT_ADDED' as any,
        title: 'New Comment on Task',
        body: `A new comment was added to "${task.title}"`,
        metadata: { taskId: task.id, commentId: comment.id }
      });
    }

    // Notify creator if someone else commented (and creator is not already the assignee)
    if (creatorId && creatorId !== authorId && creatorId !== assigneeId) {
      await this.notificationService.notify({
        recipientId: creatorId,
        type: 'COMMENT_ADDED' as any, 
        title: 'New Comment on Task',
        body: `A new comment was added to a task you created "${task.title}"`,
        metadata: { taskId: task.id, commentId: comment.id }
      });
    }
    return Result.ok<CommentResponseDto>({
      id: comment.id,
      taskId: comment.taskId,
      authorId: comment.authorId,
      authorName: "You", // This will be enriched by the list/get if needed
      content: comment.content,
      createdAt: comment.createdAt,
    });
  }
}
