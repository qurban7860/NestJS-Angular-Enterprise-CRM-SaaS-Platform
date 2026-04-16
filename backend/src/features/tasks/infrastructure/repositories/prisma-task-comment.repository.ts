import { Injectable } from '@nestjs/common';
import { ITaskCommentRepository } from '../../domain/repositories/task-comment.repository.interface';
import { TaskComment } from '../../domain/entities/task-comment.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaTaskCommentRepository implements ITaskCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TaskComment | null> {
    const raw = await this.prisma.taskComment.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findByTaskId(taskId: string): Promise<TaskComment[]> {
    const raws = await this.prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });
    return raws.map(raw => this.mapToEntity(raw));
  }

  async save(comment: TaskComment): Promise<void> {
    const data = {
      taskId: comment.taskId,
      authorId: comment.authorId,
      content: comment.content,
      updatedAt: comment.updatedAt,
    };

    await this.prisma.taskComment.upsert({
      where: { id: comment.id },
      update: data,
      create: { ...data, id: comment.id, createdAt: comment.createdAt },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.taskComment.delete({ where: { id } });
  }

  private mapToEntity(raw: any): TaskComment {
    const comment = TaskComment.create({
      taskId: raw.taskId,
      authorId: raw.authorId,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }, raw.id).getValue();

    if (raw.author) {
      (comment as any).author = raw.author;
    }

    return comment;
  }
}
