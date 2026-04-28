/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    const raw = await this.prisma.task.findUnique({ 
      where: { id },
      include: { assignee: true }
    });
    if (!raw) return null;
    return this.mapToTask(raw);
  }

  async findByOrgId(orgId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { 
        orgId,
        isDeleted: false
      },
      include: { assignee: true },
      orderBy: { createdAt: 'desc' }
    });

    return raws.map(raw => this.mapToTask(raw));
  }

  async findByAssigneeId(orgId: string, assigneeId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { orgId, assigneeId, isDeleted: false },
      include: { assignee: true },
      orderBy: { createdAt: 'desc' }
    });

    return raws.map(raw => this.mapToTask(raw));
  }

  async findByContactId(orgId: string, contactId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { orgId, contactId, isDeleted: false } as any,
      include: { assignee: true },
      orderBy: { createdAt: 'desc' }
    });

    return raws.map(raw => this.mapToTask(raw));
  }

  async findByDealId(orgId: string, dealId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { orgId, dealId, isDeleted: false } as any,
      include: { assignee: true },
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
      contactId: raw.contactId || undefined,
      dealId: raw.dealId || undefined,
      tags: raw.tags,
      checklist: (raw.checklist as any[]) || [],
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
      contactId: task.contactId,
      dealId: task.dealId,
      tags: task.tags,
      checklist: task.checklist,
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
