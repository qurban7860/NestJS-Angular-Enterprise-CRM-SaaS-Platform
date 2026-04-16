import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskCommentRepository } from '../../domain/repositories/task-comment.repository.interface';
import { TaskComment } from '../../domain/entities/task-comment.entity';
import { CreateCommentDto, CommentResponseDto } from '../dtos/comment.dto';
import type { ITaskRepository } from '../../domain/repositories/task.repository.interface';

@Injectable()
export class CreateTaskCommentUseCase implements UseCase<any, CommentResponseDto> {
  constructor(
    @Inject('ITaskCommentRepository') private readonly commentRepo: ITaskCommentRepository,
    @Inject('ITaskRepository') private readonly taskRepo: ITaskRepository,
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
