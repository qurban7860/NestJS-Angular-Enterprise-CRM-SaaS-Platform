import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ITaskCommentRepository } from '../../domain/repositories/task-comment.repository.interface';
import { CommentResponseDto } from '../dtos/comment.dto';

@Injectable()
export class ListTaskCommentsUseCase implements UseCase<string, CommentResponseDto[]> {
  constructor(
    @Inject('ITaskCommentRepository') private readonly commentRepo: ITaskCommentRepository,
  ) {}

  async execute(taskId: string): Promise<Result<CommentResponseDto[]>> {
    const comments = await this.commentRepo.findByTaskId(taskId);
    
    return Result.ok<CommentResponseDto[]>(comments.map(c => ({
      id: c.id,
      taskId: c.taskId,
      authorId: c.authorId,
      authorName: (c as any).author ? `${(c as any).author.firstName} ${(c as any).author.lastName}` : 'Unknown User',
      content: c.content,
      createdAt: c.createdAt,
    })));
  }
}
