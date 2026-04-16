import { Injectable } from '@nestjs/common';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    const raw = await this.prisma.task.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToTask(raw);
  }

  async findByOrgId(orgId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { 
        orgId,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return raws.map(raw => this.mapToTask(raw));
  }

  async findByAssignee(userId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { assigneeId: userId, isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });

    return raws.map(raw => this.mapToTask(raw));
  }

  private mapToTask(raw: any): Task {
    return Task.create({
      title: raw.title,
      description: raw.description || undefined,
      status: raw.status as any,
      priority: raw.priority as any,
      orgId: raw.orgId,
      assigneeId: raw.assigneeId || undefined,
      creatorId: raw.creatorId,
      dueDate: raw.dueDate || undefined,
      completedAt: raw.completedAt || undefined,
      relatedContactId: raw.relatedContactId || undefined,
      relatedDealId: raw.relatedDealId || undefined,
      tags: raw.tags,
      isDeleted: raw.isDeleted,
      version: raw.version,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }, raw.id).getValue();
  }

  async save(task: Task): Promise<void> {
    const data = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      orgId: task.orgId,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      relatedContactId: task.relatedContactId,
      relatedDealId: task.relatedDealId,
      tags: task.tags,
      isDeleted: task.isDeleted,
      version: { increment: 1 },
    };

    await this.prisma.task.upsert({
      where: { id: task.id },
      update: data,
      create: { ...data, id: task.id, version: 0 },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
