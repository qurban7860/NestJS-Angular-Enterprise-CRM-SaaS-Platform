import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Notification | null> {
    const raw = await this.prisma.notification.findUnique({ where: { id } });
    if (!raw) return null;

    return Notification.create({
      recipientId: raw.recipientId,
      type: raw.type as any,
      channel: raw.channel as any,
      title: raw.title,
      body: raw.body,
      metadata: raw.metadata as Record<string, any>,
      isRead: raw.isRead,
      readAt: raw.readAt || undefined,
      createdAt: raw.createdAt,
    }, raw.id).getValue();
  }

  async findUnreadByRecipient(recipientId: string): Promise<Notification[]> {
    const raws = await this.prisma.notification.findMany({
      where: { recipientId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });

    return raws.map(raw => Notification.create({
      recipientId: raw.recipientId,
      type: raw.type as any,
      channel: raw.channel as any,
      title: raw.title,
      body: raw.body,
      metadata: raw.metadata as Record<string, any>,
      isRead: raw.isRead,
      readAt: raw.readAt || undefined,
      createdAt: raw.createdAt,
    }, raw.id).getValue());
  }

  async save(notification: Notification): Promise<void> {
    const data = {
      recipientId: notification.recipientId,
      type: notification.type,
      channel: notification.channel,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      isRead: notification.isRead,
      readAt: notification.readAt,
    };

    await this.prisma.notification.upsert({
      where: { id: notification.id },
      update: data,
      create: { ...data, id: notification.id },
    });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
